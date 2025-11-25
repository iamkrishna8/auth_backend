require("dotenv").config(); // Load .env at the very start

const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT;
const db = process.env.DATA_BASE;

mongoose
  .connect(db)
  .then(() => console.log("🟢 MongoDB Connected Successfully"))
  .catch((err) => {
    console.log("🔴 MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});
