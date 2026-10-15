const db = require("../config/db.config");

const ActaDetalle = {};

ActaDetalle.getAll = () => {
  const query = `select 
  json_build_object(
    'id', c.id,
    'nombre_papeleta', c.nombre_papeleta,
    'dignidad',c.dignidad
  )as candidato,
  ad.lista,
  ad.voto
  from public.acta_detalle ad 
  inner join public.candidato c on ad.candidato = c.id
  order by ad.voto desc`;
  return db.manyOrNone(query);
};
ActaDetalle.getByActa = (actaId) => {
  const query = `select 
  json_build_object(
    'id', c.id,
    'nombre_papeleta', c.nombre_papeleta,
    'dignidad',c.dignidad
  )as candidato,
  ad.lista,
  ad.voto,
  ad.partido,
  ad.id
  from public.acta_detalle ad 
  left join public.candidato c on ad.candidato = c.id
  where ad.acta = $1
  order by ad.voto desc`;
  return db.manyOrNone(query,actaId);
};
ActaDetalle.create = (actaDetalle) => {
  const sql = `
      INSERT INTO public.acta_detalle(
        acta,
        lista,
        candidato,
        voto,
        dignidad,
        partido
      )VALUES($1,$2,$3,$4,$5,$6)
      RETURNING id;`

  return db.oneOrNone(sql, [
    actaDetalle.acta,
    actaDetalle.lista,
    actaDetalle.candidato,
    actaDetalle.voto,
    actaDetalle.dignidad,
    actaDetalle.partido
  ]);
};
ActaDetalle.getByCandidato = (candidato) => {
  console.log("candidato param:", candidato);
  const query = `select * from public.acta_detalle ad INNER JOIN public.candidato c on  ad.candidato = c.id
    where c.nombre_papeleta = $1 and split_part(c.lista,'-',1) = $2 `;
  return db.oneOrNone(query, [candidato.nombre_papeleta, candidato.lista]);
};
ActaDetalle.update = (candidato) => {
  const query = `UPDATE public.acta_detalle  SET voto= $3 where candidato = $1 and lista = $2`;
  // console.log("query:", query);
  return db.oneOrNone(query, [candidato.candidato, candidato.lista, candidato.voto]);
};
ActaDetalle.delete = () => {
  const query = "TRUNCATE TABLE public.acta_detalle restart identity cascade;";
  return db.oneOrNone(query);
};
ActaDetalle.getVotos = (data) => {
  const query = `select 
    json_build_object(
      'nombre_papeleta', c.nombre_papeleta,
      'dignidad',c.dignidad
    )as candidato,
    ad.lista,
    sum(ad.voto)as voto
    from public.acta_detalle ad 
    INNER JOIN public.candidato c on  ad.candidato = c.id
    INNER JOIN public.acta a on ad.acta = a.id
    where 
      (CASE WHEN length($1) > 0 then  c.dignidad =  $1 else true end) 
    and (CASE WHEN length($2) > 0  then ad.lista = $2 else true end)
    and (CASE WHEN length($3) > 0 then a.provincia = $3 ELSE true END)
    and (CASE WHEN length($4) > 0 then a.canton = $4 ELSE true END)
    and (CASE WHEN length($5) > 0 then a.parroquia = $5 ELSE true END)
    and (CASE WHEN $6::bigint is not null then
      COALESCE(a.parroquia, (select r.parroquia_id from public.recinto_electoral r where r.id = a.recinto_electoral))
        in (select dp.parroquia_id from public.distrito_parroquia dp where dp.distrito_id = $6)
      ELSE true END)
    group by c.nombre_papeleta,ad.lista,c.dignidad	
    ORDER BY voto desc`;
  return db.manyOrNone(query, [data.dignidad.descripcion, data.lista,data.provincia,data.canton,data.parroquia,data.distrito || null]);
};
ActaDetalle.getVotosMultipersonal = (data) => {
    const query = `select 
    ad.lista,
    sum(ad.voto)as voto,
		ad.partido as candidato
    from public.acta_detalle ad 
    left JOIN public.candidato c on  ad.candidato = c.id
    left JOIN public.acta a on ad.acta = a.id
    where 
    (CASE WHEN length($1) > 0 then  ad.dignidad =  $1 else true end) 
    and (CASE WHEN length($2) > 0  then ad.lista = $2 else true end)
    and (CASE WHEN length($3) > 0 then a.provincia = $3 ELSE true END)
    and (CASE WHEN length($4) > 0 then a.canton = $4 ELSE true END)
    and (CASE WHEN length($5) > 0 then a.parroquia = $5 ELSE true END)
    and (CASE WHEN $6::bigint is not null then
      COALESCE(a.parroquia, (select r.parroquia_id from public.recinto_electoral r where r.id = a.recinto_electoral))
        in (select dp.parroquia_id from public.distrito_parroquia dp where dp.distrito_id = $6)
      ELSE true END)
    group by ad.partido,ad.lista	
    ORDER BY voto desc`;
  return db.manyOrNone(query, [data.dignidad.descripcion, data.lista,data.provincia,data.canton,data.parroquia,data.distrito || null]);
};
ActaDetalle.updateDetalle = (actaDetalle) => {
  const sql = `
    UPDATE public.acta_detalle 
      set voto = $2
    WHERE id = $1 RETURNING *;`;
  return db.oneOrNone(sql, [
    actaDetalle.id,
    actaDetalle.voto
  ]);
};
module.exports = ActaDetalle;