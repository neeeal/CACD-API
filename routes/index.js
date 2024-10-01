const express = require("express");
const router = express.Router();

// Use the routes
const initRoutes = (app) => {
  router.use("/user", require("./user"));
  return app.use("/api", router);
};

module.exports = initRoutes;
