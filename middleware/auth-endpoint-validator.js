const jwt =  require('jsonwebtoken');
const config = require('config');
const log = require('../utils/logger');

module.exports=function(req,res,next){

if(!req.header('x-auth-mcafee-token')){
    let error = new Error('Acceso denegado.No existe un token válido.');
    log.logger.error(error);
    return res.status(config.get('constants.HTTP_STATUS_CODE.UNAUTHORIZED')).json({code : config.get('constants.HTTP_STATUS_CODE.UNAUTHORIZED') ,error : error.message})
}

try{
    const decoded =  jwt.decode(req.header('x-auth-mcafee-token'),config.get('pkj'));
    if(!decoded) {
        let error = new Error('Token con formato incorrecto.');
        log.logger.error(error);
        return res.status(config.get('constants.HTTP_STATUS_CODE.UNAUTHORIZED')).json({code : config.get('constants.HTTP_STATUS_CODE.UNAUTHORIZED') ,error : error.message})
    }
        
    next();

}catch(ex){
    let error = new Error('Token Inválido');
    log.logger.error(error);
    res.status(config.get('constants.HTTP_STATUS_CODE.BAD_REQUEST')).json({code:config.get('constants.HTTP_STATUS_CODE.BAD_REQUEST') ,error : error.message});
}

}