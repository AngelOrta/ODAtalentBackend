import {pool} from '../db/db.js';
export default class Reporte {
    static async verReportes(estado, page, offset, limit) {
        try {
            let reportesRows;
            let total_reportes;
            let total_paginas;
            if (estado==='pendiente') {
                const [totalReportesPendientesRows] = await pool.query(`SELECT COUNT(*) AS total FROM Reporte WHERE estado = 'En espera'`);
                total_reportes = totalReportesPendientesRows[0].total;
                total_paginas = Math.ceil(total_reportes / limit);
                [reportesRows] = await pool.query(`SELECT id_reporte, id_contenido, tipo_contenido, razon, descripcion, fecha_reporte, estado FROM Reporte WHERE estado = 'En espera' LIMIT ? OFFSET ?`, [limit, offset]);
            } else if (estado==='resuelto') {
                const [totalReportesResueltosRows] = await pool.query(`SELECT COUNT(*) AS total FROM Reporte WHERE estado = 'Resuelto'`);
                total_reportes = totalReportesResueltosRows[0].total;
                total_paginas = Math.ceil(total_reportes / limit);
                [reportesRows] = await pool.query(`SELECT id_reporte, id_contenido, tipo_contenido, razon, descripcion, fecha_reporte, estado FROM Reporte WHERE estado = 'Resuelto' LIMIT ? OFFSET ?`, [limit, offset]);
            } else {
                const [totalReportesRows] = await pool.query(`SELECT COUNT(*) AS total FROM Reporte`);
                total_reportes = totalReportesRows[0].total;
                total_paginas = Math.ceil(total_reportes / limit);
                [reportesRows] = await pool.query(`SELECT id_reporte, id_contenido, tipo_contenido, razon, descripcion, fecha_reporte, estado FROM Reporte LIMIT ? OFFSET ?`, [limit, offset]);
            }

            const reportesJson = {
                paginacion:{
                    total_reportes: total_reportes,
                    total_paginas: total_paginas,
                    pagina_actual: page,
                    tamano_pagina: limit
                },
                reportes: reportesRows
            };
            return reportesJson;
        } catch (error) {
            throw new Error('Error al obtener reportes: ' + error.sqlMessage);
        }
    }

    static async eliminarPublicacion(id_publicacion, id_reporte) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [deleteResult] = await connection.query('DELETE FROM Publicacion WHERE id_publicacion = ?', [id_publicacion]);
            if (deleteResult.affectedRows === 0) {
                throw new Error('No se encontró la publicación para eliminar');
            }
            const [updateResult] = await connection.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', ['Resuelto', id_reporte]);
            if (updateResult.affectedRows === 0) {
                throw new Error('No se encontró el reporte para actualizar');
            }

            await connection.commit();
            return true;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error.message === 'No se encontró la publicación para eliminar' || error.message === 'No se encontró el reporte para actualizar' || error.message.includes('ER_NO_REFERENCED_ROW')) {
                return false;
            }
            throw new Error('Error al eliminar publicación y resolver reporte: ' + error.message);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async eliminarComentario(id_comentario, id_reporte) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const [deleteResult] = await connection.query('DELETE FROM Comentario WHERE id_comentario = ?', [id_comentario]);
            if (deleteResult.affectedRows === 0) {
                throw new Error('No se encontró el comentario para eliminar');
            }
            const [updateResult] = await connection.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', ['Resuelto', id_reporte]);
            if (updateResult.affectedRows === 0) {
                throw new Error('No se encontró el reporte para actualizar');
            }
            await connection.commit();
            return true;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error.message === 'No se encontró el comentario para eliminar' || error.message === 'No se encontró el reporte para actualizar' || error.message.includes('ER_NO_REFERENCED_ROW')) {
                return false;
            }
            throw new Error('Error al eliminar comentario y resolver reporte: ' + error.message);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async eliminarVacante(id_vacante, id_reporte) {
            let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const [deleteResult] = await connection.query(`UPDATE FROM Vacante SET estado = 'Expirada' WHERE id_vacante = ?`, [id_vacante]);
            if (deleteResult.affectedRows === 0) {
                throw new Error('No se encontró la vacante para eliminar');
            }
            const [updateResult] = await connection.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', ['Resuelto', id_reporte]);
            if (updateResult.affectedRows === 0) {
                throw new Error('No se encontró el reporte para actualizar');
            }
            await connection.commit();
            return true;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            if (error.message === 'No se encontró la vacante para eliminar' || error.message === 'No se encontró el reporte para actualizar' || error.message.includes('ER_NO_REFERENCED_ROW')) {
                return false;
            }
            throw new Error('Error al eliminar vacante y resolver reporte: ' + error.message);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    static async resolverReporte(id_reporte) {
        try {
            const [updateResult] = await pool.query('UPDATE Reporte SET estado = ? WHERE id_reporte = ?', ['Resuelto', id_reporte]);
            if (updateResult.affectedRows === 0) {
                return false;
            }
            return true;
        } catch (error) {
            throw new Error('Error al resolver reporte: ' + error.message);
        }   
    }
}