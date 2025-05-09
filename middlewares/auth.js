
const jwt = require('jsonwebtoken');
const RolePermissionsCol = require("../models/rolePermissions.js");
const PermissionsCol = require("../models/permissions.js");
const SECRET_KEY_ACCESS_TOKEN = process.env.SECRET_KEY_ACCESS_TOKEN;

exports.authorizeAccess = (requiredRolePermission = null, isPublicRoute = false) => {
  return async (req, res, next) => {
    // If this is a public route that doesn't need authentication, skip token verification
    if (isPublicRoute) {
      // Set a guest user object for consistency with other middleware
      req.user = {
        isGuest: true,
        role: 'guest',
        permissions: []
      };
      return next();
    }

    // For protected routes, continue with token verification
    let token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    
    if (!token) {
      return res.status(401).send({ error: "Access token required" });
    }

    // Verify the provided token
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY_ACCESS_TOKEN);
      if (decoded.type !== 'access'){
        throw new Error("Invalid token type");
      }
    } catch (err) {
      console.error(err.stack);
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({ error: "Token expired, please refresh your session" });
      }
      if(err.message.includes("Invalid token type")){
        return res.status(403).send({ error: "Invalid token type" });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // Verify user permission
    try {
      if (requiredRolePermission) {
        console.log({ deletedAt: null, name: requiredRolePermission});
        const permission = await PermissionsCol.findOne({ 
          deletedAt: null, 
          name: requiredRolePermission
        }).lean();
        
        console.log(decoded);
        const query = {
          role: decoded.role,
          permission: permission._id,
          company: decoded.company,
          deletedAt: null,
        };
        
        console.log(query);
        const rolePermissions = await RolePermissionsCol.findOne(query);
        console.log(rolePermissions);
        
        if (!rolePermissions) {
          throw new Error("User does not have permission. Unauthorized.");
        }
      }
    } catch (err) {
      console.error(err.stack);
      if(err.message.includes("User does not have permission.")) {
        return res.status(403).send({ error: err.message });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // Add user information to the request for use in the next middleware or function
    req.user = {
      ...decoded,
      isGuest: false
    };

    console.log('decoded');
    console.log(decoded);
    console.log('decoded');

    // Proceed to the next middleware or controller
    next();
  };
};

exports.authorizeSuperAdmin = async (requiredRolePermission = null) => {
  return async (req, res, next) => {
    console.log(req.user)

    const permission = await PermissionsCol.findOne({ deletedAt: null, name: requiredRolePermission}).lean();
    const role = req.user?.role;

    if (role !== '') {
      return res.status(403).send({ error: "Unauthorized" });
    }

    next();
  }
};