const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({msg: "rest index works"})
})

module.exports = router;