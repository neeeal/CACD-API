const TokensCol = require("../models/tokens.js");
const UsersCol = require("../models/users.js");
const userHelper = require("../helpers/userHelper.js");
const moment = require("moment");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

exports.login = async (req, res) => {
  const user = req.body;

  let existingUser;
  try {
    // Check existing user
    existingUser = await userHelper.checkUserExists(user);

    if (!existingUser) {
      return res.status(401).send({ error: "User not found" });
    }

    // Check Password
    const correctPassword = await userHelper.checkPassword({
      data: existingUser,
      oldPassword: user.password
    });

    if (!correctPassword) {
      throw new Error('Incorrect password');
    }

  } catch (err) {
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes('Incorrect password')) {
      return res.status(409).send({ error: err.message });
    }

    return res.status(500).send({ error: "Server error" });
  }

  // Assign token
  let accessToken;
  let refreshToken;
  try {
    // Generate access token
    accessToken = jwt.sign(
      {
        userOid: existingUser._id,
        email: existingUser.email,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        accessLevel: existingUser.accessLevel,
        company: existingUser.company
      },
      ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: '1hr' }
    );

    // Generate refresh token
    refreshToken = jwt.sign(
      {
        userOid: existingUser._id,
      },
      REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: '7d' }  // Refresh token expires in 7 days
    );

    // Set expiration time for the refresh token 
    const expiresAt = moment().add(7, 'days').toDate(); // Refresh token is automatically deleted in 7 days

    // Create token document with the expiration date
    const tokenDoc = new TokensCol({
      token: refreshToken,
      user: existingUser._id,
      expiresAt: expiresAt,  // Save the expiration time
      deletedAt: null  // Token is active and not expired initially
    });

    await tokenDoc.save();

  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  // Send response with the access token
  res
  .status(200)
  .cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Only in production over HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days expiration
  })
  .send({
    message: "auth login",
    data: {
      token: accessToken
    },
  });
};


exports.logout = async (req, res) => {
  const token = (req.headers.cookie && req.headers.cookie.split("=")[1]) || (req.body && req.body.refreshToken);

  console.log(token)

  let tokenDoc;
  const query = {
    token: token,
    deletedAt: null
  };
  const values = { deletedAt: moment() };
  const options = { new: true};

  console.log(query)
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

// Middleware or controller to handle token refresh
exports.refreshToken = async (req, res) => {
  const refreshToken = (req.headers.cookie && req.headers.cookie.split("=")[1]) || (req.body && req.body.refreshToken);

  if (!refreshToken) {
    return res.status(401).send({ error: 'Refresh token required' });
  }

  let newAccessToken;
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);
    const existingUser = await UsersCol.findOne({_id: decoded.userOid, deletedAt: null}); 
    // Verify the refresh token logic (e.g., checking in database)
    const tokenDoc = await TokensCol.findOne({ token: refreshToken, deletedAt: null}).lean();

    if (!tokenDoc)
      throw new Error("Invalid Session");

    // Issue a new access token
    newAccessToken = jwt.sign(
      { 
        userOid: existingUser._id,
        email: existingUser.email,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        accessLevel: existingUser.accessLevel,
        company: existingUser.company
      },
      ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "1hr" }
    );
  } catch (err) {
    console.error(err.stack);

    if (err.message.includes("Invalid Session"))
      return res.status(404).send({ error: err.message });

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "auth refresh",
    data: {
      token: newAccessToken
    }
  })
};

// TODO: add node mailer and token
exports.forgotPassword = async function(req, res) {
  const email = req.body.email;

  // check if user exists
  const user = await UsersCol.findOne({ email: email, deletedAt: null });

  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  var transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.SECURE,
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_APP_PASSWORD
    }
  });
  
  var mailOptions = {
    from: process.env.MAIL_EMAIL,
    to: user.email,
    subject: 'Forgot Password CACD Account',
    text: 'test'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.status(200).send({
    message: "forgot password",
    data: {}
  });
};

// TODO: verify and delete token, reset user password
exports.resetPassword = async function(req, res) {

  res.status(200).send({
    message: "reset password",
    data: {}
  });
};