const jwt  = require('jsonwebtoken');
require('dotenv').config();

/**Método para crear el token del usuario */
const createToken = (payload) =>{
    return jwt.sign({
      data: payload    
    },process.env.JWT_SECRET,{expiresIn: `${process.env.EXPIRES_IN}`});
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