
const jwt = require('jsonwebtoken');
const SECRET_KEY_ACCESS_TOKEN = process.env.SECRET_KEY_ACCESS_TOKEN;

exports.accessResource = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "Access token required" });
  }

  try {
    // Verify the provided token
    const decoded = jwt.verify(token, SECRET_KEY_ACCESS_TOKEN);

    if (decoded.type !== 'access'){
      return res.status(403).send({ error: "Invalid token type" });
    }

    console.log('decoded');
    console.log(decoded);
    console.log('decoded');
    
    // Add user information to the request for use in the next middleware or function
    req.user = {
      ...decoded
    };

    req.body.company = decoded.company;

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

exports.authorizeSuperAdmin = async (req, res, next) => {
  const accessLevel = req.user && req.user.accessLevel;

  if (accessLevel !== 'Super Admin') {
    return res.status(403).send({ error: "Unauthorized" });
  }

  next();
};