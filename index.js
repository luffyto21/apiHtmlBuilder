const config = require('config');
const serverApp = require('./middleware/server-init');
const log = require('./utils/logger');
/*Trick para problema con eventListeners maximos*/
require('events').EventEmitter.prototype._maxListeners = 100;
/**
 * Se activa la conexion a la base de datos en modalidad pool
 **/

log.logger.info(`Aplicacion : ${config.get("name")} `);
/*
* Solo en ambientes de desarrollo locales se coloca el puerto directamente al iniciar la aplicacion
* en servidores, se debe obtener del objeto global "process"
*/
const port = process.env.PORT || config.get("server.PORT");
serverApp.listenPort(port);

//crear login para obtener jwt valido para poder realizar las peticiones hacia el endpoint