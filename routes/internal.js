const bcrypt = require("bcrypt");
const express = require("express");
const config = require("config");
const log = require('../utils/logger');
const router = express.Router();
const jsonResponse = {};

router.post("/" ,async (req, res) => {

const salt = await bcrypt.genSalt(10);
const bcryptpass = await bcrypt.hash(req.body.password, salt);

res.status(config.get('constants.HTTP_STATUS_CODE.OK')).json(bcryptpass);

});


module.exports = router;