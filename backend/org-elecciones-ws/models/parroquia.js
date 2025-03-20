const db = require("../config/db.config");

const Parroquia = {};

Parroquia.getAll = () => {
    const query = "select * from public.parroquia";
    return db.manyOrNone(query);
};
Parroquia.getById = (id) => {
    const query = "select * from public.parroquia where id = $1";
    return db.manyOrNone(query,id);
};
Parroquia.getByCanton = (canton,provincia) => {
    const query = "select * from public.parroquia where codigo_canton = $1 and codigo_provincia = $2";
    return db.manyOrNone(query,[canton,provincia]);
};

Parroquia.findByNombre = (nombre,provincia,canton) => {
    const query = `select  json_build_object(
        'id', p.id,
        'nombre', p.nombre,
        'codigo',p.codigo
    )as parroquia
    from public.parroquia  p where nombre = $1 and codigo_provincia = $2 and codigo_canton = $3`;
    return db.oneOrNone(query, [nombre,provincia,canton]);
};

Parroquia.findByCodigo = (codigo,provincia,canton) => {
    const query = "select id,nombre from public.parroquia where codigo = $1 and codigo_provincia = $2 and codigo_canton = $3";
    return db.oneOrNone(query, [codigo, provincia, canton]);
};

module.exports = Parroquia;