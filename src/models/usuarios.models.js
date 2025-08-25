import {pool} from '../db/db.js';

export default class Usuario {
  constructor(uid, email, nombre) {
    this.uid = uid;
    this.email = email;
    this.nombre = nombre;
  }

  static async obtenerPorUid(uid) {
    const [rows] = await pool.query('SELECT * FROM users WHERE uid = ?', [uid]);
    if (!rows.length) return null;
    return new Usuario(rows[0].uid, rows[0].email, rows[0].nombre);
  }

  static async create(uid, email, nombre) {
    const [rows] = await pool.query(
      'INSERT IGNORE INTO users (uid, email, nombre) VALUES (?, ?, ?)',
      [uid, email, nombre]
    );
    //console.log('Usuario creado:', rows.length);
    if (!rows.affectedRows) return null;
    return true;
  }
}