/**
 * Clase base (abstracta) para los métodos de reparto proporcional
 * por cocientes (divisores).
 *
 * Cada método concreto solo define su serie de divisores; el cálculo de
 * cocientes y la asignación de escaños se comparten aquí, de modo que
 * agregar un nuevo método no obliga a modificar el código existente.
 */
class MetodoReparto {
    constructor(codigo, nombre) {
        if (new.target === MetodoReparto) {
            throw new TypeError('MetodoReparto es abstracta, use una implementación concreta');
        }
        this.codigo = codigo;
        this.nombre = nombre;
    }

    /**
     * Divisor para la posición indicada (empieza en 0).
     * @param {number} indice
     * @returns {number}
     */
    // eslint-disable-next-line no-unused-vars
    divisor(indice) {
        throw new Error(`${this.constructor.name} debe implementar divisor(indice)`);
    }

    /**
     * Devuelve los primeros `cantidad` cocientes de dividir `votos`
     * para la serie de divisores del método.
     */
    calcularCocientes(votos, cantidad) {
        const totalVotos = Number(votos);
        if (!Number.isFinite(totalVotos) || totalVotos < 0) {
            throw new RangeError('Los votos deben ser un número mayor o igual a 0');
        }
        if (!Number.isInteger(cantidad) || cantidad < 0) {
            throw new RangeError('La cantidad de cocientes debe ser un entero mayor o igual a 0');
        }
        return Array.from({ length: cantidad }, (_, i) => totalVotos / this.divisor(i));
    }

    /**
     * Reparte `escanos` entre los partidos por el método de mayores cocientes.
     * Los empates se resuelven a favor del partido con más votos totales y,
     * si persisten, por el orden en que llegan los partidos.
     *
     * @param {{partido: string, votos: number}[]} partidos
     * @param {number} escanos
     * @returns {{partido: string, votos: number, escanos: number}[]}
     */
    asignarEscanos(partidos, escanos) {
        if (!Number.isInteger(escanos) || escanos < 0) {
            throw new RangeError('Los escaños deben ser un entero mayor o igual a 0');
        }
        const resultado = partidos.map((p) => ({ partido: p.partido, votos: Number(p.votos), escanos: 0 }));

        const cocientes = [];
        resultado.forEach((p, posicion) => {
            this.calcularCocientes(p.votos, escanos).forEach((valor) => {
                cocientes.push({ valor, posicion, votos: p.votos });
            });
        });
        cocientes
            .sort((a, b) => b.valor - a.valor || b.votos - a.votos || a.posicion - b.posicion)
            .slice(0, escanos)
            .filter((c) => c.valor > 0)
            .forEach((c) => { resultado[c.posicion].escanos++; });

        return resultado;
    }
}

module.exports = MetodoReparto;
