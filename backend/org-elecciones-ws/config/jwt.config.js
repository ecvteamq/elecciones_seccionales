const jwt  = require('jsonwebtoken');
require('dotenv').config();

/**Método para crear el token del usuario */
const createToken = (payload) =>{
    return jwt.sign({
      data: payload
    },process.env.JWT_SECRET,{expiresIn: duracionToken(process.env.EXPIRES_IN)});
}

/**
 * jsonwebtoken interpreta un texto numérico sin unidad ("3600") como milisegundos.
 * EXPIRES_IN está en segundos (el frontend lo usa así), por eso se convierte a número.
 * Valores con unidad ("1h", "30m") se respetan tal cual.
 */
const duracionToken = (valor) => {
    const texto = `${valor}`.trim();
    return /^\d+$/.test(texto) ? Number(texto) : texto;
}

/**Verificar y obtener los datos del token */
const getTokenData = (token)=>{
    let data = null;
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            console.log("Error al obtener datos del token");
        }else{
            data = decoded;
        }
    });
    return data;
}

module.exports={
    createToken,
    getTokenData
}