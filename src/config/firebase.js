import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  const filePath = join(__dirname, '../../firebase-service-account.json');
  serviceAccount = JSON.parse(readFileSync(filePath, 'utf-8'));
}

console.log('[Firebase] Service account loaded:', serviceAccount?.project_id || 'MISSING');

const app = admin.default.apps.length
  ? admin.default.app()
  : admin.default.initializeApp({
      credential: admin.default.credential.cert(serviceAccount),
    });

export default admin.default;