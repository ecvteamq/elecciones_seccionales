const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// PARA QUE EXPRESS PUEDA DEVOLVER O OBTENER RESPUESTAS EN FORMATO JSON O URL ENCODED
app.use(morgan("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

//CONFIGURACIÓN PARA QUE NODE RENDERICE CONTENIDO ESTATICO
app.use(express.static("./public"));

//SEGURIDAD DEL SERVIDOR
app.use(cors());
app.disable("x-powered-by");

//RUTAS
const rolRoutes = require("./routes/rol.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const provinciaRoutes = require("./routes/provincia.routes");
const cantonRoutes = require("./routes/canton.routes");
const parroquiaRoutes = require("./routes/parroquia.routes");
const dignidadRoutes = require("./routes/dignidad.routes");
const recintoRoutes = require("./routes/recinto_electoral.routes");
const candidatoRoutes = require("./routes/candidato.routes");
const actaRoutes = require("./routes/acta.routes");
const distritoRoutes = require("./routes/distrito.routes");

//LLAMADAS A LAS RUTAS
rolRoutes(app);
usuarioRoutes(app);
provinciaRoutes(app);
cantonRoutes(app);
parroquiaRoutes(app);
dignidadRoutes(app);
recintoRoutes(app);
candidatoRoutes(app);
actaRoutes(app);
distritoRoutes(app);

// RUTA DE PRUEBA
app.get("/", (req, res) => {
  res.send("Ruta raíz del backend");
});

//INICIALIZACIÓN DEL SERVIDOR
const port = process.env.PORT || 3001;

server.listen(port, function () {
  console.log("Aplicacion de NodeJS en el puerto " + port + " Iniciada ....");
});

//ERROR HANDLER

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500 || 501).send(err.stack);
});
