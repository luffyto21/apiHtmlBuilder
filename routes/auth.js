const jwt = require("jsonwebtoken");
const express = require("express");
const config = require("config");
const log = require("../utils/logger");
const authloginvalidation = require("../middleware/auth-login-validator");
const router = express.Router();
const jsonResponse = {};

router.post("/",authloginvalidation, async (req, res) => {

const ip = req.ip;
const token = jwt.sign({'ip':ip, 'identifier': req.body.name}, config.get('pkj'));
res.status(config.get('constants.HTTP_STATUS_CODE.OK')).json({auth_token: token });
});



module.exports = router;
