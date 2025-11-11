import {pool} from '../db/db.js';

export default class Alumno {
    static async obtenerPerfilAlumno(id_alumno) {
        const queryAlumno = `SELECT A.id_alumno, U.id AS id_usuario, U.nombre, U.correo, A.fecha_nacimiento, A.telefono, A.ciudad, A.entidad, A.descripcion, A.url_cv, A.semestre_actual, A.visualizaciones, U.url_foto_perfil, A.completado 
        FROM AlumnoSolicitante A
        JOIN Usuario U ON A.id_usuario = U.id
        WHERE A.id_alumno = ?`;
        const queryEscolaridad = `SELECT * FROM Escolaridad WHERE id_alumno = ?`;
        const queryExperiencia = `SELECT * FROM Experiencia WHERE id_alumno = ?`;
        const queryExpHab=`SELECT EH.id_experiencia, H.id_habilidad, H.categoria, H.tipo, H.habilidad
        FROM Experiencia_Habilidad EH
        JOIN Habilidad H ON EH.id_habilidad = H.id_habilidad
        WHERE EH.id_experiencia IN (SELECT id_experiencia FROM Experiencia WHERE id_alumno = ?)`;
        const queryURL=`SELECT * FROM URLExterna WHERE id_alumno = ?`;
        const queryCursos=`SELECT * FROM Curso WHERE id_alumno = ?`;
        const queryCertificados=`SELECT * FROM Certificado WHERE id_alumno = ?`;
        const queryCertiHab=`SELECT CH.id_certificado, H.id_habilidad, H.categoria, H.tipo, H.habilidad
        FROM Certificado_Habilidad CH
        JOIN Habilidad H ON CH.id_habilidad = H.id_habilidad
        WHERE CH.id_certificado IN (SELECT id_certificado FROM Certificado WHERE id_alumno = ?)`;
        const queryHab=`SELECT AH.id_alumno, H.id_habilidad, H.categoria, H.tipo, H.habilidad
        FROM Alumno_Habilidad AH
        JOIN Habilidad H ON AH.id_habilidad = H.id_habilidad
        WHERE AH.id_alumno = ?;`;
        const [alumnoRows] = await pool.query(queryAlumno, [id_alumno]);
        if (!alumnoRows.length) {
            return null;
        }
       const [ [escolaridadRows], [experienciaRows], [expHabRows], [urlRows], [cursosRows], [certificadosRows], [certiHabRows], [habRows] ] = await Promise.all([ pool.query(queryEscolaridad, [id_alumno]), pool.query(queryExperiencia, [id_alumno]), pool.query(queryExpHab, [id_alumno]), pool.query(queryURL, [id_alumno]), pool.query(queryCursos, [id_alumno]), pool.query(queryCertificados, [id_alumno]), pool.query(queryCertiHab, [id_alumno]), pool.query(queryHab, [id_alumno]) ]);

       const perfilBase = alumnoRows[0];

       const experiencias = experienciaRows.map(exp => {
            // Filtrar habilidades de esta experiencia
            const habilidades_desarrolladas = expHabRows.filter(
                skill => skill.id_experiencia === exp.id_experiencia
            );
            return {
                ...exp,
                habilidades_desarrolladas: habilidades_desarrolladas
            };
        });

        const certificados = certificadosRows.map(certi => {
            // Filtrar habilidades de este certificado
            const habilidades_desarrolladas = certiHabRows.filter(
                skill => skill.id_certificado === certi.id_certificado
            );
            return {
                ...certi,
                habilidades_desarrolladas: habilidades_desarrolladas
            };
        });

        const jsonFinal = {
            ...perfilBase,
            escolaridad: escolaridadRows,
            experiencia_laboral: experiencias,
            urls_externas: urlRows,
            cursos: cursosRows,
            certificados: certificados,
            habilidades: habRows,
        };
        return jsonFinal;
    }

    static async actualizarFotoPerfilAlumno(id_alumno, url_foto) {
        const [result] = await pool.query(`UPDATE Usuario U
        JOIN AlumnoSolicitante A ON U.id = A.id_usuario
        SET U.url_foto_perfil = ?
        WHERE A.id_alumno = ?`, [url_foto, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        return result.affectedRows > 0;
    }

    static async actualizarHabilidadesPerfilAlumno(arregloHabilidades, tipo) {
        try{   
             const id_alumno = arregloHabilidades[0].id_alumno;
            await pool.query(`DELETE FROM Alumno_Habilidad WHERE id_alumno = ? AND id_habilidad IN (SELECT id_habilidad FROM Habilidad WHERE tipo = ?)`, [id_alumno, tipo]);
            if(arregloHabilidades.length === 0)
                return true;
            const valores = arregloHabilidades.map(habilidad => [habilidad.id_alumno, habilidad.id_habilidad]);
            const [insertResult] = await pool.query(`INSERT INTO  Alumno_Habilidad (id_alumno, id_habilidad) VALUES ?`, [valores]);

            this.verificarPerfilCompleto(id_alumno); // actualizar campo completado si es necesario
            return insertResult.affectedRows > 0;
        }catch(error){
            console.error('Error al actualizar las habilidades del perfil del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage.includes('alumno_habilidad_ibfk_2')){
                throw new Error('Una o más habilidades no existen');
            }
            if(error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage.includes('alumno_habilidad_ibfk_1')){
                throw new Error('El alumno no existe');
            }
        }
    }

    static async actualizarDescripcionPerfilAlumno(id_alumno, descripcion) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET descripcion = ? WHERE id_alumno = ?`, [descripcion, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        await this.verificarPerfilCompleto(id_alumno); // actualizar campo completado si es necesario
        return result.affectedRows > 0;
    }

    static async subirCVAlumno(id_alumno, url_cv) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET url_cv = ? WHERE id_alumno = ?`, [url_cv, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        return result.affectedRows > 0;
    }

    static async actualizarSemestreAlumno(id_alumno, semestre_actual) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET semestre_actual = ? WHERE id_alumno = ?`, [semestre_actual, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        await this.verificarPerfilCompleto(id_alumno); // actualizar campo completado si es necesario
        return result.affectedRows > 0;
    }

    static async actualizarCiudadEntidadAlumno(id_alumno, ciudad, entidad) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET ciudad = ?, entidad = ? WHERE id_alumno = ?`, [ciudad, entidad, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        await this.verificarPerfilCompleto(id_alumno); // actualizar campo completado si es necesario
        return result.affectedRows > 0;
    }

    static async actualizarTelefonoAlumno(id_alumno, telefono) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET telefono = ? WHERE id_alumno = ?`, [telefono, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        return result.affectedRows > 0;
    }

    static async actualizarFechaNacimientoAlumno(id_alumno, fecha_nacimiento) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET fecha_nacimiento = ? WHERE id_alumno = ?`, [fecha_nacimiento, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        return result.affectedRows > 0;
    }

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

            if(!resultadoPerfilCompleto[0].completado)
                await pool.query(`UPDATE AlumnoSolicitante SET completado = 1 WHERE id_alumno = ?`, [id_alumno]);
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