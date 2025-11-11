import {pool} from '../db/db.js';

export default class Habilidad{
    constructor(id_habilidad, habilidad, categoria, tipo){
        this.id_habilidad = id_habilidad;
        this.habilidad = habilidad;
        this.categoria = categoria;
        this.tipo = tipo;
    }

    static async obtenerHabilidades(tipo){
        let rows;
        if (tipo){
            [rows] = await pool.query('SELECT * FROM Habilidad WHERE tipo = ?', [tipo]);
        }else{
            [rows] = await pool.query('SELECT * FROM Habilidad');
        }
        
        if(!rows.length)
            return null;
        return rows.map(row => new Habilidad(row.id_habilidad, row.habilidad, row.categoria, row.tipo));
    }
}