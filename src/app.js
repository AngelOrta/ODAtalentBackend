import express from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authMiddleware from './middlewares/auth.js';
import cors from 'cors';
import userRoutes from './routes/usuario.routes.js';
import auxiliarRoutes from './routes/auxiliar.routes.js';
import empresasRoutes from './routes/empresa.routes.js';
import reclutadoresRoutes from './routes/reclutador.routes.js';
import rolesTrabajoRoutes from './routes/rolTrabajo.routes.js';
import habilidadesRoutes from './routes/habilidades.routes.js';
import vacantesRoutes from './routes/vacante.routes.js';
import alumnosRoutes from './routes/alumno.routes.js';
import publicacionesRoutes from './routes/experiencia.routes.js';
import reportesRoutes from './routes/reporte.routes.js';
//import { readFileSync } from 'fs';
//import fs from 'fs';
//import {enviarCorreoBienvenidaReclutador} from './services/mail.services.js';

dotenv.config();

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const app = express();
app.use(cors({
  origin: 'https://odatalent.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use(
  '/api',
  excludePaths(
    ['/verificarqr', '/usuarios/encolar_reclutador', '/empresas/obtener_empresas', '/empresas/agregar_empresa'], // rutas que no llevan auth
    authMiddleware
  ),
);  //protege todo lo que cuelga de /api
app.use('/api', auxiliarRoutes);
app.use('/api/usuarios', userRoutes); 
app.use('/api/empresas', empresasRoutes);
app.use('/api/reclutadores', reclutadoresRoutes);
app.use('/api/roles_trabajo', rolesTrabajoRoutes);
app.use('/api/habilidades', habilidadesRoutes);
app.use('/api/vacantes', vacantesRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/experiencias_alumnos', publicacionesRoutes);
app.use('/api/reportes', reportesRoutes);

app.listen(process.env.PORT || 4000, () =>
  console.log(`API corriendo en puerto ${process.env.PORT || 4000}`)
);

function excludePaths(paths, middleware) {
  return function (req, res, next) {
    const pathExcluded = paths.some((path) => req.path.startsWith(path));
    if (pathExcluded) {
      return next(); //omitir el middleware
    }
    return middleware(req, res, next); //aplicar el middleware
  };
}