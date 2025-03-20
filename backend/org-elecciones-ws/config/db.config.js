/**Archivo de configuracion para 
 * la base de datos
 */


/**Libreria para postgres */
const postgres = require('bluebird');

const options = {
    promiseLib: postgres,
    query:(e)=>{}
}

/**Requerimos la libreria que se encargara de la traduccion del archivo
 * env a js para que express lo lea
 */
require('dotenv').config();

/**Puente para conectar la libreria de postgres(bluebird)
 * a js 
 */
const pgp = require('pg-promise')(options);
const types = pgp.pg.types;
types.setTypeParser(1114, function (stringValue) {
    return stringValue;
});



const databaseConfig = {
    'host': process.env.DB_HOST,
    'port': process.env.DB_PORT,
    'database': process.env.DB_NAME,
    'user':process.env.DB_USER,
    'password': process.env.DB_PASSWORD
}

const db = pgp(databaseConfig);


module.exports = db;
