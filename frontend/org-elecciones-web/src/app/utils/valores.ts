export class Valores{
    public static ESTADO_ACTIVO = 'ACTIVO';
    public static primaryColor = '#570279';
    public static ESTADO_INACTIVO = 'INACTIVO';
    public static USUARIO_ADMINISTRADOR = 'Administrador';
    public static USUARIO_OPERATIVO = 'Operativo';
    public static USUARIO_GERENCIAL = 'Gerencial';
    public static COGIGO_IMBABURA = '10';
    public static COGIGO_IBARRA = '1001';
    public static DIGNIDAD_ALCALDE = 'ALCALDES MUNICIPALES';
    public static DIGNIDAD_PREFECTO = 'PREFECTOS Y VICEPREFECTOS';
    public static DIGNIDAD_CONCEJALES_URBANOS = 'CONCEJALES URBANOS';
    public static DIGNIDAD_CONCEJALES_RURALES = 'CONCEJALES RURALES';
    public static DIGNIDAD_VOCALES = 'VOCALES DE JUNTAS PARROQUIALES';
    public static DIGNIDAD_CPCCS = 'INTEGRANTES DEL CPCCS';
    /** Dignidades cuyo resultado se reparte entre los candidatos de cada partido (método D'Hondt). */
    public static DIGNIDADES_CON_REPARTO = [
        Valores.DIGNIDAD_CONCEJALES_URBANOS,
        Valores.DIGNIDAD_CONCEJALES_RURALES,
        Valores.DIGNIDAD_VOCALES,
        Valores.DIGNIDAD_CPCCS
    ];
}