const db = require('../config/db.config');

const UsuarioRol = {

};

UsuarioRol.getAll = () => {
    const query = "select * from seguridad.usuario_rol";
    return db.manyOrNone(query);
};

UsuarioRol.getById = (id) => {
    const query = "select *from seguridad.usuario_rol where usuario_id = $1 ";
    return db.manyOrNone(query, id);
};

UsuarioRol.create = (usuario_id, rol_id) => {
    const sql = `
    INSERT INTO seguridad.usuario_rol(
        usuario,
        rol
    )VALUES($1,$2)
    `

    return db.none(sql, [
        usuario_id,
        rol_id
    ]);
}

UsuarioRol.delete = (id) => {
    const sql = `
      DELETE FROM seguridad.usuario_rol where id = $1`;

    return db.oneOrNone(sql, [
        id
    ]);
};

module.exports = UsuarioRol;