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

    //cada que se agrega un certificado o curso, se pueden agregar nuevas habilidades al alumno
    //asi se puede saber si hay nuevas habilidades del alumno
    static async actualizarHabilidadesPerfilAlumnoSinTipo(connection,habilidades_desarrolladas, id_alumno) { 
            //seleccionar las habilidades que ya tiene el alumno
            const [idsAlumnoHabilidadRows] = await connection.query(`SELECT id_habilidad FROM Alumno_Habilidad WHERE id_alumno = ?`, [id_alumno]);
            const idsAlumnoHabilidad = new Set(idsAlumnoHabilidadRows.map(row => row.id_habilidad));
            const nuevasAlumnoHabilidad = habilidades_desarrolladas.filter(row => !idsAlumnoHabilidad.has(row.id_habilidad));
            if(nuevasAlumnoHabilidad.length > 0){
                const resultadoNuevoAlumnoHabilidad = await connection.query(`INSERT INTO Alumno_Habilidad (id_alumno, id_habilidad) VALUES ?`, [nuevasAlumnoHabilidad.map(row => [id_alumno, row.id_habilidad])]);
                return resultadoNuevoAlumnoHabilidad[0].affectedRows > 0;
            }
            return false;
    }


    static async actualizarDescripcionPerfilAlumno(id_alumno, descripcion) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante SET descripcion = ? WHERE id_alumno = ?`, [descripcion, id_alumno]);
        if(result.info.includes('Rows matched: 0'))
            return null;
        await this.verificarPerfilCompleto(id_alumno); // actualizar campo completado si es necesario
        return result.affectedRows > 0;
    }

    static async subirCVAlumno(uid_alumno, url_cv) {
        const [result] = await pool.query(`UPDATE AlumnoSolicitante AS A JOIN Usuario AS U ON A.id_usuario = U.id SET A.url_cv = ? WHERE U.uid_firebase = ?`, [url_cv, uid_alumno]);
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

    static async agregarEscolaridadAlumno(id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin) {
        try{
            if(!carrera){
                const [duplicados]=await pool.query(`SELECT * FROM Escolaridad WHERE id_alumno = ? AND nivel = ? AND institucion = ? AND plantel = ?`, [id_alumno, nivel, institucion, plantel]);
                if(duplicados.length > 0)
                    return 'duplicado';
            }
            const [insertResult] = await pool.query(`INSERT INTO Escolaridad (id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin]);
            return insertResult.insertId;
        }catch(error){
            console.error('Error al agregar la escolaridad del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('escolaridad_ibfk_1')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return 'duplicado';
            }
            throw new Error('Error al agregar la escolaridad del alumno');
        }
    }

    static async actualizarEscolaridadAlumno(id_escolaridad,id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin) {
        try{
            const [result] = await pool.query(`UPDATE Escolaridad SET nivel = ?, institucion = ?, carrera = ?, plantel = ?, nota = ?, fecha_inicio = ?, fecha_fin = ? WHERE id_escolaridad = ? AND id_alumno = ?`, [nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin, id_escolaridad, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al actualizar la escolaridad del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('escolaridad_ibfk_1')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY')
                return 'duplicado';
            throw new Error('Error al actualizar la escolaridad del alumno');
        }
    }

    static async eliminarEscolaridadAlumno(id_escolaridad, id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM Escolaridad WHERE id_escolaridad = ? AND id_alumno = ?`, [id_escolaridad, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al eliminar la escolaridad del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar la escolaridad del alumno');
        }
    }

    static async agregarUrlExternaAlumno(id_alumno, url, descripcion) {
        try{
            const [insertResult] = await pool.query(`INSERT INTO URLExterna (id_alumno, url, tipo) VALUES (?, ?, ?)`, [id_alumno, url, descripcion]);
            return insertResult.insertId;
        }catch(error){
            console.error('Error al agregar la URL externa del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('urlexterna_ibfk_1')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY')
                return 'duplicado';
            throw new Error('Error al agregar la URL externa del alumno');
        }
    }

    static async actualizarUrlExternaAlumno(id_url_externa, id_alumno, url, descripcion) {
        try{
            const [result] = await pool.query(`UPDATE URLExterna SET url = ?, tipo = ? WHERE id_url = ? AND id_alumno = ?`, [url, descripcion, id_url_externa, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al actualizar la URL externa del alumno:', error.sqlMessage);
            if(error.code === 'ER_DUP_ENTRY')
                return 'duplicado';
            throw new Error('Error al actualizar la URL externa del alumno');
        }
    }

    static async eliminarUrlExternaAlumno(id_url_externa, id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM URLExterna WHERE id_url = ? AND id_alumno = ?`, [id_url_externa, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al eliminar la URL externa del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar la URL externa del alumno');
        }
    }

    static async agregarCursoAlumno(id_alumno, nombre, institucion, fecha_inicio, fecha_fin) {
        try{
            const [insertResult] = await pool.query(`INSERT INTO Curso (id_alumno, nombre, institucion, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)`, [id_alumno, nombre, institucion, fecha_inicio, fecha_fin]);
            return insertResult.insertId;
        }catch(error){
            console.error('Error al agregar el curso del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('curso_ibfk_1')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return 'duplicado';
            }
            throw new Error('Error al agregar el curso del alumno');
        }
    }

    static async actualizarCursoAlumno(id_curso, id_alumno, nombre, institucion, fecha_inicio, fecha_fin) {
        try{
            const [result] = await pool.query(`UPDATE Curso SET nombre = ?, institucion = ?, fecha_inicio = ?, fecha_fin = ? WHERE id_curso = ? AND id_alumno = ?`, [nombre, institucion, fecha_inicio, fecha_fin, id_curso, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al actualizar el curso del alumno:', error.sqlMessage);
            if(error.code === 'ER_DUP_ENTRY'){
                return 'duplicado';
            }
            throw new Error('Error al actualizar el curso del alumno');
        }
    }

    static async eliminarCursoAlumno(id_curso, id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM Curso WHERE id_curso = ? AND id_alumno = ?`, [id_curso, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al eliminar el curso del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar el curso del alumno');
        }
    }

    static async agregarCertificadoAlumno(certificadoData) {
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const resultadoInsertCertificado = await connection.query(`INSERT INTO Certificado (id_alumno, nombre, institucion, fecha_expedicion, fecha_caducidad, id_credencial, url_certificado) VALUES (?, ?, ?, ?,?,?,?)`, [certificadoData.id_alumno, certificadoData.nombre, certificadoData.institucion, certificadoData.fecha_expedicion, certificadoData.fecha_caducidad, certificadoData.id_credencial, certificadoData.url_certificado]);
            const id_certificado = resultadoInsertCertificado[0].insertId;

            if(certificadoData.habilidades_desarrolladas && certificadoData.habilidades_desarrolladas.length > 0){
                const resultadoCursoHabilidades = await connection.query(`INSERT INTO Certificado_Habilidad (id_certificado, id_habilidad) VALUES ?`, [certificadoData.habilidades_desarrolladas.map(habilidad => [id_certificado, habilidad.id_habilidad])]);
                if(!resultadoCursoHabilidades[0].affectedRows)
                    throw new Error('Error al asociar las habilidades desarrolladas al certificado');
                //agregar las nuevas habilidades al perfil del alumno
                await this.actualizarHabilidadesPerfilAlumnoSinTipo(connection, certificadoData.habilidades_desarrolladas, certificadoData.id_alumno);
                //console.log('Nuevas habilidades del alumno agregadas al perfil desde certificado:', nh);
            }

            await connection.commit();
            return id_certificado;
        }catch(error){
            if(connection)
                await connection.rollback();
            console.error('Error al agregar el certificado del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('certificado_habilidad_ibfk_2')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return 'duplicado';
            }
            throw error;
        }finally{
            if(connection)
                connection.release();
        }
    }

    static async actualizarCertificadoAlumno(certificadoData) {
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [result] = await connection.query(`UPDATE Certificado SET nombre = ?, institucion = ?, fecha_expedicion = ?, fecha_caducidad = ?, id_credencial = ?, url_certificado = ? WHERE id_certificado = ? AND id_alumno = ?`, [certificadoData.nombre, certificadoData.institucion, certificadoData.fecha_expedicion, certificadoData.fecha_caducidad, certificadoData.id_credencial, certificadoData.url_certificado, certificadoData.id_certificado, certificadoData.id_alumno]);   
            if(result.info.includes('Rows matched: 0'))
                return null;

            await connection.query(`DELETE FROM Certificado_Habilidad WHERE id_certificado = ?`, [certificadoData.id_certificado]);
            if(certificadoData.habilidades_desarrolladas.length > 0){
                const resultadoCertiHabilidades = await connection.query(`INSERT INTO Certificado_Habilidad (id_certificado, id_habilidad) VALUES ?`, [certificadoData.habilidades_desarrolladas.map(habilidad => [certificadoData.id_certificado, habilidad.id_habilidad])]);
                if(!resultadoCertiHabilidades[0].affectedRows)
                    throw new Error('Error al asociar las habilidades desarrolladas al certificado');

                await this.actualizarHabilidadesPerfilAlumnoSinTipo(connection, certificadoData.habilidades_desarrolladas, certificadoData.id_alumno);
            }

            await connection.commit();
            return true;
        }catch(error){
            if(connection)
                await connection.rollback();
            console.error('Error al actualizar el certificado del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('certificado_habilidad_ibfk_2')){
                return null;
            }
            throw error;
        }finally{
            if(connection)
                connection.release();
        }
    }

    static async eliminarCertificadoAlumno(id_certificado, id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM Certificado WHERE id_certificado = ? AND id_alumno = ?`, [id_certificado, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al eliminar el certificado del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar el certificado del alumno');
        }
    }

    static async agregarExperienciaLaboralAlumno(experienciaData) {
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const resultadoInsertExperiencia = await connection.query(`INSERT INTO Experiencia (id_alumno, cargo, empresa, fecha_inicio, fecha_fin, descripcion) VALUES (?, ?, ?, ?,?,?)`, [experienciaData.id_alumno, experienciaData.cargo, experienciaData.empresa, experienciaData.fecha_inicio, experienciaData.fecha_fin, experienciaData.descripcion]);
            const id_experiencia = resultadoInsertExperiencia[0].insertId;

            if(experienciaData.habilidades_desarrolladas && experienciaData.habilidades_desarrolladas.length > 0){
                const resultadoExpHabilidades = await connection.query(`INSERT INTO Experiencia_Habilidad (id_experiencia, id_habilidad) VALUES ?`, [experienciaData.habilidades_desarrolladas.map(habilidad => [id_experiencia, habilidad.id_habilidad])]);
                if(!resultadoExpHabilidades[0].affectedRows)
                    throw new Error('Error al asociar las habilidades desarrolladas a la experiencia laboral');
                //agregar las nuevas habilidades al perfil del alumno
                await this.actualizarHabilidadesPerfilAlumnoSinTipo(connection, experienciaData.habilidades_desarrolladas, experienciaData.id_alumno);
            }

            await connection.commit();
            return id_experiencia;
        }catch(error){
            if(connection)
                await connection.rollback();
            console.error('Error al agregar la experiencia del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2'){
                if(error.sqlMessage.includes('experiencia_ibfk_1'))
                    return null;
                if(error.sqlMessage.includes('experiencia_habilidad_ibfk_2'))
                    return 'noHabilidad';
            }
            if(error.code === 'ER_DUP_ENTRY'){
                if(error.sqlMessage.includes('unique_experiencia_alumno'))
                    return 'duplicado';
                if(error.sqlMessage.includes('experiencia_habilidad'))
                    return 'duplicadoHabilidad';
            }
            throw error;
        }finally{
            if(connection)
                connection.release();
        }
    }

    static async actualizarExperienciaLaboralAlumno(experienciaData) {
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [result] = await connection.query(`UPDATE Experiencia SET cargo = ?, empresa = ?, fecha_inicio = ?, fecha_fin = ?, descripcion = ? WHERE id_experiencia = ? AND id_alumno = ?`, [experienciaData.cargo, experienciaData.empresa, experienciaData.fecha_inicio, experienciaData.fecha_fin, experienciaData.descripcion, experienciaData.id_experiencia, experienciaData.id_alumno]);   
            if(result.info.includes('Rows matched: 0'))
                return null;    
            await connection.query(`DELETE FROM Experiencia_Habilidad WHERE id_experiencia = ?`, [experienciaData.id_experiencia]);
            if(experienciaData.habilidades_desarrolladas.length > 0){
                const resultadoExpHabilidades = await connection.query(`INSERT INTO Experiencia_Habilidad (id_experiencia, id_habilidad) VALUES ?`, [experienciaData.habilidades_desarrolladas.map(habilidad => [experienciaData.id_experiencia, habilidad.id_habilidad])]);
                if(!resultadoExpHabilidades[0].affectedRows)
                    throw new Error('Error al asociar las habilidades desarrolladas a la experiencia laboral');
                await this.actualizarHabilidadesPerfilAlumnoSinTipo(connection, experienciaData.habilidades_desarrolladas, experienciaData.id_alumno);
            }

            await connection.commit();
            return true;
        }catch(error){
            if(connection)
                await connection.rollback();
            console.error('Error al actualizar la experiencia del alumno:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2'){
                if(error.sqlMessage.includes('experiencia_habilidad_ibfk_2'))
                    return 'noHabilidad';
            }
            if(error.code === 'ER_DUP_ENTRY'){
                if(error.sqlMessage.includes('unique_experiencia_alumno'))
                    return 'duplicado';
                if(error.sqlMessage.includes('experiencia_habilidad'))
                    return 'duplicadoHabilidad';
            }
            throw error;
        }finally{
            if(connection)
                connection.release();
        }
    }

    static async eliminarExperienciaLaboralAlumno(id_experiencia, id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM Experiencia WHERE id_experiencia = ? AND id_alumno = ?`, [id_experiencia, id_alumno]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }   catch(error){
            console.error('Error al eliminar la experiencia del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar la experiencia del alumno');
        }
    }
    
    //TODO: eliminarCuentaAlumno
    static async eliminarCuentaAlumno(id, id_alumno) {
        console.log(id, id_alumno);
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            await connection.query(`DELETE FROM URLExterna WHERE id_alumno = ?`, [id_alumno]);
            const [resAnonUser] = await connection.query(`UPDATE Usuario SET nombre = 'Usuario Anónimo', correo = CONCAT('anon_', id, '@deleted.com'), uid_firebase = NULL, url_foto_perfil = NULL WHERE id = ?`, [id]);
            if(resAnonUser.info.includes('Rows matched: 0')){
                return null;
            }
            const [resAnonAlumn] =await connection.query(`UPDATE AlumnoSolicitante SET fecha_nacimiento = NULL, descripcion = NULL, url_cv = NULL, telefono = NULL WHERE id_alumno = ?`, [id_alumno]);
            if(resAnonAlumn.info.includes('Rows matched: 0')){
                return null;    
            }
            await connection.query(`UPDATE Certificado SET id_credencial = NULL, url_certificado = NULL WHERE id_alumno = ?`, [id_alumno]);
            await connection.query(`DELETE FROM Postulacion WHERE id_alumno = ?`, [id_alumno]);
            await connection.query(`DELETE FROM Notificacion WHERE id_alumno = ?`, [id_alumno]);

            await connection.commit();
            return true;
        }catch(error){
            console.log(error);
            if(connection)
                await connection.rollback();
            console.error('Error al eliminar la cuenta del alumno:', error.sqlMessage);
            throw new Error('Error al eliminar la cuenta del alumno');
        }finally{
            if(connection)
                connection.release();   
        }
    }
    
    static async obtenerPerfilPublicoAlumno(id_alumno, publico) {
        const [resultVisualizaciones]=await pool.query(`UPDATE AlumnoSolicitante SET visualizaciones = visualizaciones + 1 WHERE id_alumno = ?`, [id_alumno]);
        if(resultVisualizaciones.info.includes('Rows matched: 0'))
            return null;
        const perfil = await this.obtenerPerfilAlumno(id_alumno);
        if(publico){
            delete perfil.correo;
            delete perfil.telefono;
            delete perfil.fecha_nacimiento;
        }  
        delete perfil.visualizaciones;
        return perfil;
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
        if (vacanteRows[0].estado !== 'Activa') {
            return 'VacanteExpirada';
        }
        const resultadoPerfilCompleto = await this.verificarPerfilCompleto(id_alumno);
        //console.log('Resultado de la verificación del perfil completo:', resultadoPerfilCompleto);
        if (!resultadoPerfilCompleto) {
            return 'PerfilIncompleto';
        }                          

        const [insertResult] = await pool.query(`INSERT INTO Postulacion (id_alumno, id_vacante) VALUES (?, ?)`, [id_alumno, id_vacante]);
        return insertResult.insertId;
    }

    static async verificarPerfilCompleto(id_alumno) {
        try{
            const [[resultadoPerfilCompleto], [resultadoHabilidades]] = await Promise.all([pool.query(`SELECT * FROM AlumnoSolicitante WHERE id_alumno = ?`, [id_alumno]), pool.query(`SELECT * FROM Alumno_Habilidad WHERE id_alumno = ?`, [id_alumno])]);
            //console.log('Datos obtenidos para verificar el perfil completo:', {resultadoPerfilCompleto, resultadoHabilidades});
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

    static async obtenerHistorialBusquedas(id_alumno, limit) {
        try{
            let historialRows;
            if(limit && !isNaN(parseInt(limit)) && parseInt(limit) >0){
                [historialRows] = await pool.query(`SELECT * FROM Busqueda WHERE id_alumno = ? ORDER BY fecha DESC LIMIT ?`, [id_alumno, parseInt(limit)]);
            }else{
                [historialRows] = await pool.query(`SELECT * FROM Busqueda WHERE id_alumno = ? ORDER BY fecha DESC`, [id_alumno]);
            }
            
            return historialRows.map(row => {return {id_busqueda:row.id_busqueda,consulta:row.consulta}});
        }catch(error){
            console.error('Error al obtener el historial de búsqueda del alumno:', error.sqlMessage);
            throw new Error('Error al obtener el historial de búsqueda del alumno');
        }
    }

    static async limpiarHistorialBusquedas(id_alumno) {
        try{
            const [result] = await pool.query(`DELETE FROM Busqueda WHERE id_alumno = ?`, [id_alumno]);
            return result.affectedRows >= 0;
        }catch(error){
            console.error('Error al limpiar el historial de búsqueda del alumno:', error.sqlMessage);
            throw new Error('Error al limpiar el historial de búsqueda del alumno');
        }
    }

    static async borrarBusquedaPorId(id_alumno, id_busqueda) {
        try{
            const [result] = await pool.query(`DELETE FROM Busqueda WHERE id_alumno = ? AND id_busqueda = ?`, [id_alumno, id_busqueda]);
            if(result.info.includes('Rows matched: 0'))
                return null;
            return result.affectedRows > 0;
        }catch(error){
            console.error('Error al borrar la búsqueda del alumno por ID:', error.sqlMessage);
            throw new Error('Error al borrar la búsqueda del alumno por ID');
        }
    }
}