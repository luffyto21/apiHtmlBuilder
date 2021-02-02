const config = require ('config');
const bcrypt = require("bcrypt");

module.exports = function (req, res, next) {
    //Validacion de nombre empresa unico
    if (req.body.name !== config.get("customAuth.NAME")){
      log.logger.error(`Nombre ${req.body.user} invalido...`);    
      return res
        .status(config.get("constants.HTTP_STATUS_CODE.BAD_REQUEST"))
        .json(new Error("Identificacion no válida"));
    }
    //Validacion de nombre de usuario
    if (req.body.user !== config.get("customAuth.USER")){
      log.logger.error(`Usuario ${req.body.user} invalido...`);  
      return res
        .status(config.get("constants.HTTP_STATUS_CODE.BAD_REQUEST"))
        .json(new Error("Usuario y/o Password inválido"));
    }
     //Validacion de password
  
     if (!bcrypt.compare(req.body.password, config.get('customAuth.PASS'))){
  
      log.logger.error(`Password ${req.body.password} invalido...`);
     
      return res
        .status(config.get("constants.HTTP_STATUS_CODE.BAD_REQUEST"))
        .json(new Error("Usuario y/o Password inválido"));
     }
  
     next();
  }