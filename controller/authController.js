const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/nodeMailer");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, CookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("please Enter Missing Fields", 400));
  }

  //   checking that if user is already existed with that email
  const existinguser = await User.findOne({ email });
  if (existinguser) {
    return next(
      new AppError("User already Existed ..Please Login to Continue", 400)
    );
  }

  //   creating the user
  const newuser = await User.create(req.body);

  // sending welcome email
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to edhr",
    text: `welcome to edhr.Your account has been created with  email id : ${email}`,
  };

  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL);

  await transporter.sendMail(mailOptions);
  createSendToken(newuser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please Enter email & password In order To login", 403)
    );
  }

  // checking the user exists and password is correct

  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  if (!user || !(await user.CorrectPassworrd(password, user.password))) {
    return next(new AppError("Incorrect email or Password", 403));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", CookieOptions);

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
});
