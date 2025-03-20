const db = require('../config/db.config');

const RecintoElectoral = {

};

RecintoElectoral.getAll = () => {
  const query = "select * from public.recinto_electoral WHERE estado = 'ACTIVO' ";
  return db.manyOrNone(query);
};

RecintoElectoral.getElectoresByCanton = (canton) => {
  const query = "select SUM(numero_electores::integer) as numero_electores from public.recinto_electoral WHERE estado = 'ACTIVO' and nombre_canton= $1";
  return db.oneOrNone(query,canton);
};

RecintoElectoral.getAllOutStatus = () => {
  const query = "select * from public.recinto_electoral WHERE estado IN ('ACTIVO','INACTIVO') ";
  return db.manyOrNone(query);
};


RecintoElectoral.getById = (recinto_electoral_id) => {
  const sql = `
  SELECT *
  FROM public.recinto_electoral
  where id = $1;`;
  return db.oneOrNone(sql,[
    recinto_electoral_id
  ]);
};

RecintoElectoral.getByFilters = (data) => {
  // console.log("PARROQUIA PARAM:",data.parroquia);
  const sql = `
  SELECT *
  FROM public.recinto_electoral
  where nombre_provincia = $1 and nombre_canton = $2 
  and (CASE WHEN $3 is not null then nombre_parroquia = $3 ELSE true END) `;
  return db.manyOrNone(sql,[
    data.provincia,
    data.canton,
    data.parroquia
  ]);
};

RecintoElectoral.create = (recinto_electoral) => {
  const sql = `
    INSERT INTO public.recinto_electoral(
        nombre,
        estado,
        fecha_creacion
    )VALUES($1,$2,$3)
    RETURNING id;`

  return db.oneOrNone(sql, [
    recinto_electoral.nombre,
    recinto_electoral.estado,
    new Date()
  ]);
}

RecintoElectoral.update = (recinto_electoral) => {
  const sql = `
    UPDATE public.recinto_electoral 
      set nombre = $2, 
      estado = $3, 
      fecha_modificacion = $4
    WHERE id = $1 RETURNING *;`;
  return db.oneOrNone(sql, [
    recinto_electoral.id,
    recinto_electoral.nombre,
    recinto_electoral.estado,
    new Date()
  ]);
};

RecintoElectoral.delete = (id) => {
  const sql = `
      DELETE FROM public.recinto_electoral where id = $1`;

  return db.oneOrNone(sql, [
    id
  ]);
};

module.exports = RecintoElectoral;