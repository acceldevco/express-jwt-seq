var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
let refreshTokens = [];
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
/////////////////////////
const posts = [
  {
    name: "reza",
  },
];
app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts);
});
//////////////////////////
app.get("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});
///////////////////////////
app.post("/token", (req, res) => {
  const refreshtokens = req.body.token;

  if (refreshtokens == null) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshtokens)) return res.sendStatus(403);

  jwt.verify(refreshtokens, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});
///////////////////////////
app.delete("/logout", (req, res) => {
  refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});
function authenticateToken(req, res, next) {
  console.log(req.headers["authorization"]);
  const Headers = req.headers["authorization"];

  const token = Headers && Headers.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15h" });
}
module.exports = app;
