const db = require("../config/db.config");

const Rol = {};

Rol.getAll = () => {
    const query = "select * from seguridad.rol WHERE estado = 'ACTIVO' ";
    return db.manyOrNone(query);
};

Rol.create = (rol) => {
    const sql = `
      INSERT INTO rol(
          nombre,
          estado,
          fecha_creacion,
          usuario_creacion,
          descripcion
      )VALUES($1,$2,$3,$4,$5)
      RETURNING id;`

    return db.oneOrNone(sql, [
        rol.nombre,
        rol.estado,
        new Date(),
        rol.usuario_creacion,
        rol.descripcion
    ]);
}

module.exports = Rol;