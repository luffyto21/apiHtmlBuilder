const config = require("config");
const log = require('../utils/logger');
const winston = require('winston');

module.exports = (error, req, res, next) => {
  log.logger.error(error);    
  res
    .status(config.get("constants.HTTP_STATUS_CODE.ERROR"))
    .json({
      code: config.get("constants.HTTP_STATUS_CODE.ERROR"),
      error: new Error(error).message,
    });
};
