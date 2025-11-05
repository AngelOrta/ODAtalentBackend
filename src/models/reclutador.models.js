import {pool} from '../db/db.js';
export default class Reclutador {
  constructor(id_reclutador, nombre, correo, empresa, url_logo_empresa, estado, id_empresa, id_usuario) {
    this.id_reclutador = id_reclutador;
    this.nombre = nombre;
    this.correo = correo;
    this.empresa = empresa;
    this.url_logo_empresa = url_logo_empresa;
    this.estado = estado;
    this.id_empresa = id_empresa;
    this.id_usuario = id_usuario;
  }

  static async obtenerPorIdUsuario(idUsuario) {
    const [rows] = await pool.query('SELECT * FROM Reclutador WHERE id_usuario = ?', [idUsuario]);
    if (!rows.length) return null;
    return new Reclutador(rows[0].id_reclutador,null,null,null, rows[0].id_empresa, rows[0].id_usuario);
  }
}