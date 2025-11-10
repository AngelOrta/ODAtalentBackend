import {pool} from '../db/db.js';

export default class Alumno {
    static async obtenerPostulaciones(id_alumno, estado) {
        if(estado === undefined)
            estado = null;
        let queryPostulaciones;
        let postulacionesRows;
        if (estado) {
            queryPostulaciones = `SELECT P.id_postulacion, P.id_alumno, P.id_vacante, V.titulo, E.nombre AS nombre_empresa, E.url_logo AS logo_empresa, V.fecha_publicacion, V.fecha_limite, V.numero_vacantes, V.ciudad, V.entidad, V.modalidad, V.estado,P.estatus
            FROM Postulacion P
            JOIN Vacante V ON P.id_vacante = V.id_vacante
            JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
            JOIN Empresa E ON R.id_empresa = E.id_empresa
            WHERE P.id_alumno = ? AND V.estado = ?`;
            [postulacionesRows] = await pool.query(queryPostulaciones, [id_alumno, estado]);
        }else{
            queryPostulaciones = `SELECT P.id_postulacion, P.id_alumno, P.id_vacante, V.titulo, E.nombre AS nombre_empresa, E.url_logo AS logo_empresa, V.fecha_publicacion, V.fecha_limite, V.numero_vacantes, V.ciudad, V.entidad, V.modalidad, V.estado,P.estatus
            FROM Postulacion P
            JOIN Vacante V ON P.id_vacante = V.id_vacante
            JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
            JOIN Empresa E ON R.id_empresa = E.id_empresa
            WHERE P.id_alumno = ?`;
            [postulacionesRows] = await pool.query(queryPostulaciones, [id_alumno]);
        }
  
        if (!postulacionesRows.length) {
            return null;
        }
        return postulacionesRows;
    }

    static async postularseAVacante(id_alumno, id_vacante) {
        const [postulacionExistenteRows] = await pool.query(`SELECT * FROM Postulacion WHERE id_alumno = ? AND id_vacante = ?`, [id_alumno, id_vacante]);
        const [vacanteRows] = await pool.query(`SELECT * FROM Vacante WHERE id_vacante = ?`, [id_vacante]);
        if (!vacanteRows.length) {
            return 'VacanteNoExiste';
        }
        if (postulacionExistenteRows.length) {
            return 'YaPostulado';
        }
        const resultadoPerfilCompleto = await this.verificarPerfilCompleto(id_alumno);
        if (!resultadoPerfilCompleto) {
            return 'PerfilIncompleto';
        }

        const [insertResult] = await pool.query(`INSERT INTO Postulacion (id_alumno, id_vacante) VALUES (?, ?)`, [id_alumno, id_vacante]);
        return insertResult.insertId;
    }

    static async verificarPerfilCompleto(id_alumno) {
        try{
            const [[resultadoPerfilCompleto], [resultadoHabilidades]] = await Promise.all([pool.query(`SELECT * FROM AlumnoSolicitante WHERE id_alumno = ?`, [id_alumno]), pool.query(`SELECT * FROM Alumno_Habilidad WHERE id_alumno = ?`, [id_alumno])]);
            if(!resultadoPerfilCompleto.length)
                return false;
            if(resultadoHabilidades.length < 1||!resultadoPerfilCompleto[0].descripcion || !resultadoPerfilCompleto[0].ciudad || !resultadoPerfilCompleto[0].entidad || !resultadoPerfilCompleto[0].semestre_actual)
                return false;

            return true;
        }catch(error){
            console.error('Error al verificar el perfil del alumno:', error);
            throw new Error('Error al verificar el perfil del alumno');
        }
    }

    static async cancelarPostulacion(id_alumno, id_vacante) {
        const [vacanteRows] = await pool.query(`SELECT * FROM Vacante WHERE id_vacante = ?`, [id_vacante]);
        if (!vacanteRows.length) {
            return 'VacanteNoExiste';
        }
        const [deleteResult] = await pool.query(`DELETE FROM Postulacion WHERE id_alumno = ? AND id_vacante = ?`, [id_alumno, id_vacante]);
        if (!deleteResult.affectedRows)
            return false;
        return true;
    }
}