const express = require("express");
const bcrypt = require("bcrypt");
const { validUser, UserModel, validLogin, createToken } = require("../models/userModel");
const { auth, authAdmin } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/", async (req, res) => {
    let validateBody = validUser(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let user = new UserModel(req.body);
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        user.password = "*****";
        res.status(201).json(user);
    }
    catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({ msg: "Email already in system try login", code: 11000 });
        }
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

router.post("/login", async (req, res) => {
    let validateBody = validLogin(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ msg: "user or password are worng" });
        }
        let vaidPass = await bcrypt.compare(req.body.password, user.password);
        if (!vaidPass) {
            return res.status(401).json({ msg: "user or password are worng" });
        }
        let newToken = createToken(user._id, user.role);
        res.json({ token: newToken });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/myInfo", auth, async (req, res) => {
    try {
        let user = await UserModel.findOne({ _id: req.tokenData._id })
        res.json(user)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/usersList", authAdmin, async (req, res) => {
    try {
        let perPage = req.query.perPage || 10;
        let data = await UserModel.find({}, { password: 0 }).limit(perPage);
        res.json(data)
    }
    catch (err) {
        onsole.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.put("/:idEdit", auth, async (req, res) => {
    let validateBody = validUser(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let idEdit = req.params.idEdit;
        let data;
        if (req.tokenData.role == "admin") {
            data = await UserModel.updateOne({ _id: idEdit }, req.body);
        }
        else if (idEdit != req.tokenData._id) {
            return res.status(403).json({ msg: "cannot edit this user" })
        }
        else {
            data = await UserModel.updateOne({ _id: idEdit }, req.body);
        }
        let user = await UserModel.findOne({ _id: idEdit });
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();
        user.password = "*****";
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

router.delete("/:idDel", auth, async (req, res) => {
    let idDelete = req.params.idDel;
    let data;
    try {
        if (req.tokenData.role == "admin") {
            data = await UserModel.deleteOne({ _id: idDelete });
        }
        else if (idDelete != req.tokenData._id) {
            return res.status(403).json({ msg: "cannot delete this user" });
        }
        else {
            data = await UserModel.deleteOne({ _id: idDelete });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

module.exports = router;