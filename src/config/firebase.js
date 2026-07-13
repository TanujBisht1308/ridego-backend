import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let serviceAccount;

// On Railway, the key comes from an environment variable (raw JSON string).
// Locally, it's read from the file placed at the project root.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  const filePath = join(__dirname, '../../firebase-service-account.json');
  serviceAccount = JSON.parse(readFileSync(filePath, 'utf-8'));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;