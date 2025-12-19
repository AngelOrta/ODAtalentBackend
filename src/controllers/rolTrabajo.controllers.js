import RolTrabajo from "../models/rolTrabajo.models.js";
export default class RolTrabajoController {
    static async obtenerTodos(req, res) {
        try {
            const roles = await RolTrabajo.obtenerTodos();
            if (!roles.length) {
                return res.status(404).json({ message: 'No se encontraron roles de trabajo' });
            }
            res.status(200).json(roles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener roles de trabajo' });
        }
    }

    static async crear(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre) {
                return res.status(400).json({ message: 'Falta el nombre del rol de trabajo' });
            }
            const nuevoRol = await RolTrabajo.crear(nombre);
            res.status(201).json(nuevoRol);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear rol de trabajo' });
        }
    }

    static async actualizar(req, res) {
        try {
            const { id_roltrabajo, nombre } = req.body;
            if (!id_roltrabajo || !nombre) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            const rolActualizado = await RolTrabajo.actualizar(id_roltrabajo, nombre);
            res.status(200).json(rolActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar rol de trabajo' });
        }
    }

    static async eliminar(req, res) {
        try {
            const { id_roltrabajo } = req.body;
            if (!id_roltrabajo) {
                return res.status(400).json({ message: 'Falta el id_roltrabajo' });
            }
            const resultado = await RolTrabajo.eliminar(id_roltrabajo);
            if (!resultado) {
                return res.status(404).json({ message: 'Rol de trabajo no encontrado' });
            }
            res.status(204).json();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar rol de trabajo' });
        }
    }

    static async publicarArticulo(req, res) {
        try {
            const { id_roltrabajo, titulo, contenido } = req.body;
            if (!id_roltrabajo || !titulo || !contenido ) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            const uid_admin = req.uid;
            const nuevoArticulo = await RolTrabajo.publicarArticulo(id_roltrabajo, uid_admin,titulo, contenido);
            if (!nuevoArticulo) {
                return res.status(404).json({ message: 'Rol de trabajo o admin no existen' });
            }
            res.status(201).json({message: 'Articulo creado con exito', id_articulo:nuevoArticulo});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al publicar articulo' });
        }
    }

    static async editarArticulo(req, res) {
        try {
            const { id_articulo, titulo, contenido } = req.body;
            if (!id_articulo || !titulo || !contenido) {
                return res.status(400).json({ message: 'Faltan datos obligatorios' });
            }
            const resultado = await RolTrabajo.editarArticulo(id_articulo, titulo, contenido);
            if (!resultado) {
                return res.status(404).json({ message: 'Articulo no encontrado' });
            }
            res.status(200).json({ message: 'Articulo actualizado con exito' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al editar articulo' });
        }
    }

    static async borrarArticulo(req, res) {
        try {
            const { id_articulo } = req.body;
            if (!id_articulo) {
                return res.status(400).json({ message: 'Falta el id_articulo' });
            }
            const resultado = await RolTrabajo.borrarArticulo(id_articulo);
            if (!resultado) {
                return res.status(404).json({ message: 'Articulo no encontrado' });
            }
            res.status(204).json({message: 'Articulo borrado con exito'});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al borrar articulo' });
        }   
    }

    static async obtenerArticuloPorId(req, res) {
        try {
            const { id } = req.params;
            const id_roltrabajo = id;
            if (!id_roltrabajo) {
                return res.status(400).json({ message: 'Falta el id_roltrabajo' });
            }
            const rol = await RolTrabajo.obtenerArticuloPorId(id_roltrabajo);
            if (!rol) {
                return res.status(404).json({ message: 'Articulo de Rol de trabajo no encontrado' });
            }
            res.status(200).json(rol);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener rol de trabajo' });
        }
    }
}