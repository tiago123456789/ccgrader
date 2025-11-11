import admin from "firebase-admin";
// @ts-ignore
import serviceAccount from "../../fcredential.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin;
