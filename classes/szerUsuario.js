const Joi = require("joi");

class szerUsuario {
  constructor(user, password, name) {
    this.name = name;
    this.user = user;
    this.password = password;
  }

}

function validate(json) {
    const schema = Joi.object({
      name: Joi.string().min(10).max(50).required().messages({
        "string.base": `"name" debe ser una cadena de caracteres`,
        "string.empty": `"name" no puede estar vacío`,
        "any.required": `"name" es un campo requerido`,
        "string.min": `"name" no posee el tamaño correcto`,
        "string.max": `"name" no posee el tamaño correcto`,
      }),
      user: Joi.string().min(6).max(6).required().messages({
        "string.base": `"user" debe ser una cadena de caracteres`,
        "string.empty": `"user" no puede estar vacío`,
        "any.required": `"user" es un campo requerido`,
        "string.min": `"user" no posee el tamaño correcto`,
        "string.max": `"user" no posee el tamaño correcto`,
      }),
      password: Joi.string().min(8).max(255).required().messages({
        "string.base": `"password" debe ser una cadena de caracteres`,
        "string.empty": `"password" no puede estar vacío`,
        "any.required": `"password" es un campo requerido`,
        "string.min": `"password" no posee el tamaño correcto`,
        "string.max": `"password" no posee el tamaño correcto`,
      }),
    });

    return schema.validate(json);
  }

module.exports = szerUsuario;
module.exports.validate = validate;
