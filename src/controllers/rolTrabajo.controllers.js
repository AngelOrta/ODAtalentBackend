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
        const { nombre } = req.body;
        try {
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
        const { id_roltrabajo, nombre } = req.body;
        try {
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
        const { id_roltrabajo } = req.body;
        try {
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
}