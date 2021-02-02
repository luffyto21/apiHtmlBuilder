const Joi = require('joi');

class szerCampania{
    constructor(uid){
        this.uid = uid;
    }
    
}

function validate(json){
    const schema =Joi.object({
        'uid' : Joi.string().required().messages({
            'string.base': `"uid" debe ser una cadena de caracteres`,
            'string.empty': `"uid" no puede estar vacío`,
            'any.required': `"uid" es un campo requerido`
          }),
    });

    return schema.validate(json);
}

module.exports = szerCampania;
module.exports.validate = validate;