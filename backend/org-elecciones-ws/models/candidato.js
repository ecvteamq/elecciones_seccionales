const db = require("../config/db.config");

const Candidato = {};

Candidato.getAll = () => {
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
        'id', d.id,
        'descripcion', d.descripcion,
        'tipo',d.tipo,
        'estado',d.estado
    )as dignidad,
		CASE WHEN dis.id IS NULL THEN NULL ELSE json_build_object(
        'id', dis.id,
        'nombre', dis.nombre
    ) END as distrito,
		c.lista,
		c.nombre,
		c.nombre_papeleta,
		c.partido,
        c.estado,c.id,c.parroquia
    from public.candidato c INNER JOIN public.provincia p on c.provincia = p.nombre 
    INNER JOIN public.canton cant on cant.nombre = c.canton INNER JOIN public.dignidad d on d.descripcion = c.dignidad
    LEFT JOIN public.distrito dis on dis.id = c.distrito_id
    where c.estado = 'ACTIVO'
    ORDER BY C.ID DESC`;
    return db.manyOrNone(query);
};

Candidato.getById = (candidato_id) => {
    const sql = `
    SELECT *
    FROM public.candidato
    where id = $1;`;
    return db.oneOrNone(sql, [
        candidato_id
    ]);
};

Candidato.getByDignidad = (dignidad) => {
    console.log("dignidad param:", dignidad);
    const sql = `
    SELECT *
    FROM public.candidato
    where dignidad = $1;`;
    return db.manyOrNone(sql,
        dignidad
    );
};
/*Cuando la dignidad es unipersonal*/
Candidato.getCandidatoByFilters = (candidato) => {
    const query = `select split_part(lista,'-',1)::numeric as lista,nombre_papeleta from public.candidato 
        where provincia = $1 and canton = $2 
        and  (CASE WHEN $3 is not null then parroquia = $3 ELSE true END) 
        and dignidad = $4
        and (CASE WHEN $5::bigint is not null then distrito_id = $5 ELSE true END)
        order by lista;
        `;
    return db.manyOrNone(query, [
        candidato.provincia,
        candidato.canton,
        candidato.parroquia,
        candidato.dignidad,
        candidato.distrito || null
    ]);
};

/**Cuando la dignidad es multipersonal */
Candidato.getCandidatosMultipersonal = (candidato) => {
    const query = `select split_part(lista,'-',1)::numeric as lista,partido as nombre_papeleta  from candidato 
    where provincia = $1 and canton = $2 and  (CASE WHEN $3 is not null then parroquia = $3 ELSE true END) 
    and dignidad = $4
    and (CASE WHEN $5::bigint is not null then distrito_id = $5 ELSE true END)
    group by split_part(lista,'-',1),partido order by lista`;

    return db.manyOrNone(query, [
        candidato.provincia,
        candidato.canton,
        candidato.parroquia,
        candidato.dignidad,
        candidato.distrito || null
    ]);
}

Candidato.getListas = () => {
    const query = `select split_part(lista,'-',1)::numeric as lista,partido as nombre_papeleta  from candidato 
    group by split_part(lista,'-',1),partido order by lista`;

    return db.manyOrNone(query);
}

Candidato.getCandidatoByNombreAndCanton = (nombre,canton) => {
    const query = "select * from public.candidato where nombre_papeleta = $1 and canton = $2";
    return db.oneOrNone(query, [nombre,canton]);
};

Candidato.create = (usuario) => {

    const sql = `
          INSERT INTO public.candidato(
              provincia,
              canton,
              parroquia,
              dignidad,
              lista,
              partido,
              nombre,
              nombre_papeleta,
              estado,
              distrito_id
          )VALUES(
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10
          )RETURNING id;`;

    return db.oneOrNone(sql, [
        usuario.provincia,
        usuario.canton,
        usuario.parroquia,
        usuario.dignidad,
        usuario.lista,
        usuario.partido,
        usuario.nombre,
        usuario.nombre_papeleta,
        usuario.estado,
        usuario.distrito || null
    ]);
};

Candidato.update = (candidato) => {
    const sql = `
      UPDATE public.candidato
      SET
        nombre = $2,
        provincia = $3,
        canton = $4,
        parroquia = $5,
        dignidad= $6,
        lista = $7,
        partido=$8,
        nombre_papeleta=$9,
        estado=$10,
        distrito_id=$11
      WHERE 
        id = $1
      `;
    console.log("sql:", sql);
    return db.oneOrNone(sql, [
        candidato.id,
        candidato.nombre,
        candidato.provincia,
        candidato.canton,
        candidato.parroquia,
        candidato.dignidad,
        candidato.lista,
        candidato.partido,
        candidato.nombre_papeleta,
        candidato.estado,
        candidato.distrito || null
    ]);
};
Candidato.delete = (candidato_id) => {
    const sql = `
      DELETE FROM public.candidato where id = $1`;

    return db.oneOrNone(sql, [
        candidato_id
    ]);
};

Candidato.getCandidatosPartido = (candidato) => {
    const query = `select split_part(lista,'-',1)::numeric as lista,partido, nombre,orden  
    from candidato 
    where provincia = $1 and canton = $2 and  (CASE WHEN $3 is not null then parroquia = $3 ELSE true END) 
    and dignidad = $4 and partido = $5
    and (CASE WHEN $6::bigint is not null then distrito_id = $6 ELSE true END)
    order by orden`;

    return db.manyOrNone(query, [
        candidato.provincia,
        candidato.canton,
        candidato.parroquia,
        candidato.dignidad,
        candidato.partido,
        candidato.distrito || null
    ]);
}

module.exports = Candidato;