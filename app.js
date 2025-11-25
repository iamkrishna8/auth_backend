const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/userRouter");

const globalerrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");

dotenv.config();
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true,
  })
);

app.use("/api/v1/users", userRouter);

// handling unhandling routes or for undefined routes
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalerrorHandler);
module.exports = app;
