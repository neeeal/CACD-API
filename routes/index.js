const express = require("express");
const router = express.Router();

// Use the routes
const initRoutes = (app) => {
  router.use("/user", require("./user.js"));
  router.use("/auth", require("./auth.js"));
  router.use("/church", require("./church.js"));
  router.use("/event", require("./event.js"));
  router.use("/photo", require("./photo.js"));
  router.use("/team", require("./team.js"));
  router.use("/album", require("./album.js"));
  router.use("/company", require("./company.js"));
  return app.use("/api", router);
};

module.exports = initRoutes;
