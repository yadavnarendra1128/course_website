const jwt = require("jsonwebtoken");

const { JWT_USER_PASSWORD } = require("../config");

function userMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_USER_PASSWORD);
    if (decoded.id) {
      req.id = decoded.id;
      next();
    }else{
      return res.status(403).json({ msg: "Invalid token" });
    }
  } catch (e) {return res.status(403).json({msg: "Invalid token"})}
}
module.exports = userMiddleware;
