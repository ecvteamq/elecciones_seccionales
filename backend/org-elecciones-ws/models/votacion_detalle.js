const db = require("../config/db.config");

const VotacionDetalle = {};

VotacionDetalle.getAll = () => {
    const query = "select * from public.votacion_detalle";
    return db.manyOrNone(query);
};
VotacionDetalle.create = () =>{
    const query = "";
    return db.oneOrNone(query,[

    ]);
}
module.exports = VotacionDetalle;