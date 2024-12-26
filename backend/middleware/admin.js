jwt = require("jsonwebtoken");

const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
  const decoded = req.headers.authorization;
  if (!decoded || !decoded.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }
  const token = decoded.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
    if (decoded.id) {
      req.id = decoded.id;
      next();
    } else {
      return res.status(403).json({ msg: "Invalid token" });
    }
  } catch (e) {
    return res.status(403).json({ msg: "Invalid token" });
  }
}

module.exports = adminMiddleware;
