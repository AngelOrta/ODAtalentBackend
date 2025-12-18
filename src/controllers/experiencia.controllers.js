import Publicacion from "../models/experiencia.models.js";  
import normalizarObjetosUndefinedANull from "../helpers/normalizarObjetos.helper.js";

export default class PublicacionController {
    static async crearPublicacion(req, res) {
        try {
            const {id_alumno, titulo, contenido , url_multimedia, roles_relacionados} =  req.body;
            const publicacionData= normalizarObjetosUndefinedANull({id_alumno, titulo, contenido , url_multimedia, roles_relacionados});
            if (!id_alumno || !titulo || !contenido || !roles_relacionados) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            if (!Array.isArray(roles_relacionados) || roles_relacionados.length === 0) {
                return res.status(400).json({ message: 'roles_relacionados debe ser un arreglo no vacío' });
            }
            const nuevaPublicacion = await Publicacion.crearPublicacion(publicacionData);
            if(!nuevaPublicacion){
                return res.status(404).json({ message: 'El alumno o algun rol de trabajo no existen' });
            }else if(nuevaPublicacion === 'duplicado'){
                return  res.status(409).json({ message: 'La Experiencia tiene varios roles de trabajo repetidos' });
            }
            res.status(201).json({ message: 'Experiencia creada correctamente', id_publicacion: nuevaPublicacion });
        } catch (error) {
            console.error('Error al crear la Experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async obtenerExperienciasAlumnos(req, res) {
        try {
            const id_alumno = req.query.id_alumno;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            //const id_roltrabajo = req.query.id_roltrabajo ? parseInt(req.query.id_roltrabajo) : null;
            let id_roles_trabajo = null;
        
            if (req.query.id_roltrabajo) {
                // Convierte el string "1,2,3" en un array de números [1, 2, 3]
                const idsArray = req.query.id_roltrabajo
                    .split(',') 
                    .map(id => parseInt(id.trim(), 10)) 
                    .filter(id => !isNaN(id) && id > 0); // Filtra IDs inválidos

                if (idsArray.length > 0) {
                    id_roles_trabajo = idsArray;
                }
            }
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id_alumno' });
            }
            const experiencias = await Publicacion.obtenerExperienciasAlumnos(id_alumno,page, limit, offset, id_roles_trabajo);
            res.status(200).json(experiencias);
        } catch (error) {
            console.error('Error al obtener las experiencias de los alumnos:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async verExperienciaPorId(req, res) {
        try {
            const { id_publicacion } = req.params;
            if (!id_publicacion) {
                return res.status(400).json({ message: 'Falta el id_publicacion' });
            }
            const experiencia = await Publicacion.verExperienciaPorId(id_publicacion);
            if (!experiencia) {
                return res.status(404).json({ message: 'Experiencia no encontrada' });
            }
            res.status(200).json(experiencia);
        } catch (error) {
            console.error('Error al obtener la experiencia por ID:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async  verComentariosDeExperienciaPorId (req, res) {
        try {
            const { id_comentario } = req.params;
            if (!id_comentario) {
                return res.status(400).json({ message: 'Falta el id_comentario' });
            }
            const comentario = await Publicacion.verComentariosDeExperienciaPorId(id_comentario);
            if (!comentario) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }
            res.status(200).json(comentario);
        } catch (error) {
            console.error('Error al obtener el comentario por ID:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async borrarExperiencia(req, res) {
        try {
            const { id_publicacion } = req.params;
            const uid_alumno = req.uid;
            if (!id_publicacion || isNaN(id_publicacion)) {
                return res.status(400).json({ message: 'Falta el id_publicacion' });
            }
            if (!uid_alumno) {
                return res.status(400).json({ message: 'Falta el uid_alumno' });
            }
            const resultado = await Publicacion.borrarExperiencia(id_publicacion, uid_alumno);
            if (resultado) {
                res.status(204).json({ message: 'Experiencia eliminada correctamente' });
            } else {
                res.status(404).json({ message: 'Experiencia no encontrada o el alumno no es el autor de la experiencia' });
            }
        } catch (error) {
            console.error('Error al borrar la experiencia:', error.message || error.sqlMessage);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async reaccionarExperiencia(req, res) {
        try {
            const { id_publicacion, id_alumno, tipo_reaccion, accion } = req.body;
            if (!id_publicacion || !id_alumno || !tipo_reaccion) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            if (tipo_reaccion !== 'upvote' && tipo_reaccion !== 'downvote' && accion !== 'quitar' && accion !== 'agregar') {
                return res.status(400).json({ message: 'Tipo de reacción inválido' });
            }
            const resultado = await Publicacion.reaccionarExperiencia(id_publicacion, id_alumno, tipo_reaccion, accion);
            if (resultado === 'no_encontrado') {
                return res.status(404).json({ message: 'Experiencia o alumno no encontrado' });
            }
            res.status(200).json({ message: 'Reacción agregada correctamente' });
        } catch (error) {
            console.error('Error al reaccionar a la experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async comentarExperiencia(req, res) {
        try {
            let { id_publicacion, id_alumno, id_comentario_padre,comentario } = req.body;
            if(!id_comentario_padre) id_comentario_padre = null;
            if (!id_publicacion || !id_alumno || !comentario) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            const nuevoComentario = await Publicacion.comentarExperiencia(id_publicacion, id_alumno,  id_comentario_padre,comentario);
            if (!nuevoComentario) {
                return res.status(404).json({ message: 'Experiencia, alumno o comentario padre no encontrado' });
            }
            res.status(201).json({ message: 'Comentario agregado correctamente', id_comentario: nuevoComentario });
        } catch (error) {
            console.error('Error al comentar la experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async borrarComentarioExperiencia(req, res) {
        try {
            let { id_comentario, id_reporte} = req.body;
            const uid_alumno = req.uid;
            if (!id_comentario || isNaN(id_comentario)) {
                return res.status(400).json({ message: 'Falta el id_comentario' });
            }
            if (!uid_alumno) {
                return res.status(400).json({ message: 'Falta el uid_alumno' });
            }
            if(!id_reporte || isNaN(id_reporte)){
                id_reporte = null;
            }
            const resultado = await Publicacion.borrarComentarioExperiencia(id_comentario, uid_alumno, id_reporte);
            if (!resultado) {
                return res.status(404).json({ message: 'Comentario no encontrado o el alumno no es el autor del comentario' });
            } 
            res.status(204).json({ message: 'Comentario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async obtenerComentariosExperiencia(req, res) {
        try {
            const id_publicacion = req.query.id_publicacion;
            const id_alumno = req.query.id_alumno;
            if (!id_publicacion || !id_alumno) {
                return res.status(400).json({ message: 'Falta el id_publicacion o el id_alumno' });
            }
            const comentarios = await Publicacion.obtenerComentariosExperiencia(id_publicacion, id_alumno);
            res.status(200).json(comentarios);
        } catch (error) {
            console.error('Error al obtener los comentarios de la experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async obtenerRespuestasComentarioExperiencia(req, res) { 
        try {
            const id_comentario_padre = req.query.id_comentario_padre;
            const id_alumno = req.query.id_alumno;
            if (!id_comentario_padre || !id_alumno) {
                return res.status(400).json({ message: 'Falta el id_comentario_padre o el id_alumno' });
            }
            const respuestas = await Publicacion.obtenerRespuestasComentarioExperiencia(id_comentario_padre, id_alumno);
            res.status(200).json(respuestas);
        } catch (error) {
            console.error('Error al obtener las respuestas del comentario de la experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async reaccionarComentarioExperiencia(req, res) {
        try {
            const { id_comentario, id_alumno, tipo_reaccion, accion } = req.body;
            if (!id_comentario || !id_alumno || !tipo_reaccion || !accion) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            if (tipo_reaccion !== 'upvote' && tipo_reaccion !== 'downvote' && accion !== 'quitar' && accion !== 'agregar') {
                return res.status(400).json({ message: 'Tipo de reacción inválido' });
            }
            const resultado = await Publicacion.reaccionarComentarioExperiencia(id_comentario, id_alumno, tipo_reaccion, accion);
            if (resultado === 'no_encontrado') {
                return res.status(404).json({ message: 'Comentario o alumno no encontrado' });
            }
            res.status(200).json({ message: 'Reacción al comentario agregada correctamente' });
        } catch (error) {
            console.error('Error al reaccionar al comentario de la experiencia:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }

    static async reportarContenido(req, res) {
        try {
            const { id_alumno, id_reclutador, id_contenido, tipo_contenido,  razon, descripcion } = req.body;
            const reporteData= normalizarObjetosUndefinedANull({id_alumno, id_reclutador, id_contenido, tipo_contenido,  razon, descripcion});
            const tipos = new Set(['Vacante','Publicacion', 'Comentario']);
            const razones = new Set(['Contenido inapropiado','Sin vacantes','Otro']);
            if ((!id_alumno && !id_reclutador) || !id_contenido || !tipo_contenido || !razon) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            if(!tipos.has(tipo_contenido)|| !razones.has(razon)){
                return res.status(400).json({ message: 'Tipo de contenido o razon inválido' });
            }
            const nuevoReporte = await Publicacion.reportarContenido(reporteData);
            if(!nuevoReporte){
                return res.status(404).json({ message: 'El alumno o reclutador o contenido no existen' });
            }
            // else if(nuevoReporte === 'duplicado'){
            //     return  res.status(409).json({ message: 'El reporte ya existe' });
            // }
            res.status(201).json({ message: 'Reporte enviado correctamente', id_reporte: nuevoReporte });
        } catch (error) {
            console.error('Error al reportar el contenido:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
}