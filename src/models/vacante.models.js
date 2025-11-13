import {pool} from '../db/db.js';

export default class Vacante {
    constructor(id_vacante, id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, fecha_publicacion, escolaridad, conocimientos, observaciones, numero_vacantes, estado) {
        this.id_vacante = id_vacante;
        this.id_reclutador = id_reclutador;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.beneficios = beneficios;
        this.duracion = duracion;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.monto_beca = monto_beca;
        this.horario = horario;
        this.ubicacion = ubicacion;
        this.ciudad = ciudad;
        this.entidad = entidad;
        this.codigo_postal = codigo_postal;
        this.modalidad = modalidad;
        this.fecha_limite = fecha_limite;
        this.fecha_publicacion = fecha_publicacion;
        this.escolaridad = escolaridad;
        this.conocimientos = conocimientos;
        this.observaciones = observaciones;
        this.numero_vacantes = numero_vacantes;
        this.estado = estado;
    }

    static async obtenerDetallesVacante(id_vacante) {
        const queryVacanteData = `SELECT V.*, E.id_empresa, E.nombre, E.url_logo, E.sitio_web
            FROM Vacante V
            JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
            JOIN Empresa E ON R.id_empresa = E.id_empresa
            WHERE V.id_vacante = ?;`;
        const queryHabilidades = `SELECT H.id_habilidad, H.categoria, H.tipo, H.habilidad
            FROM Habilidad H
            JOIN Vacante_Habilidad VH ON H.id_habilidad = VH.id_habilidad
            WHERE VH.id_vacante = ?`;
        const queryRolesTrabajo = `SELECT RT.id_roltrabajo, RT.nombre
            FROM RolTrabajo RT
            JOIN Vacante_RolTrabajo VRT ON RT.id_roltrabajo = VRT.id_roltrabajo
            WHERE VRT.id_vacante = ?`;

        const [ [vacanteResult], [habilidadResult], [rolResult] ] = await Promise.all([
            pool.query(queryVacanteData, [id_vacante]),
            pool.query(queryHabilidades, [id_vacante]),
            pool.query(queryRolesTrabajo, [id_vacante])
        ]);
        
        if (!vacanteResult || vacanteResult.length === 0) {
            return null;
        }
        const vacanteData = vacanteResult[0];
        const finalJSON = {
            ...vacanteData, // Copiar todos los campos de la tabla Vacante
            empresa: {
            id_empresa: vacanteData.id_empresa,
            nombre_empresa: vacanteData.nombre,
            logo_empresa: vacanteData.url_logo,
            sitio_web: vacanteData.sitio_web
            },
            habilidades: habilidadResult,
            roles_relacionados: rolResult
        };
        delete finalJSON.id_empresa;
        delete finalJSON.nombre;
        delete finalJSON.url_logo;
        delete finalJSON.sitio_web;
        return finalJSON;
    }

    static async buscarVacantes(busquedaData, page, offset, limit) {
        try{
            let whereClauses = ['V.estado = "Activa"']; // Filtro base
            let params = [];
            
            const baseQuery = `
                FROM Vacante V
                JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
                JOIN Empresa E ON R.id_empresa = E.id_empresa
            `;
            if (busquedaData.query) {
                whereClauses.push('(V.titulo LIKE ? OR V.descripcion LIKE ?)');
                params.push(`%${busquedaData.query}%`, `%${busquedaData.query}%`);
            }//filtros
            if (busquedaData.ciudad) {
                whereClauses.push('V.ciudad = ?');
                params.push(busquedaData.ciudad);
            }
            if (busquedaData.entidad) {
                whereClauses.push('V.entidad = ?');
                params.push(busquedaData.entidad);
            }
            if (busquedaData.modalidad) {
                whereClauses.push('V.modalidad = ?');
                params.push(busquedaData.modalidad);
            }
            if (busquedaData.roltrabajo) {
                const roles = busquedaData.roltrabajo.split(','); // [ 'id1', 'id2' ]
                // Usamos una subconsulta IN para no duplicar filas
                whereClauses.push(
                    `V.id_vacante IN (
                        SELECT id_vacante FROM Vacante_RolTrabajo WHERE id_roltrabajo IN (?)
                    )`
                );
                params.push(roles);
            }
            const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
            
            const countSql = `SELECT COUNT(V.id_vacante) AS total_vacantes ${baseQuery} ${whereSql}`;
            const [[totalResult]] = await pool.query(countSql, params);
            const total_vacantes = totalResult.total_vacantes;
            const total_paginas = Math.ceil(total_vacantes / limit);

            let orderBySql = 'ORDER BY V.fecha_publicacion DESC'; // Default
            if (busquedaData.ordenar_por === 'monto_beca_asc') {
                orderBySql = 'ORDER BY V.monto_beca ASC';
            } else if (busquedaData.ordenar_por === 'monto_beca_desc') {
                orderBySql = 'ORDER BY V.monto_beca DESC';
            }

            const dataSql = `
                SELECT V.id_vacante, V.titulo, E.nombre AS nombre_empresa, E.url_logo AS logo_empresa, V.fecha_publicacion, V.fecha_limite, V.numero_vacantes, V.ciudad, V.entidad, V.modalidad, V.estado
                ${baseQuery}
                ${whereSql}
                ${orderBySql}
                LIMIT ? OFFSET ?`;
            const dataParams = [...params, limit, offset];
            const [vacantes] = await pool.query(dataSql, dataParams);
            //guardando historial
            const [ultimaBusqueda] = await pool.query('SELECT * FROM Busqueda WHERE id_alumno = ? ORDER BY fecha DESC LIMIT 1', [busquedaData.id_alumno]);
            if(ultimaBusqueda[0].consulta !== busquedaData.query){
                const [resultHistorial] = await pool.query(
                    `INSERT INTO Busqueda (id_alumno, consulta)
                    VALUES (?, ?)`,
                    [busquedaData.id_alumno, busquedaData.query || '']
                );
                if (resultHistorial.affectedRows === 0) {
                    console.warn('No se pudo guardar el historial de búsqueda');
                }
            }
            const busquedaJson = {
                paginacion: {
                    total_vacantes: total_vacantes,
                    total_paginas: total_paginas,
                    pagina_actual: page,
                    tamano_pagina: limit
                },
                vacantes: vacantes
            };
            return busquedaJson;
        }catch(error){
            throw new Error('Error al buscar vacantes: ' + error.message);
        }
    }
}