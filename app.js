const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
require("dotenv").config();
// const https = require("https");
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();

mongoose
    .connect(process.env.MONGO_URL, {})
    .then((client) => console.log("DB connected"))
    .catch((err) => console.log("DB connection failed " + err));

//middlewares
app.use(cors());
app.use(express.json());

//routers
app.use("/api", authRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
