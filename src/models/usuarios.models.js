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

  static async crear(nombre, email, rol, genero, uid) {
    const [rows] = await pool.query(
      'INSERT INTO Usuario (nombre, correo, rol, genero, uid_firebase) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, rol, genero, uid]
    );
    //console.log('Usuario creado:', rows.length);
    if (!rows.affectedRows) return null;
    return true;
  }
}