import { getAuth } from 'firebase-admin/auth';

export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);

  if (!match){
    console.error('No se proporcionó token de autorización');
    return res.status(401).end();
  }

  const idToken = match[1];

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    req.uid = decoded.uid;   // queda disponible para los controladores
    next();
  } catch (err) {
    console.error('Token no válido:', err);
    res.status(401).end();
  }
}
