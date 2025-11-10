import {pool} from '../db/db.js';

export default class Vacante {
    constructor(id_vacante, id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, fecha_publicacion, escolaridad, conocimientos, observaciones, numero_vacantes, estado) {
        this.id_vacante = id_vacante;
        this.id_reclutador = id_reclutador;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.beneficios = beneficios;
        this.duracion = duracion;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.monto_beca = monto_beca;
        this.horario = horario;
        this.ubicacion = ubicacion;
        this.ciudad = ciudad;
        this.entidad = entidad;
        this.codigo_postal = codigo_postal;
        this.modalidad = modalidad;
        this.fecha_limite = fecha_limite;
        this.fecha_publicacion = fecha_publicacion;
        this.escolaridad = escolaridad;
        this.conocimientos = conocimientos;
        this.observaciones = observaciones;
        this.numero_vacantes = numero_vacantes;
        this.estado = estado;
    }

    static async obtenerDetallesVacante(id_vacante) {
        const queryVacanteData = `SELECT V.*, E.id_empresa, E.nombre, E.url_logo, E.sitio_web
            FROM Vacante V
            JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
            JOIN Empresa E ON R.id_empresa = E.id_empresa
            WHERE V.id_vacante = ?;`;
        const queryHabilidades = `SELECT H.id_habilidad, H.categoria, H.tipo, H.habilidad
            FROM Habilidad H
            JOIN Vacante_Habilidad VH ON H.id_habilidad = VH.id_habilidad
            WHERE VH.id_vacante = ?`;
        const queryRolesTrabajo = `SELECT RT.id_roltrabajo, RT.nombre
            FROM RolTrabajo RT
            JOIN Vacante_RolTrabajo VRT ON RT.id_roltrabajo = VRT.id_roltrabajo
            WHERE VRT.id_vacante = ?`;

        const [ [vacanteResult], [habilidadResult], [rolResult] ] = await Promise.all([
            pool.query(queryVacanteData, [id_vacante]),
            pool.query(queryHabilidades, [id_vacante]),
            pool.query(queryRolesTrabajo, [id_vacante])
        ]);
        
        if (!vacanteResult || vacanteResult.length === 0) {
            return null;
        }
        const vacanteData = vacanteResult[0];
        const finalJSON = {
            ...vacanteData, // Copiar todos los campos de la tabla Vacante
            empresa: {
            id_empresa: vacanteData.id_empresa,
            nombre_empresa: vacanteData.nombre,
            logo_empresa: vacanteData.url_logo,
            sitio_web: vacanteData.sitio_web
            },
            habilidades: habilidadResult,
            roles_relacionados: rolResult
        };
        delete finalJSON.id_empresa;
        delete finalJSON.nombre;
        delete finalJSON.url_logo;
        delete finalJSON.sitio_web;
        return finalJSON;
    }
}