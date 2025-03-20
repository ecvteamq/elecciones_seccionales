const db = require("../config/db.config");

const Dignidad = {};

Dignidad.getAll = () => {
    const query = "select * from public.dignidad where estado= 'ACTIVO' ";
    return db.manyOrNone(query);
};
Dignidad.getById = (id) => {
    const query = "select *from public.dignidad where id = $1";
    return db.oneOrNone(query, id);
  };
Dignidad.findByDescripcion = (descripcion) => {
    const query = "select * from public.dignidad where descripcion = $1";
    return db.oneOrNone(query,descripcion);
};
Dignidad.delete = (dignidad_id) => {
    const sql = `
    UPDATE public.dignidad 
      set estado = 'INACTIVO'
    WHERE id = $1`;
  
    return db.oneOrNone(sql, dignidad_id);
  };
module.exports = Dignidad;