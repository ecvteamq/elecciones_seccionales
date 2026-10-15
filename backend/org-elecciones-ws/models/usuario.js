const db = require("../config/db.config");
const crypto = require("crypto");

const usuario = {};

usuario.getAll = () => {
  const query = `
    SELECT  
    U.*,
    json_agg(
      json_build_object(
      'id', R.id,
      'nombre', R.nombre
    )
    )AS roles,
    cant.nombre as canton_nombre,
    pro.nombre as provincia_nombre,
    parr.nombre as parroquia_nombre,
    rec.nombre as recinto_nombre,
    cant.codigo as canton_codigo,
    pro.codigo as provincia_codigo,
    parr.codigo as parroquia_codigo
    FROM seguridad.usuario as U 
    INNER JOIN seguridad.usuario_rol as UR
    ON
      U.id = UR.usuario
    INNER JOIN seguridad.rol as R
    ON 
      R.id = UR.rol
    LEFT JOIN public.canton cant 
    ON u.canton = cant.id
    LEFT JOIN public.provincia pro
    on u.provincia = pro.id
    LEFT JOIN public.parroquia parr
    on u.parroquia = parr.id
    LEFT JOIN public.recinto_electoral rec
    on u.recinto_electoral = rec.id
    where U.estado = 'ACTIVO'
    GROUP BY U.id,cant.nombre,pro.nombre,parr.nombre,rec.nombre,cant.codigo,pro.codigo,parr.codigo
    `;
  return db.manyOrNone(query);
};

usuario.getUserAndRol = (id) => {
  const query = `
    SELECT  
      U.*,
      json_agg(
        json_build_object(
        'id', R.id,
        'nombre', R.nombre
      )
      )AS roles
      FROM seguridad.usuario as U 
      INNER JOIN usuario_rol as UR
      ON
        U.id = UR.usuario
      INNER JOIN rol as R
      ON 
        R.id = UR.rol
      where U.estado = 'ACTIVO' and U.id = $1
      GROUP BY U.id
      `;
  return db.oneOrNone(query, id);
};

usuario.getById = (id) => {
  const query = "select *from seguridad.usuario where id = $1 ";
  return db.oneOrNone(query, id);
};

usuario.delete = (usuario_id) => {
  console.log("usuario_id elimina:", usuario_id);
  const sql = `
  UPDATE seguridad.usuario 
    set estado = 'INACTIVO'
  WHERE id = $1`;

  return db.oneOrNone(sql, usuario_id);
};

usuario.reactivate = (usuario_id) => {
  const sql = `
  UPDATE seguridad.usuario 
    set estado = 'ACTIVO'
  WHERE id = $1`;
  return db.oneOrNone(sql, usuario_id);
};

usuario.create = (usuario) => {
  const myPasswordHashed = crypto
    .createHash("md5")
    .update(usuario.contrasenia)
    .digest("hex");
  usuario.contrasenia = myPasswordHashed;

  const sql = `
        INSERT INTO seguridad.usuario(
            identificacion,
            provincia,
            canton,
            parroquia,
            nombre,
            apellido,
            telefono,
            direccion,
            genero,
            numero_junta,
            contrasenia,
            fecha_ingreso,
            estado,
            recinto_electoral
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
            $10,
            $11,
            $12,
            $13,
            $14
        )RETURNING id;`;

  return db.oneOrNone(sql, [
    usuario.identificacion,
    usuario.provincia,
    usuario.canton,
    usuario.parroquia,
    usuario.nombre,
    usuario.apellido,
    usuario.telefono,
    usuario.direccion,
    usuario.genero,
    usuario.numero_junta,
    usuario.contrasenia,
    new Date(),
    usuario.estado,
    usuario.recinto_electoral || null,
  ]);
};

/** Actualiza los datos generales del usuario (la identificación y la contraseña no se modifican aquí). */
usuario.update = (usuario) => {
  const sql = `
    UPDATE seguridad.usuario
       SET nombre = $2,
           apellido = $3,
           telefono = $4,
           direccion = $5,
           genero = $6,
           provincia = $7,
           canton = $8,
           parroquia = $9,
           recinto_electoral = $10,
           numero_junta = $11,
           fecha_modificacion = $12
     WHERE id = $1`;

  return db.none(sql, [
    usuario.id,
    usuario.nombre,
    usuario.apellido,
    usuario.telefono,
    usuario.direccion,
    usuario.genero,
    usuario.provincia,
    usuario.canton,
    usuario.parroquia,
    usuario.recinto_electoral,
    usuario.numero_junta,
    new Date(),
  ]);
};

usuario.findByEmail = (email) => {
  const sql = `
      SELECT 
      U.*,
      json_agg(
        json_build_object(
        'id', R.id,
        'nombre', R.nombre
      )
      )AS roles
    FROM seguridad.usuario as U 
    INNER JOIN seguridad.usuario_rol as UR
    ON
      U.id = UR.usuario
    INNER JOIN seguridad.rol as R
    ON 
      R.id = UR.rol 
    WHERE U.correo = $1
  
    GROUP BY U.id
    `;

  return db.oneOrNone(sql, email);
};
usuario.findByIdentificacion = (identificacion) => {
  console.log("mi idenfiticación:", identificacion);

  const sql = `
      SELECT 
      U.*,
      json_agg(
        json_build_object(
        'id', R.id,
        'nombre', R.nombre
      )
      )AS roles,
      json_build_object(
        'codigo',pro.codigo,
        'nombre', pro.nombre,
        'id', pro.id
      )AS provincia,
      json_build_object(
        'codigo',cant.codigo,
        'nombre', cant.nombre,
        'id', cant.id
      )AS canton,
      json_build_object(
        'codigo',parr.codigo,
        'nombre', parr.nombre,
        'id', parr.id
      )AS parroquia
    FROM seguridad.usuario as U 
    INNER JOIN seguridad.usuario_rol as UR
    ON
      U.id = UR.usuario
    INNER JOIN seguridad.rol as R
    ON 
      R.id = UR.rol 
    LEFT JOIN public.canton cant 
    ON u.canton = cant.id
    LEFT JOIN public.provincia pro
    on u.provincia = pro.id
    LEFT JOIN public.parroquia parr
    on u.parroquia = parr.id
    LEFT JOIN public.recinto_electoral rec
    on u.recinto_electoral = rec.id  
    WHERE U.identificacion = $1
  
    GROUP BY U.id,pro.id,cant.id,parr.id
    `;

  return db.oneOrNone(sql, identificacion);
};

usuario.isPasswordMatched = (contrasenia, hash) => {
  const myPasswordHashed = crypto
    .createHash("md5")
    .update(contrasenia)
    .digest("hex");
  if (myPasswordHashed === hash) {
    return true;
  }
  return false;
};

usuario.refreshToken = (id, token) => {
  const sql = `
  UPDATE seguridad.usuario
  SET 
    token = $2,
    fecha_modificacion = $3 
  WHERE 
    id = $1
  `;

  return db.none(sql, [id, token, new Date()]);
};

usuario.getAllInactive = () => {
  const sql = `
  SELECT  *
    from seguridad.usuario where estado = 'INACTIVO'`;
  return db.manyOrNone(sql);
};

usuario.activateAll = () => {
  const sql = `
    UPDATE seguridad.usuario set estado = 'ACTIVO'`;
  return db.none(sql);
};

module.exports = usuario;
