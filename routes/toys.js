const express = require("express");
const { ToyModel, validateToy } = require("../models/toyModel");
const { auth } = require("../middlewares/auth");
const { min } = require("lodash");
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let data = await ToyModel
            .find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(data);
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "err", err })
    }
})

router.get("/search", async (req, res) => {
    try {
        let queryS = req.query.s;
        let perPage = req.query.perPage || 10;
        let searchReg = new RegExp(queryS, "i")
        let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
            .limit(perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.get("/category/:catName", async (req, res) => {
    try {
        let categoryQ = req.params.catName;
        let perPage = req.query.perPage || 10;
        let catReg = new RegExp(categoryQ, "i");
        let data = await ToyModel.find({ category: catReg }).limit(perPage)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.post("/", auth, async (req, res) => {
    let validateBody = validateToy(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

router.put("/:idEdit", auth, async (req, res) => {
    let validateBody = validateToy(req.body);
    if (validateBody.error) {
        return res.status(400).json(validateBody.error.details);
    }
    try {
        let idEdit = req.params.idEdit;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: idEdit }, req.body);
        }
        else {
            data = await ToyModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

router.delete("/:idDell", auth, async (req, res) => {
    try {
        let idDell = req.params.idDell;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: idDell }, req.body);
        }
        else {
            data = await ToyModel.deleteOne({ _id: idDell, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "err", err });
    }
})

router.get("/single/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let data = await ToyModel.findOne({_id:id});
        res.json(data)
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: "err", err});
    }
})

router.get("/prices", async(req, res) => {
    try{
        let minQ = req.query.min || 0;
        let maxQ= req.query.max || Infinity;
        let perPage = req.query.perPage || 10;
        let data = await ToyModel.find({price: { $gte: minQ, $lte: maxQ }}).limit(perPage)
        res.json(data);
    }
    catch(err) {
        console.log(err)
        res.status(500).json({msg: "err", err})
    } 
})

module.exports = router;

