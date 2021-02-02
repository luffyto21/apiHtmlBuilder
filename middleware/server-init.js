require('express-async-errors');
const error = require('../middleware/error');
const express = require("express");
const userAgentValidator = require("express-useragent");
const server = express();
const campanias = require('../routes/campanias');
const auth = require('../routes/auth');
const internal = require('../routes/internal');


/**
 * MiddleWare Function: Verifica que el req.body sea json y lo trata como tal
 */

server.use(express.json());

/**
 * MiddleWare Function: Verifica el contenido de req.body y lo convierte en formato json
 */

//server.use(express.urlencoded({extended : true}));


/**
 * MiddleWare Function: Permite consumir archivos fisicos de una carpeta del proyecto
 */

//server.use(express.static('public'));

/**
 * MiddleWare Function : Se activa la utilizacion de useragent en express para esta instancia(Response)
 */
server.use(userAgentValidator.express());


/**
 * MiddleWare Function : Se activa la utilizacion de rutas para campanias
 */
server.use('/endpoint/campania', campanias);
server.use('/endpoint/auth', auth);
server.use('/endpoint/internal', internal)
server.use(error);

/**
 * Definicion de funciones asociadas a endpoints
 */

function listenPort(port) {
  server.listen(port, () => {
    console.log(`Escuchando en puerto ${port}...`);
  });
}

module.export = server;
module.exports.listenPort = listenPort;
