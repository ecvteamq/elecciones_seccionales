const usuario = require("../models/usuario");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");
const { createToken, getTokenData } = require("../config/jwt.config");
const Rol = require("../models/rol");
const UsuarioRol = require("../models/usuario_rol");
require("dotenv").config();

/** Convierte los códigos de provincia/cantón/parroquia del formulario en ids y normaliza el recinto */
async function resolverUbicacion(user) {
  const provincia = user.provincia ? await Provincia.findByCodigo(user.provincia) : null;
  const canton = user.canton ? await Canton.findByCodigo(user.canton, user.provincia) : null;
  const parroquia = user.parroquia
    ? await Parroquia.findByCodigo(user.parroquia, user.provincia, user.canton)
    : null;
  const recinto = user.recinto_electoral;
  return {
    provincia: provincia ? provincia.id : null,
    canton: canton ? canton.id : null,
    parroquia: parroquia ? parroquia.id : null,
    recinto_electoral: recinto && typeof recinto == "object" ? recinto.id : recinto || null,
  };
}

module.exports = {
  async getAll(req, res, next) {
    try {
      const data = await usuario.getAll();
      return res.status(200).json(data);
    } catch (error) {
      console.log(`Error:${error} `);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los usuarios",
      });
    }
  },
  async getAllInactive(req, res, next) {
    try {
      const data = await usuario.getAllInactive();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los usuarios inactivos",
      });
    }
  },
  async getRepartidorRandom(req, res, next) {
    try {
      const data = await usuario.getRepartidorRandom();
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el repartidor",
      });
    }
  },
  async findByEmail(req, res, next) {
    try {
      const email = req.params.email;
      const data = await usuario.findByEmail(email);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el usuario por email : " + error.message,
      });
    }
  },
  async create(req, res, next) {
    try {
      const user = req.body;
      const verifyUser = await usuario.findByIdentificacion(
        user.identificacion
      );
      if (verifyUser == null) {
        user.estado = "INACTIVO";
        const parroquiaResult = await Parroquia.findByCodigo(
          user.parroquia,
          user.provincia,
          user.canton
        );
        user.parroquia = JSON.parse(JSON.stringify(parroquiaResult)).id;

        const cantonResult = await Canton.findByCodigo(
          user.canton,
          user.provincia
        );
        user.canton = JSON.parse(JSON.stringify(cantonResult)).id;

        const provinciaResult = await Provincia.findByCodigo(user.provincia);
        user.provincia = JSON.parse(JSON.stringify(provinciaResult)).id;

        const data = await usuario.create(user);
        /**Al crear un usuario le asignamos por defecto el rol de digitador */
        await UsuarioRol.create(data.id, 2);
        return res.status(201).json({
          success: true,
          message:
            "El registro se realizo correctamente, espere hasta que el administrador active su cuenta",
          data: data.id,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "La identificación ingresada ya se encuentra registrada.",
        });
      }
    } catch (error) {
      next(error);
      /**Errores en conexion con la base de datos */
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro del usuario",
        error: error,
      });
    }
  },
  async confirmarEmail(req, res) {
    try {
      // Obtener el token del param
      const { token } = req.params;

      // Verificar la data del usuario con el token recibido
      const data = await getTokenData(token);

      /**Si no se pudo verificar la identidad del usuario */
      if (data === null) {
        return res.redirect("/error.html");
      } else {
        const { email } = data.data;

        // Verificar existencia del usuario
        const usuario_existe = (await usuario.findByEmail(email)) || null;
        console.log("usuario_existe:", usuario_existe);
        if (usuario_existe === null) {
          return res.status(400).json({
            success: false,
            msg: "Usuario no existe",
          });
        } else {
          // Actualizar usuario
          usuario_existe.confirma_email = true;
          await usuario.confirma_email(usuario_existe);

          // Redireccionar a la confirmación
          return res.redirect("/confirm.html");
        }
      }
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        msg: "Error al confirmar usuario",
      });
    }
  },
  async login(req, res, next) {
    try {
      console.log("body:", req.body);
      const { identificacion, contrasenia, method_auth } = req.body;
      console.log("identificacion param:", identificacion);

      const usuario_existe = await usuario.findByIdentificacion(identificacion);
      // console.log("usuario existe:",usuario_existe);
      if (!usuario_existe) {
        return res.status(401).json({
          success: false,
          message: "El usuario no fue encontrado",
        });
      } else {
        console.log("password:", contrasenia);
        if (
          usuario.isPasswordMatched(contrasenia, usuario_existe.contrasenia)
        ) {
          if (usuario_existe.estado != "INACTIVO") {
            const token = createToken({
              identificacion: usuario_existe.identificacion,
            });

            /**Data del usuario para que la reciba flutter
             * y haga las validaciones respectivas
             * */
            const data = {
              id: usuario_existe.id,
              nombre: usuario_existe.nombre,
              apellido: usuario_existe.apellido,
              correo: usuario_existe.correo,
              telefono: usuario_existe.telefono,
              token: `${token}`,
              expires_in: process.env.EXPIRES_IN,
              token_type: "Bearer",
              roles: usuario_existe.roles,
              estado: usuario_existe.estado,
              provincia: usuario_existe.provincia,
              canton: usuario_existe.canton,
              parroquia: usuario_existe.parroquia,
              genero: usuario_existe.genero,
              numero_junta: usuario_existe.numero_junta,
            };
            console.log("data del usuario:", data);

            await usuario.refreshToken(usuario_existe.id, `Bearer ${token}`);

            return res.status(201).json({
              success: true,
              data: data,
              message: "El usuario se ha autenticado correctamente",
            });
          } else {
            return res.status(401).json({
              success: false,
              message:
                "El usuario esta inactivo, pongase en contacto con el administrador",
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: "Usuario o contraseña incorrecta",
          });
        }
      }
    } catch (error) {
      console.log(`Error login:  ${error}`);
      next(error);
      return res.status(501).json({
        success: false,
        message: "Error al momento de hacer login",
        error: error.detail,
      });
    }
  },

  async logout(req, res, next) {
    try {
      let id = req.body.id;
      await usuario.refreshToken(id, null);

      return res.status(201).json({
        success: true,
        message: "La sesión del usuario se ha cerrado correctamente",
      });
    } catch (error) {
      console.log(`Error login:  ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de cerrar la sesión",
        error: error.detail,
      });
    }
  },
  async findById(req, res, next) {
    try {
      const id = req.params.id;
      const data = await usuario.findByUserId(id);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      next(error);
      return res.status(501).json({
        success: false,
        message: "Error al obtener el usuario por ID",
      });
    }
  },
  /** Creación de usuarios desde la administración: queda ACTIVO con los roles indicados */
  async createByAdmin(req, res, next) {
    try {
      const user = req.body;
      if (!user.roles || user.roles.length == 0) {
        return res.status(400).json({
          success: false,
          message: "Asigne por lo menos un rol",
        });
      }
      if (!user.contrasenia) {
        return res.status(400).json({
          success: false,
          message: "Debe ingresar la contraseña",
        });
      }
      const verifyUser = await usuario.findByIdentificacion(user.identificacion);
      if (verifyUser != null) {
        return res.status(400).json({
          success: false,
          message: "La identificación ingresada ya se encuentra registrada.",
        });
      }
      Object.assign(user, await resolverUbicacion(user));
      user.estado = "ACTIVO";
      const data = await usuario.create(user);
      for (const rol of user.roles) {
        await UsuarioRol.create(data.id, rol.id);
      }
      return res.status(201).json({
        success: true,
        message: "El usuario se creó correctamente",
        data: data.id,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error con el registro del usuario",
        error: error.detail,
      });
    }
  },
  async update(req, res, next) {
    try {
      const usuarioBody = req.body;
      console.log("usuario body:", usuarioBody);
      if (!usuarioBody.roles || usuarioBody.roles.length == 0) {
        return res.status(400).json({
          success: false,
          message: "Asigne por lo menos un rol",
        });
      }
      Object.assign(usuarioBody, await resolverUbicacion(usuarioBody));
      const usuario_roles = await UsuarioRol.getById(usuarioBody.id);

      /**Elimina los roles que ya tenia ese usuario*/
      for (const usuario_rol of usuario_roles) {
        await UsuarioRol.delete(usuario_rol.id);
      }
      /** Crea nuevos roles*/
      for (const rolCrear of usuarioBody.roles) {
        await UsuarioRol.create(usuarioBody.id, rolCrear.id);
      }
      await usuario.update(usuarioBody);
      return res.status(201).json({
        success: true,
        message: "Se ha actualizado correctamente la información",
      });
    } catch (error) {
      /**Errores en conexion con la base de datos */
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Hubo un error al actualizar la información del usuario",
        error: error.detail,
      });
    }
  },
  async changePassword(req, res, next) {
    try {
      const usuarioBody = req.body;
      console.log("usuario bodey:", usuarioBody);

      const data = (await usuario.findByEmail(usuarioBody.email)) || null;
      if (data == null) {
        return res.status(400).json({
          success: false,
          msg: "Correo no registrado",
        });
      } else {
        const token = createToken({ email: usuarioBody.email });
        const template = getTemplateResetPassword(token);
        await sendEmail(usuarioBody.email, "Recuperar contraseña", template);

        return res.status(201).json({
          success: true,
          message: "Se ha enviado el correo",
        });
      }
    } catch (error) {
      console.log(`Error login:  ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al momento de cerrar la sesión",
        error: error.detail,
      });
    }
  },
  async findDeliveryMen(req, res, next) {
    try {
      const data = await usuario.findDeliveryMen();
      console.log(`Repartidores: ${data}`);
      return res.status(201).json(data);
    } catch (error) {
      console.log(`Error: ${error}`);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los repartidores",
      });
    }
  },
  async delete(req, res, next) {
    try {
      const usuario_id = JSON.parse(req.body.usuario_id);
      console.log("usuario_id param:", usuario_id);

      const data = await usuario.getById(usuario_id);
      console.log("data:", data);
      if (data != null) {
        await usuario.delete(usuario_id);
        return res.status(201).json({
          success: true,
          message: "La eliminación se realizo correctamente",
        });
      } else {
        return res.status(501).json({
          success: false,
          message: "El usuario a eliminar no existe",
        });
      }
    } catch (error) {
      return res.status(501).json({
        success: false,
        message: "Error al eliminar el usuario",
      });
    }
  },
  async reactivate(req, res, next) {
    try {
      const usuario_id = JSON.parse(req.body.usuario_id);
      const data = await usuario.getById(usuario_id);
      if (data != null) {
        await usuario.reactivate(usuario_id);
        return res.status(201).json({
          success: true,
          message: "La reactivación del usuario se realizo correctamente",
        });
      } else {
        return res.status(501).json({
          success: false,
          message: "El usuario a reactivar no existe",
        });
      }
    } catch (error) {
      return res.status(501).json({
        success: false,
        message: "Error al reactivar el usuario",
      });
    }
  },
  async activateAll(req, res, next) {
    try {
      const data = await usuario.activateAll();
      return res.status(200).json(data);
    } catch (error) {
      console.log(`Error:${error} `);
      return res.status(501).json({
        success: false,
        message: "Error al obtener los usuarios",
      });
    }
  },
};
