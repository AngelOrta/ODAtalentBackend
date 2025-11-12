import {pool} from '../db/db.js';
export default class Publicacion{
    static async crearPublicacion(publicacionData){
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [result] = await connection.query(
                `INSERT INTO Publicacion (id_alumno, titulo, contenido, url_multimedia) 
                 VALUES (?, ?, ?, ?)`,
                [publicacionData.id_alumno, publicacionData.titulo, publicacionData.contenido , publicacionData.url_multimedia]
            );
            if(!result.affectedRows || result.affectedRows === 0){
                throw new Error('No se pudo crear la publicación');
            }
            const id_publicacion = result.insertId;
            const resultRoles = await connection.query(
                `INSERT INTO Publicacion_RolTrabajo (id_publicacion, id_roltrabajo) 
                 VALUES ?`,[publicacionData.roles_relacionados.map(rol => [id_publicacion, rol.id_roltrabajo])]);
            if(!resultRoles[0].affectedRows || resultRoles[0].affectedRows === 0){
                throw new Error('No se pudieron asociar los roles a la publicación');
            }

            await connection.commit();
            return id_publicacion;
        }catch(error){
            console.error('Error en crearPublicacion:', error.sqlMessage);
            if(connection){
                await connection.rollback();
            }
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('publicacion_ibfk_1')){
                return null;
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return 'duplicado';
            }
            throw error;
        }finally{
            if(connection){
                connection.release();
            }
        }
    }

    static async obtenerExperienciasAlumnos(id_alumno,page, limit, offset ){
        try{
            const [totalRows] = await pool.query(
                `SELECT COUNT(*) AS total_experiencias FROM Publicacion`
            );
            const total_experiencias = totalRows[0].total_experiencias;
            const total_paginas = Math.ceil(total_experiencias / limit);
            const [experienciasRows] = await pool.query(`SELECT P.id_publicacion, P.id_alumno, U.nombre, U.url_foto_perfil, P.titulo, P.contenido, P.fecha_publicacion, P.reacciones, P.url_multimedia, COUNT(C.id_comentario) AS comentarios
            FROM Publicacion P
            JOIN AlumnoSolicitante A ON P.id_alumno = A.id_alumno
            JOIN Usuario U ON A.id_usuario = U.id
            LEFT JOIN Comentario C ON P.id_publicacion = C.id_publicacion
            GROUP BY P.id_publicacion 
            ORDER BY P.fecha_publicacion DESC 
            LIMIT ? OFFSET ?`, [limit, offset]);

            if (experienciasRows.length === 0) {
                return {
                    paginacion: { total_experiencias, total_paginas, pagina_actual: page, tamano_pagina: limit },
                    experiencias: []
                };
            }

            const [rolesRows] = await pool.query(`SELECT PR.id_publicacion, RT.id_roltrabajo,RT.nombre
            FROM Publicacion_RolTrabajo PR
            JOIN RolTrabajo RT ON PR.id_roltrabajo = RT.id_roltrabajo
            WHERE PR.id_publicacion IN (?)`, [experienciasRows.map(exp => exp.id_publicacion)]);

            const [misReaccionesRows] = await pool.query(`SELECT id_publicacion, tipo_reaccion
            FROM Publicacion_Reacciones
            WHERE id_alumno = ?
            AND id_publicacion IN (?)`, [id_alumno, experienciasRows.map(exp => exp.id_publicacion)]);

            const rolesMap = new Map();
            for (const rol of rolesRows) {
                if (!rolesMap.has(rol.id_publicacion)) {
                    rolesMap.set(rol.id_publicacion, []);
                }
                // Quitamos el id_publicacion del objeto rol para limpiar el JSON
                const { id_publicacion, ...rolData } = rol;
                rolesMap.get(rol.id_publicacion).push(rolData);
            }
            const reaccionesMap = new Map();
            for (const reaccion of misReaccionesRows) {
                // Aquí guardamos directamente el string: 'upvote' o 'downvote'
                reaccionesMap.set(reaccion.id_publicacion, reaccion.tipo_reaccion);
            }

            const experienciasFinal = experienciasRows.map(publicacion => {
                return {
                    ...publicacion,
                    roles_relacionados: rolesMap.get(publicacion.id_publicacion) || [],
                    mi_reaccion: reaccionesMap.get(publicacion.id_publicacion) || null
                };      
            });

            return {
                paginacion: {
                    total_experiencias: total_experiencias,
                    total_paginas: total_paginas,
                    pagina_actual: page,
                    tamano_pagina: limit
                },
                experiencias: experienciasFinal
            };
        }catch(error){
            console.error('Error en obtenerExperienciasAlumnos:', error);
            throw error;
        }
    }

    static async borrarExperiencia(id_publicacion){
        const borrarRows = await pool.query(
            `DELETE FROM Publicacion WHERE id_publicacion = ?`,
            [id_publicacion]
        );
        return borrarRows[0].affectedRows > 0;
    }

    static async reaccionarExperiencia(id_publicacion, id_alumno, reaccion, accion){
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            await connection.query(
                `DELETE FROM Publicacion_Reacciones WHERE id_publicacion = ? AND id_alumno = ?`,
                [id_publicacion, id_alumno]
            );

            if(accion === 'quitar'){
                let quitarRows;
                if(reaccion === 'upvote'){
                    [quitarRows] = await connection.query(`UPDATE Publicacion SET reacciones = reacciones - 1 where id_publicacion = ?`, [id_publicacion]);
                }else if(reaccion === 'downvote'){
                    [quitarRows] = await connection.query(`UPDATE Publicacion SET reacciones = reacciones + 1 where id_publicacion = ?`, [id_publicacion]);
                }
                if(!quitarRows.affectedRows){
                    throw new Error('Publicación no encontrada');
                }
                await connection.commit();
                return true;
            }
        
            if(reaccion === 'upvote'){
                const [reaccionarRows] = await connection.query(`UPDATE Publicacion SET reacciones = reacciones + 1 WHERE id_publicacion = ?`, [id_publicacion]);
                if(!reaccionarRows.affectedRows){
                    throw new Error('Publicación no encontrada');
                }

                await connection.query(`INSERT INTO Publicacion_Reacciones (id_publicacion, id_alumno, tipo_reaccion) VALUES (?, ?, 'upvote')`, [id_publicacion, id_alumno]);
                

            }else{
                const [reaccionarRows] = await connection.query(`UPDATE Publicacion SET reacciones = reacciones - 1 WHERE id_publicacion = ?`, [id_publicacion]);
                if(!reaccionarRows.affectedRows){
                    throw new Error('Publicación no encontrada');
                }
                await connection.query(`INSERT INTO Publicacion_Reacciones (id_publicacion, id_alumno, tipo_reaccion) VALUES (?, ?, 'downvote')`, [id_publicacion, id_alumno]);
                
            }

            await connection.commit();
            return true;
        }catch(error){
            console.error('Error en reaccionarExperiencia:', error);
            if(connection){
                await connection.rollback();
            }
            if(error.message === 'Publicación no encontrada'){
                return 'no_encontrado';
            }
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('publicacion_reacciones_ibfk_1') || error.sqlMessage.includes('publicacion_reacciones_ibfk_2')){
                return 'no_encontrado';
            }
            throw error;
        }finally{
            if(connection){
                connection.release();
            }
        }
    }

    static async comentarExperiencia(id_publicacion, id_alumno, id_comentario_padre, comentario){
        try{
            const [result] = await pool.query(`INSERT INTO Comentario (id_publicacion, id_alumno, id_comentario_padre, contenido) VALUES (?, ?, ?, ?)`,[id_publicacion, id_alumno, id_comentario_padre, comentario]);
            if(!result.affectedRows || result.affectedRows === 0){
                return null;
            }
            return result.insertId;
        }
        catch(error){
            console.error('Error en comentarExperiencia:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('comentario_ibfk_1') || error.sqlMessage.includes('comentario_ibfk_2') || error.sqlMessage.includes('comentario_ibfk_3')){
                return null;
            }
            throw error;
        }   
    }

    static async borrarComentarioExperiencia(id_comentario){
        const borrarRows = await pool.query(
            `DELETE FROM Comentario WHERE id_comentario = ?`,
            [id_comentario]
        );
        return borrarRows[0].affectedRows > 0;
    }

    static async obtenerComentariosExperiencia(id_publicacion, id_alumno){
        try{
            const [comentariosRows] = await pool.query(`SELECT C.id_comentario, C.id_alumno, U.nombre, U.url_foto_perfil, C.contenido AS comentario, C.fecha, C.reacciones,
            (EXISTS (
                SELECT 1 
                FROM Comentario AS Respuestas
                WHERE Respuestas.id_comentario_padre = C.id_comentario
            )) AS respuestas
            FROM Comentario C
            JOIN AlumnoSolicitante A ON C.id_alumno = A.id_alumno
            JOIN Usuario U ON A.id_usuario = U.id
            WHERE C.id_publicacion = ? AND C.id_comentario_padre IS NULL
            ORDER BY C.fecha DESC`, [id_publicacion]);
            const [misReaccionesRows] = await pool.query(`SELECT id_comentario, tipo_reaccion
            FROM Comentario_Reacciones
            WHERE id_alumno = ?
            AND id_comentario IN (?)`, [id_alumno, comentariosRows.map(exp => exp.id_comentario)]);

            const reaccionesMap = new Map();
            for (const reaccion of misReaccionesRows) {
                // Aquí guardamos directamente el string: 'upvote' o 'downvote'
                reaccionesMap.set(reaccion.id_comentario, reaccion.tipo_reaccion);
            }
            const comentariosFinal = comentariosRows.map(com => ({
                ...com,
                respuestas: Boolean(com.respuestas) // Convierte 1 a true, 0 a false
                ,mi_reaccion: reaccionesMap.get(com.id_comentario) || null
            }));
            return comentariosFinal;
        }catch(error){
            console.error('Error en obtenerComentariosExperiencia:', error);
            throw error;
        }
    }

    static async obtenerRespuestasComentarioExperiencia(id_comentario_padre, id_alumno){
        try{
            const [respuestasRows] = await pool.query(`SELECT C.id_comentario, C.id_alumno, C.id_comentario_padre, U.nombre, U.url_foto_perfil, C.contenido AS comentario, C.fecha, C.reacciones,
            (EXISTS (
                SELECT 1 
                FROM Comentario AS Respuestas
                WHERE Respuestas.id_comentario_padre = C.id_comentario
            )) AS respuestas
            FROM Comentario C
            JOIN AlumnoSolicitante A ON C.id_alumno = A.id_alumno
            JOIN Usuario U ON A.id_usuario = U.id
            WHERE C.id_comentario_padre = ?
            ORDER BY C.fecha DESC`, [id_comentario_padre]);
            const [misReaccionesRows] = await pool.query(`SELECT id_comentario, tipo_reaccion
            FROM Comentario_Reacciones
            WHERE id_alumno = ?
            AND id_comentario IN (?)`, [id_alumno, respuestasRows.map(exp => exp.id_comentario)]);

            const reaccionesMap = new Map();
            for (const reaccion of misReaccionesRows) {
                // Aquí guardamos directamente el string: 'upvote' o 'downvote'
                reaccionesMap.set(reaccion.id_comentario, reaccion.tipo_reaccion);
            }
            const comentariosFinal = respuestasRows.map(com => ({
                ...com,
                respuestas: Boolean(com.respuestas), // Convierte 1 a true, 0 a false
                mi_reaccion: reaccionesMap.get(com.id_comentario) || null
            }));
            return comentariosFinal;
        }catch(error){
            console.error('Error en obtenerComentariosExperiencia:', error);
            throw error;
        }
    }

    static async reaccionarComentarioExperiencia(id_comentario, id_alumno, reaccion, accion){
        let connection;
        try{
            connection = await pool.getConnection();
            await connection.beginTransaction();

            await connection.query(
                `DELETE FROM Comentario_Reacciones WHERE id_comentario = ? AND id_alumno = ?`,
                [id_comentario, id_alumno]
            );

            if(accion === 'quitar'){
                let quitarRows;
                if(reaccion === 'upvote'){
                    [quitarRows] = await connection.query(`UPDATE Comentario SET reacciones = reacciones - 1 where id_comentario = ?`, [id_comentario]);
                }else if(reaccion === 'downvote'){
                    [quitarRows] = await connection.query(`UPDATE Comentario SET reacciones = reacciones + 1 where id_comentario = ?`, [id_comentario]);
                }
                if(!quitarRows.affectedRows){
                    throw new Error('Comentario no encontrado');
                }
                await connection.commit();
                return true;
            }
        
            if(reaccion === 'upvote'){
                const [reaccionarRows] = await connection.query(`UPDATE Comentario SET reacciones = reacciones + 1 WHERE id_comentario = ?`, [id_comentario]);
                if(!reaccionarRows.affectedRows){
                    throw new Error('Comentario no encontrado');
                }

                await connection.query(`INSERT INTO Comentario_Reacciones (id_comentario, id_alumno, tipo_reaccion) VALUES (?, ?, 'upvote')`, [id_comentario, id_alumno]);
                

            }else{
                const [reaccionarRows] = await connection.query(`UPDATE Comentario SET reacciones = reacciones - 1 WHERE id_comentario = ?`, [id_comentario]);
                if(!reaccionarRows.affectedRows){
                    throw new Error('Comentario no encontrado');
                }
                await connection.query(`INSERT INTO Comentario_Reacciones (id_comentario, id_alumno, tipo_reaccion) VALUES (?, ?, 'downvote')`, [id_comentario, id_alumno]);
                
            }

            await connection.commit();
            return true;
        }catch(error){
            console.error('Error en reaccionarComentario:', error);
            if(connection){
                await connection.rollback();
            }
            if(error.message === 'Comentario no encontrado'){
                return 'no_encontrado';
            }
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('publicacion_reacciones_ibfk_1') || error.sqlMessage.includes('publicacion_reacciones_ibfk_2')){
                return 'no_encontrado';
            }
            throw error;
        }finally{
            if(connection){
                connection.release();
            }
        }
    }

    static async reportarContenido(reporteData){
        try{
            const [result] = await pool.query(`INSERT INTO Reporte (id_alumno, id_reclutador, id_contenido, tipo_contenido, razon, descripcion) VALUES (?, ?, ?, ?, ?, ?)`,[reporteData.id_alumno, reporteData.id_reclutador, reporteData.id_contenido, reporteData.tipo_contenido, reporteData.razon, reporteData.descripcion]);
            if(!result.affectedRows || result.affectedRows === 0){
                return null;
            }
            return result.insertId;
        }
        catch(error){
            console.error('Error en reportarContenido:', error.sqlMessage);
            if(error.code === 'ER_NO_REFERENCED_ROW_2' || error.sqlMessage.includes('reporte_ibfk_1') || error.sqlMessage.includes('reporte_ibfk_2')){
                return null;
            }
            throw error;
        }
    }
}
