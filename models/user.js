const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiresAt: {
        type: Date,
        required: true,
    },
    blockedUntil: {
        type: Date,
        default: null,
    },
    wrongAttempts: {
        type: Number,
        default: 0,
    },
    otpAlreadyUsed: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema);
