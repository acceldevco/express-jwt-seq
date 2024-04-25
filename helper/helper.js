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

module.exports = {generateAccessToken,authenticateToken}