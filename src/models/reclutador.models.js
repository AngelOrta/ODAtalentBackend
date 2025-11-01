import pool from '../db/bd.db.js';
export default class Reclutador {
  constructor(id, idEmpresa, idUsuario) {
    this.id = id;
    this.idEmpresa = idEmpresa;
    this.idUsuario = idUsuario;
  }

  static async obtenerPorIdUsuario(idUsuario) {
    const [rows] = await pool.query('SELECT * FROM Reclutador WHERE id_usuario = ?', [idUsuario]);
    if (!rows.length) return null;
    return new Reclutador(rows[0].id, rows[0].id_empresa, rows[0].id_usuario);
  }
}