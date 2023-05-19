const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const isEmail = require("../utils/emailValidator");

exports.passwordLessLogin = async (req, res, next) => {
    const { email } = req.body;

    try {
        //if Email is not there
        if (email == null) {
            return res.send(400).json({ message: "Please provide Email" });
        }

        //Check if email is valid
        if (isEmail(email)) {
            // Check if there is an existing user with the provided email
            const user = await User.findOne({ email });

            // Check if the user is blocked
            if (user && user.blockedUntil && user.blockedUntil > Date.now()) {
                return res.status(401).json({
                    message: "Account blocked. Please try again after 1 hour.",
                });
            }

            // Check if the user has generated an OTP within the last minute
            if (
                user &&
                user.otpExpiresAt &&
                user.otpExpiresAt > Date.now() - 60000
            ) {
                return res.status(429).json({
                    message:
                        "Please wait for at least 1 minute before generating a new OTP.",
                });
            }

            // Generate a new OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP is valid for 5 minutes

            // Update the user's OTP and OTP expiration time
            if (user) {
                user.otp = otp;
                user.otpExpiresAt = otpExpiresAt;
                user.wrongAttempts = 0;
                await user.save();
            } else {
                await User.create({ email, otp, otpExpiresAt });
            }

            // Send the OTP to the user's email address
            sendOTP(email, otp);

            res.json({ message: "OTP generated and sent successfully." });
        } else {
            res.status(400).json({ message: "Enter Valid Email" });
        }
    } catch (error) {
        console.error("Error generating OTP:", error);
        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};

exports.login = async (req, res, next) => {
    const { email, otp } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });

        //If OTP is already used
        if (user && user.otpAlreadyUsed) {
            return res.status(401).json({ message: "OTP already used" });
        }

        // Check if the user is blocked
        if (user && user.blockedUntil && user.blockedUntil > Date.now()) {
            return res.status(401).json({
                message: "Account blocked. Please try again after 1 hour.",
            });
        }

        // If OTP is Invalid
        if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
            // Increment the wrong attempts count
            user.wrongAttempts++;

            // Check if the user has reached the maximum consecutive wrong attempts
            if (user.wrongAttempts >= 5) {
                user.blockedUntil = new Date(Date.now() + 60 * 60 * 1000); // Block the account for 1 hour
            }

            await user.save();

            return res.status(401).json({ message: "Invalid OTP." });
        }

        // Reset wrong attempts count
        user.otpAlreadyUsed = true;
        user.wrongAttempts = 0;
        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ email }, process.env.JWT_KEY, {
            expiresIn: "1h",
        });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};

const sendOTP = async (email, otp) => {
    try {
        let config = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        };

        //Setting up Transporter
        let transporter = nodemailer.createTransport(config);

        let MailGenerator = new Mailgen({
            theme: "neopolitan",
            product: {
                name: "Mailgen",
                link: "https://mailgen.js/",
            },
        });

        //Created a response
        let response = {
            body: {
                name: email.split("@")[0].trim(),
                intro: `Your OTP has arrived: ${otp}`,
            },
            outro: "Please don't share your OTP with anyone",
        };

        let mail = MailGenerator.generate(response);

        let message = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP is here - Please don't share it with anyone",
            html: mail,
        };

        transporter.sendMail(message);
    } catch (error) {
        console.error("Error sending OTP:", error);
    }
};
