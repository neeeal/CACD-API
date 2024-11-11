const TokensCol = require("../models/tokens.js");
const userHelper = require("../helpers/userHelper.js");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;

exports.login = async (req, res) => {
  const user = req.body;

  let existingUser;
  try{
    // Check existing user
    existingUser = await userHelper.checkUserExists(user);

    if (!existingUser) {
      return res.status(401).send({ error: "User not found" });
    }

    // Check Password
    const correctPassword = await userHelper.checkPassword({
      data: existingUser,
      oldPassword: user.password
    })

    console.log(correctPassword);

    if (!correctPassword) {
      throw new Error ('Incorrect password');
    }

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes('cannot be same')){
      return res.status(409).send({ error: err.message });
    }

    if (err.message.includes('Incorrect password')){
      return res.status(409).send({ error: err.message });
    }

    return res.status(500).send({ error: "Server error" });
  }

  // Assign token
  let token;
  try {
    token = jwt.sign(
      {
        userOid: existingUser._id,
        email: existingUser.email,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        accessLevel: existingUser.accessLevel,
        company: existingUser.company
      },
      SECRET_KEY,
      { expiresIn: "1h"},
    )

    const tokenDoc = new TokensCol({
      token: token,
      user: existingUser._id
    });
    await tokenDoc.save();

  } catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "auth login",
    data: {
      token: token
    },
  })
  
}

exports.logout = async (req, res) => {
  const data = req.user;
  console.log(data);

  let tokenDoc;
  const query = {
    token: data.token,
    deletedAt: null
  };
  const values = { deletedAt: moment() };
  const options = { new: true};
  try{
    // logout the user, delete token
    tokenDoc = await TokensCol.findOneAndUpdate(query, values, options);

    if (!tokenDoc)
      throw new Error("Invalid Session");

  } catch (err) {
    console.error(err.stack);

    if (err.message.includes("Invalid Session"))
      return res.status(404).send({ error: err.message });

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "auth logout",
    data: {
      token: tokenDoc.token
    }
  })
}

exports.refreshToken = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  

  res.status(200).send({
    message: "auth refresh",
  })
}