const mongoose = require("mongoose");

const dbConnection = async () => {
    mongoose
    .connect(process.env.ATLAS_URI)
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
};
module.exports = dbConnection;