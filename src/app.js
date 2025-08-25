import express from 'express';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authMiddleware from './middlewares/auth.js';
import cors from 'cors';
import userRoutes from './routes/usuarios.routes.js';
import auxiliarRoutes from './routes/auxiliar.routes.js';
//import { readFileSync } from 'fs';
//import fs from 'fs';

dotenv.config();

initializeApp({
  credential: applicationDefault(),
});

const app = express();
app.use(cors({
  origin: '*', //o especifica: 'https://tu-app.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use(
  '/api',
  excludePaths(
    ['/verificarqr'], // rutas que no llevan auth
    authMiddleware
  ),
  auxiliarRoutes
);  //protege todo lo que cuelga de /api
app.use('/api/usuarios', userRoutes); 

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