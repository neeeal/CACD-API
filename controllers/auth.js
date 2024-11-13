const TokensCol = require("../models/tokens.js");
const UsersCol = require("../models/users.js");
const userHelper = require("../helpers/userHelper.js");
const fs = require('fs');
const path = require('path');
const moment = require("moment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer.js");
const SECRET_KEY_REFRESH_TOKEN = process.env.SECRET_KEY_REFRESH_TOKEN;
const SECRET_KEY_PASSWORD_RESET = process.env.SECRET_KEY_PASSWORD_RESET;
const utils = require("../helpers/utils.js");

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
    accessToken = await utils.generateToken({existingUser:existingUser, type:'login'});

    // Generate refresh token
    refreshToken = jwt.sign(
      {
        userOid: existingUser._id,
      },
      SECRET_KEY_REFRESH_TOKEN,
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
    const decoded = jwt.verify(refreshToken, SECRET_KEY_REFRESH_TOKEN);
    const existingUser = await UsersCol.findOne({_id: decoded.userOid, deletedAt: null}); 
    // Verify the refresh token logic (e.g., checking in database)
    const tokenDoc = await TokensCol.findOne({ token: refreshToken, deletedAt: null}).lean();

    if (!tokenDoc)
      throw new Error("Invalid Session");

    // Issue a new access token
    newAccessToken = await utils.generateToken({existingUser:existingUser, type:'login'});

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
  const user = req.body;

  let existingUser;
  let htmlContent;
  let token;
  try{
    // check if user exists
    existingUser = await userHelper.checkUserExists(user);

    token = await utils.generateToken({existingUser:existingUser, type: 'passwordReset', expiresIn:'5m', secretKey: SECRET_KEY_PASSWORD_RESET});

    htmlContent = await fs.promises.readFile(path.join(__dirname, '../html/forgotPassword.html'), 'utf8');
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  htmlContent = htmlContent
  .replace('{{reset_link}}', resetLink)
  .replace('{{name}}', existingUser.firstName);
  
  var mailOptions = {
    from: process.env.MAIL_EMAIL,
    to: existingUser.email,
    subject: 'Forgot Password CACD Account',
    html: htmlContent
  };
  
  try{
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    const expiresAt = moment().add(5, 'minutes').toDate(); // Refresh token is automatically deleted in 7 days
    const tokenDoc = new TokensCol({
      token: token,
      user: existingUser._id,
      expiresAt: expiresAt,  // Save the expiration time
      deletedAt: null  // Token is active and not expired initially
    });

    await tokenDoc.save();

  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  };

  res.status(200).send({
    message: "forgot password",
    data: {}
  });
};

// TODO: delete token if success
exports.resetPassword = async function(req, res) {
  const { token } = req.query;
  console.log(token)
  let newUser = req.body;

  let decoded;
  try{
    const deletedToken = await TokensCol.findOne(
      {
        deletedAt: null,
        token: token
      }
    );
    if (!deletedToken) 
      return res.status(401).send({ error: "Invalid or expired token" });
    
    decoded = jwt.verify(token, SECRET_KEY_PASSWORD_RESET);
  } catch (err) {
    console.error(err.stack);
    return res.status(401).send({ error: "Invalid or expired token" });
  }

  if (newUser.password !== newUser.passwordConfirmation)
    return res.status(400).send({ error: "Passwords do not match" });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(newUser.password, salt);

  const query = {
    _id: decoded.userOid,
    deletedAt: null
  };

  const values = {
    $set: {
      password: password
    }
  }

  const options = { new: true };

  newUser = await UsersCol.findOneAndUpdate(query, values, options);//await utils.updateAndPopulate({ query: query, values: values, options: options, col: UserCol });

  console.log(newUser);

  const deletedToken = await TokensCol.findOneAndUpdate(
    {
      deletedAt: null,
      token: token
    }, 
    {
      deletedAt: moment()
    }, 
    options
  );

  res.status(200).send({
    message: "reset password",
    data: {}
  });
};