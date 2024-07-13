import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },

    fullName: {
        type: String,
        required: true,
        trim: true, 
        index: true
    },

    avatar: {
        type: String,  // cloudinary url
        required: true
    },

    coverImage: {
        type: String,  // cloudinary url
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    password: {
        type: String,
        required: [true, "Password is required"]
    },

    refreshToken: {
        type: String
    }

}, { timestamps: true } );

// userSchema.pre("save", () => {}) --> while using call back inside pre(), do not use arrow function, because arrow function doesnt have reference or context of this

userSchema.pre("save", async function(next) {

    // whenever there will be change in userdata, this dunction will be called. so password be changed && saved every time.
    // to handle this problem... if password is not modified then we simply return and call next()
    if(!this.isModified("password")) return next();

    // if password is modified...
    this.password = await bcrypt.hash(this.password, 10);
    next();
}) 

// using .method property user defined functions can be created
// i.e. isPasswordCorrect checks if the password entered by user is valid or not
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);