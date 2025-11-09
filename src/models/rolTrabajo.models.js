import {pool} from '../db/db.js';

export default class RolTrabajo {
  constructor(id_roltrabajo, nombre) {
    this.id_roltrabajo = id_roltrabajo;
    this.nombre = nombre;
  }

  static async obtenerTodos() {
    const [rows] = await pool.query('SELECT * FROM RolTrabajo');
    return rows.map(row => new RolTrabajo(row.id_roltrabajo, row.nombre));
  }

  static async crear(nombre) {
    const [result] = await pool.query('INSERT INTO RolTrabajo (nombre) VALUES (?)', [nombre]);
    return new RolTrabajo(result.insertId, nombre);
  }

  static async actualizar(id_roltrabajo, nombre) {
    await pool.query('UPDATE RolTrabajo SET nombre = ? WHERE id_roltrabajo = ?', [nombre, id_roltrabajo]);
    return new RolTrabajo(id_roltrabajo, nombre);
  }

  static async eliminar(id_roltrabajo) {
    const [result] = await pool.query('DELETE FROM RolTrabajo WHERE id_roltrabajo = ?', [id_roltrabajo]);
    return result.affectedRows > 0;
  }
}