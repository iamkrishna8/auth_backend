const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/nodeMailer");

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

  // sending welcome email using Brevo API
  const htmlContent = `
<html>
  <body style="font-family: Arial, sans-serif; background-color:#eef5f1; padding:25px;">

    <table width="100%" cellspacing="0" cellpadding="0" 
      style="max-width:620px; margin:auto; background:#ffffff; border-radius:12px; 
      overflow:hidden; border:1px solid #dce7e1; box-shadow:0 6px 20px rgba(0,0,0,0.08);">

      <!-- Header Banner -->
      <tr>
        <td style="padding:0;">
          <img src="https://raw.githubusercontent.com/iamkrishna8/auth_frontend/main/testimage_email.png?raw=1"
               alt="Welcome Banner"
               style="width:100%; height:auto; display:block;">
        </td>
      </tr>

      <!-- Header / Title -->
      <tr>
        <td style="background:#2e7d32; padding:22px; text-align:center; color:#ffffff;">
          <h2 style="margin:0; font-size:26px; letter-spacing:0.5px;">
            Welcome to EDHR
          </h2>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding:30px; color:#333; line-height:1.7;">

          <p style="margin-top:0; font-size:16px;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="font-size:15px;">
            We are delighted to let you know that your EDHR account has been successfully created.
            Your registered email is:
            <br><strong>${email}</strong>
          </p>

          <p style="font-size:15px;">
            You can now sign in to your dashboard and begin exploring all the tools and features designed 
            to simplify your workflow and enhance your EDHR experience.
          </p>

          <p style="font-size:15px;">
            If you ever need help, our support team is always available to assist you.
          </p>

          <p style="margin-top:25px; font-size:16px; color:#2e7d32;">
            We are excited to have you with us — welcome to the EDHR family!
          </p>

          <p style="font-size:15px; margin-top:8px;">
            Warm regards,<br>
            <strong style="color:#2e7d32;">EDHR Team</strong>
          </p>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f3f7f5; text-align:center; padding:15px; 
            font-size:12px; color:#777; border-top:1px solid #e1ebe6;">
          © ${new Date().getFullYear()} EDHR. All rights reserved.
        </td>
      </tr>
    </table>

  </body>
</html>
`;

  try {
    await sendEmail(email, "Welcome to edhr", htmlContent);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    // Don't stop registration even if email fails
  }

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
