import firebaseAdmin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('firebase-service-account.json'), 'utf-8')
);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export default firebaseAdmin;
