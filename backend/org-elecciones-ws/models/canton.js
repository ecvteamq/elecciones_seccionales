const db = require("../config/db.config");

const Canton = {};

Canton.getAll = () => {
    const query = "select * from public.canton";
    return db.manyOrNone(query);
};

Canton.findByNombre = (nombre) => {
    const query = `select  json_build_object(
        'id', p.id,
        'nombre', p.nombre,
        'codigo',p.codigo
    )as canton
    from public.canton  p where nombre = $1`;
    return db.oneOrNone(query, nombre);
};

Canton.getByProvincia = (provincia) => {
    const query = "select * from public.canton where codigo_provincia = $1";
    return db.manyOrNone(query,provincia);
};

Canton.findByCodigo = (codigo,provincia) => {
    const query = "select id,nombre from public.canton where codigo = $1 and codigo_provincia = $2";
    return db.oneOrNone(query,[codigo,provincia]);
};

module.exports = Canton;