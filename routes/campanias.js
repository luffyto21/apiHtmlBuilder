const express = require("express");
const config = require("config");
const dbConn = require("../utils/database");
const szerCampania= require("../classes/szerCampania");
const log = require('../utils/logger');
const auth_endpoint_validator = require('../middleware/auth-endpoint-validator');
const router = express.Router();
const jsonResponse = {};

dbConn.getConnection((err, connection) => {
  if (err) {
    log.logger.error(`Error con la conexion a la base de datos : ${err}`);
    throw err;
  } else console.log("Conectado!...");
});



router.post("/obtener/contenido",auth_endpoint_validator,  async (req, res) => {//Como segundo parametro puede ir una funcion middleware o un array de middlewares en el orden en que funcionan. //IMPLEMENTAR JWT
  //Si parametro uid no cumple la validacion, error 400
  var { error } = szerCampania.validate(req.body);
  if (error) {
    return res
      .status(config.get("constants.HTTP_STATUS_CODE.BAD_REQUEST"))
      .json({ error: error.details[0].message });
    ;
  }

  //seteo de objeto en base a modelo szerCampania
  const campaniaObj = new szerCampania(req.body.uid);

  //Seteo de entorno mediante userAgent
  let isMobile = req.useragent.isMobile;
  await processHtml(res, campaniaObj.uid, isMobile);
});

async function processHtml(res, uid, isMobile) {
  //Buscar UID , si no esta es error 404
  //console.log("obteniendo campaña asociada...");
    const campania = await getCampaniaById([uid]);
    if (!campania || campania.length == 0) {
      return res
        .status(config.get("constants.HTTP_STATUS_CODE.NOT_FOUND"))
        .json({ error: `El uid ${uid} no esta asociado a ninguna campaña.` });
      
    }
    //console.log(campania[0].cam_id);
    const template = await getTemplateById([campania[0].tem_id]);
    if (!template || template.length == 0) {
      return res.status(config.get("constants.HTTP_STATUS_CODE.NOT_FOUND")).json({
        error: `La campaña uid ${uid}  no tiene asociado ninguna plantilla de diseño.`,
      });
      ;
    }
    //console.log(template[0].tem_id);

    //Seteo de la respuesta json
    jsonResponse.templateCss = template[0].tem_css;
    jsonResponse.codeAdWords = campania[0].cam_adwords;
    jsonResponse.codeFacebookPixel = campania[0].cam_pixel_facebook;
    jsonResponse.contenidoHead = await generateHtmlSection(
      campania,
      config.get("constants.HTML_SECTIONS.HEAD"),
      isMobile
    );

    jsonResponse.contenidoBody = await generateHtmlSection(
      campania,
      config.get("constants.HTML_SECTIONS.BODY"),
      isMobile
    );

    jsonResponse.contenidoFooter = generateHtmlSection(
      campania,
      config.get("constants.HTML_SECTIONS.FOOTER"),
      isMobile
    );

    jsonResponse.terminosCondiciones = generateHtmlCondiciones(campania);

    res.status(config.get("constants.HTTP_STATUS_CODE.OK")).send(jsonResponse);
}

async function generateHtmlSection(campania, type, isMobile) {
    let contenidos = await getContenido(campania, type, isMobile, false);
    let countContenido = await getContenido(campania, type, isMobile, true);
    var posContenido = 0;
    var fila = 0;
    var html = "";
    var arrayJson = [];

    contenidos.forEach((contenido) => {
      let json = {};
      var cantidadContenido = countContenido[0]["cantidad"];
      if (fila !== contenido.cco_fila) {
        if (fila != 0) html = html + "</div>";
        fila = contenido.cco_fila;
        html =
          html +
          `<div id='fila_id_${contenido.cco_fila}_${contenido.cco_id}' class='row'>`;
      }

      json.id = contenido.cco_id;
      json.fila = contenido.cco_fila;
      json.columna = contenido.cco_columna;
      json.tipo = contenido.cco_tipo;

      html = html + htmlAnalyzer(contenido);
      json.contenido = html;
      arrayJson[posContenido] = json;
      posContenido++;
      fila = contenido.cco_fila;

      if (posContenido == cantidadContenido) {
        json.contenido = json.contenido + "</div>";
        arrayJson[posContenido - 1] = json;
      }

      html = "";
    });

    return arrayJson;
}

async function getContenido(campania, type, isMobile, isCount) {
  var query = ``;
  if (isCount)
    query = query + `SELECT count(*) as cantidad FROM campania_contenido `;
  else query = query + `SELECT * FROM campania_contenido `;

  query =
    query +
    ` WHERE cco_eliminado = ${config.get("constants.DELETE_STATUS.NON_DELETE")} 
                and cco_estado = ${config.get("constants.ACTIVE_STATUS.ACTIVE")}
                and cam_id = ${campania[0].cam_id}
                and sec_id = ${type}
                `;

  if (isMobile)
    query =
      query +
      ` and dis_id in (${config.get(
        "constants.CONTENT_DEVICE_DISPOSITION.MOBILE"
      )}, ${config.get("constants.CONTENT_DEVICE_DISPOSITION.BOTH")}) `;
  else
    query =
      query +
      ` and dis_id in (${config.get(
        "constants.CONTENT_DEVICE_DISPOSITION.DESKTOP"
      )}, ${config.get("constants.CONTENT_DEVICE_DISPOSITION.BOTH")}) `;

  query = query + ` ORDER BY cco_fila ASC, cco_columna ASC;`;
  //console.log(query);

  return doQuery(query);
}

function htmlAnalyzer(contenido) {
  var html = "";

  switch (contenido.cco_tipo) {
    case config.get("constants.CONTENT_TYPE.TEXT"):
      html = "";
      html = getColumnaByDisposicion(
        contenido.cco_disposicion_nombre,
        contenido.cco_columna
      );
      html =
        html +
        `<div id="texto_fil_${contenido.cco_fila}_con_${contenido.cco_id}" class="${contenido.cco_clase_css}" >${contenido.cco_contenido}</div>`;
      html = html + "</div>";
      break;
    case config.get("constants.CONTENT_TYPE.IMAGE"):
      html = "";
      html = getColumnaByDisposicion(
        contenido.cco_disposicion_nombre,
        contenido.cco_columna
      );
      html =
        html +
        `<img id="imagen_fil_${contenido.cco_fila}_con_${contenido.cco_id}" class="${contenido.cco_clase_css}" src="${contenido.cco_contenido}" />`;
      html = html + "</div>";
      break;
    case config.get("constants.CONTENT_TYPE.VIDEO"):
      html = "";
      html = getColumnaByDisposicion(
        contenido.cco_disposicion_nombre,
        contenido.cco_columna
      );
      html =
        html +
        `<div id="video_fil_${contenido.cco_fila}_con_${contenido.cco_id}" class="${contenido.cco_clase_css} embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="${contenido.cco_contenido}"></iframe></div>`;
      html = html + "</div>";
      break;
    default:
      html = "";
      break;
  }

  return html;
}

function getColumnaByDisposicion(nombre, columna) {
  var html = "";
  switch (nombre) {
    case "(1)":
      html = '<div class = "col-lg-12 col-md-12 col-sm-12 col-xs-12">';
      break;
    case "(1/2;1/2)":
      html = '<div class = "col-lg-6 col-md-6 col-sm-12 col-xs-12">';
      break;
    case "(1/3;1/3;1/3)":
      html = '<div class = "col-lg-4 col-md-4 col-sm-12 col-xs-12">';
      break;
    case "(2/3;1/3)":
      if (columna === 1) {
        html = '<div class = "col-lg-8 col-md-8 col-sm-12 col-xs-12">';
      } else {
        html = '<div class = "col-lg-4 col-md-4 col-sm-12 col-xs-12">';
      }
      break;
    case "(1/3;2/3)":
      if (columna === 1) {
        html = '<div class = "col-lg-4 col-md-4 col-sm-12 col-xs-12">';
      } else {
        html = '<div class = "col-lg-8 col-md-8  col-sm-12 col-xs-12">';
      }
      break;
    case "(1/4;3/4)":
      if (columna === 1) {
        html = '<div class = "col-lg-3 col-md-3 col-sm-12 col-xs-12">';
      } else {
        html = '<div class = "col-lg-9 col-md-9 col-sm-12 col-xs-12">';
      }
      break;
    case "(3/4;1/4)":
      if (columna === 1) {
        html = '<div class = "col-lg-9 col-md-9 col-sm-12 col-xs-12">';
      } else {
        html = '<div class = "col-lg-3 col-md-3 col-sm-12 col-xs-12">';
      }
      break;
    case "(1/4;1/4;1/4;1/4)":
      html = '<div class = "col-lg-3 col-md-3 col-sm-12 col-xs-12">';
      break;
  }

  return html;
}

function generateHtmlCondiciones(campania) {
  let arrayJson = [];
  let json = {};
  let html = `<div id="terminos_${campania[0].cam_id}" class="gearlabs_terminos">Ver términos y condiciones <a href="${campania[0].cam_url_terminos_condiciones_campania}" target = "_blank">aquí</a></div>`;
  json.id = campania[0].cam_id;
  json.contenido = html;
  arrayJson.push(json);

  return arrayJson;
}

async function getCampanias() {
  let query = `SELECT * FROM campania;`;
  return doQuery(query);
}

async function getCampaniaById(array) {
  let query = `SELECT * FROM campania WHERE cam_unique_key= ? LIMIT 1;`;
  return doQueryParams(query, array);
}

async function getTemplateById(array) {
  let query = `SELECT * FROM template WHERE tem_id= ? LIMIT 1;`;
  return doQueryParams(query, array);
}

/**
 * Funciones core para realizar consultas sql en mysql
 * @param {*} queryToDo
 */
async function doQuery(queryToDo) {
  let pro = new Promise((resolve, reject) => {
    let query = queryToDo;
    dbConn.query(query, function (err, result) {
      if (err)
        reject(new Error(`Ocurrio el siguiente error en la BD : ${err}`));
      resolve(result);
    });
  });
  return pro.then((val) => {
    return val;
  });
}

async function doQueryParams(queryToDo, array) {
  let pro = new Promise((resolve, reject) => {
    let query = queryToDo;
    dbConn.query(query, array, function (err, result) {
      if (err)
        reject(new Error(`Ocurrio el siguiente error en la BD : ${err}`));
      resolve(result);
    });
  });
  return pro.then((val) => {
    return val;
  });
}

module.exports = router;
