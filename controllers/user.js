const User = require("../models/user.js");

exports.get = async (req, res) => {
    const data = await User.find();
    console.log(data);
    res.status(200).send({
        message: "User Controller",
        data: data
    })
}