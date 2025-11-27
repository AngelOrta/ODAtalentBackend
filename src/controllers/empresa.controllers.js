import Empresa from '../models/empresa.models.js'

export default class EmpresaController {
    static async obtenerEmpresas(req, res) {
        try{
            const empresas = await Empresa.obtenerEmpresas();
            if(!empresas) return  res.status(404).json({ error: 'No se encontraron empresas' });
            res.status(200).json(empresas);
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Error al obtener empresas' });
        }
    }

    static async agregarEmpresa(req, res) {
        try{
            if (!req.body.nombre || !req.body.descripcion ) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }
            if(req.body.sitio_web && !/^https?:\/\/.+\..+/.test(req.body.sitio_web)) {
                return res.status(400).json({ error: 'El sitio web no es una URL válida' });
            }
            if(req.body.url_logo && !/^https?:\/\/.+\..+/.test(req.body.url_logo)) {
                return res.status(400).json({ error: 'La URL del logo no es una URL válida' });
            }
            const { nombre, descripcion, url_logo, sitio_web} = req.body;
            const nuevaEmpresa = await Empresa.agregarEmpresa(nombre, descripcion, url_logo, sitio_web);
            if(!nuevaEmpresa) return res.status(400).json({ error: 'No se pudo agregar la empresa' });
            res.status(201).json(nuevaEmpresa);
        }catch(err){
            console.log(err.message);
            if( err.message.startsWith('La empresa ya existe')) {
                return res.status(409).json({ error: err.message });
            }
            res.status(500).json({ error: 'Error al agregar empresa' });
        }
    }
    
    static async actualizarEmpresa(req, res) {
        try{
            const { id_empresa, nombre, descripcion, url_logo, sitio_web} = req.body;
            const empresaActualizada = await Empresa.actualizarEmpresa(id_empresa, nombre, descripcion, url_logo, sitio_web);
            if(!empresaActualizada) return res.status(404).json({ error: 'Empresa no encontrada o no se pudo actualizar' });
            res.status(200).json({message: 'Empresa actualizada correctamente', empresa: empresaActualizada});
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Error al actualizar empresa' });
        }
    }

    static async eliminarEmpresa(req, res) {
        try{
            const { id_empresa } = req.body;
            const empresaEliminada = await Empresa.eliminarEmpresa(id_empresa);
            if(!empresaEliminada) return res.status(404).json({ error: 'Empresa no encontrada o no se pudo eliminar' });
            res.status(200).json({message: 'Empresa eliminada correctamente', empresa: empresaEliminada});
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Error al eliminar empresa' });
        }
    }
}