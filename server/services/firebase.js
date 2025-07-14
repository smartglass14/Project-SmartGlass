import admin from "firebase-admin";

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}

const adminAuth = admin.auth();
export { adminAuth };
export default admin;
