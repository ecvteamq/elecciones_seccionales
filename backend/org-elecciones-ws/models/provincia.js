const db = require("../config/db.config");

const Provincia = {};

Provincia.getAll = () => {
    const query = "select * from public.provincia";
    return db.manyOrNone(query);
};

Provincia.findByCodigo = (codigo) => {
    const query = "select id,nombre from public.provincia where codigo = $1";
    return db.oneOrNone(query, codigo);
};

Provincia.findByNombre = (nombre) => {
    const query = `select  json_build_object(
        'id', p.id,
        'nombre', p.nombre,
        'codigo',p.codigo
    )as provincia
    from public.provincia  p where nombre = $1`;
    return db.oneOrNone(query, nombre);
};

Provincia.create = (provincia) => {
    const sql = `
      INSERT INTO public.provincia(
          nombre
      )VALUES($1)
      RETURNING id;`

    return db.oneOrNone(sql, [
        provincia.descripcion
    ]);
}

module.exports = Provincia;