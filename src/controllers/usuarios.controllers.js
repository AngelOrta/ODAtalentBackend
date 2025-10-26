import Usuario from '../models/usuarios.models.js';

export default class UsuariosController {
  static async obtenerUsuarioPorUid(req, res) {
    try {
        //const user = await usuario.getByUid(req.uid);
        const {uid} = req.params;
        const user = await Usuario.obtenerPorUid(uid);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  static async registrar(req, res) {
    const { nombre, email, rol, genero, idEmpresa} = req.body;
    try {
        const nuevoUsuario = await Usuario.crear(nombre, email, rol, genero, req.uid, idEmpresa);
        if (!nuevoUsuario) return res.status(400).json({ error: 'Error al registrar Usuario' });
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al registrar Usuario' });
    }
  }
}