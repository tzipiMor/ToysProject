const moongoos = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {config} = require("../config/secret");

let userSchema = new moongoos.Schema({
    name: String,
    email: String,
    password: String,
    date_created: {
        type:Date, default: Date.now()
    },
    role: {
        type: String, default: "user"
    }
})
exports.UserModel = moongoos.model("users", userSchema);

exports.createToken = (_id, role) => {
    let token = jwt.sign({_id, role}, config.tokenSecret, {expiresIn: "60mins"});
    return token;
    }

exports.validUser = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        email: Joi.string().min(2).max(99).required(),
        password: Joi.string().min(3).max(99).required()
    })
    return joiSchema.validate(_reqBody);
}

exports.validLogin = (_reqBody) => {
    let joiSchema = Joi.object({
        email: Joi.string().min(2).max(99).email().required(),
        password: Joi.string().min(3).max(99).required()
    })
    return joiSchema.validate(_reqBody)
} 