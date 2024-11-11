
const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;

exports.accessResource = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "Access token required" });
  }

  try {
    // Verify the provided token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);

    console.log(decoded);
    
    // Add user information to the request for use in the next middleware or function
    req.user = {
      userOid: decoded.userOid,
      name: decoded.name,
      email: decoded.email,
      accessLevel: decoded.accessLevel,
      company: decoded.company,
      token: token
    };

    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    console.error(err.stack);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).send({ error: "Token expired, please refresh your session" });
    }

    return res.status(403).send({ error: "Invalid token" });
  }
};
