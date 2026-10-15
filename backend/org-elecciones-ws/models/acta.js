const db = require("../config/db.config");

const Acta = {};

Acta.getAll = () => {
  const query = `select  
    json_build_object(
      'id', p.id,
      'nombre', p.nombre,
      'codigo',p.codigo
    )as provincia,
    json_build_object(
        'id', cant.id,
        'nombre', cant.nombre,
      'codigo',cant.codigo
    )as canton,
    json_build_object(
      'id', parr.id,
      'nombre', parr.nombre,
    'codigo',parr.codigo
    )as parroquia,
    json_build_object(
      'id', d.id,
      'descripcion', d.descripcion,
      'tipo',d.tipo,
      'estado',d.estado
    )as dignidad,
    json_build_object(
      'id', r.id,
      'nombre_recinto', r.nombre
    )as recinto,
    a.numero_acta,
    a.id,
    a.numero_junta,
    a.genero,
    a.total_votante,
    a.voto_valido,
    a.voto_blanco,
    a.voto_nulo,
    a.inasistente
    from public.acta a 
    inner join public.provincia p on a.provincia = p.id 
    inner join public.canton cant on a.canton = cant.id
    inner join public.dignidad d on a.dignidad = d.id
    left join public.parroquia parr  on a.parroquia = parr.id
    left join public.recinto_electoral r on r.id = a.recinto_electoral
    order by a.id desc`;
  return db.manyOrNone(query);
};
Acta.getActaTotalByFilters = (acta) => {
  const query = `select * from public.acta a where a.tipo_acta = 'SOLO_TOTALES' 
  and (CASE WHEN length($1) > 0 then  a.dignidad =  $1 else true end)
  and (CASE WHEN length($2) > 0 then  a.provincia =  $2 else true end) 
  and (CASE WHEN length($3) > 0 then  a.canton =  $3 else true end)`;
  return db.manyOrNone(query, [
    acta.dignidad,
    acta.provincia,
    acta.canton
  ]);
};
Acta.verify = (acta) => {
  const query = `select * from public.acta where provincia = $1 and canton = $2 
    and (CASE WHEN $3 is not null then parroquia = $3 ELSE true END) and dignidad = $4 
    and recinto_electoral = $5`;
  return db.oneOrNone(query, [acta.provincia, acta.canton, acta.parroquia, acta.dignidad, acta.recinto]);
};
Acta.create = (acta) => {
  const sql = `
      INSERT INTO public.acta(
        dignidad,
        provincia,
        canton,
        parroquia,
        numero_junta,
        recinto_electoral,
        total_votante,
        voto_valido,
        voto_blanco,
        voto_nulo,
        inasistente      
        )VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id;`

  return db.oneOrNone(sql, [
    acta.dignidad,
    acta.provincia,
    acta.canton,
    acta.parroquia,
    acta.numero_junta,
    acta.recinto_electoral,
    acta.total_votantes,
    acta.votos_validos,
    acta.votos_blancos,
    acta.votos_nulos,
    acta.inasistentes
  ]);
},
  Acta.delete = () => {
    const query = "TRUNCATE TABLE public.acta restart identity cascade;";
    return db.oneOrNone(query);
  };

Acta.update = (numero_acta, acta_id) => {
  const query = "UPDATE public.acta SET numero_acta= $1 where id = $2";
  return db.oneOrNone(query, [numero_acta, acta_id]);
};
Acta.updateTotales = (acta) => {
  const sql = `
    UPDATE public.acta 
      set total_votante = $2, 
      voto_valido = $3, 
      voto_blanco = $4,
      voto_nulo = $5,
      inasistente = $6
    WHERE id = $1 RETURNING *;`;
  return db.oneOrNone(sql, [
    acta.id,
    acta.total_votante,
    acta.voto_valido,
    acta.total_blanco,
    acta.total_nulo,
    acta.inasistente
  ]);
};
Acta.getPorcentajeEscrutinio = (dignidad) => {
  const query = `select   (count(*) * 100)/511::numeric(10,2) as porcentaje_escrutado, 
    100 - (count(*) * 100)/511::numeric(10,2) as faltante   from acta where dignidad = $1`;
  return db.oneOrNone(query, dignidad);
};
module.exports = Acta;