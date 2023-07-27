import auth from "../db/firebaseSDK.js";

export async function validToken(req, res, next) {
  if (!req.headers || !req.headers.authorization) {
    res.status(401).send({ message: "No Authorization Token", success: false });
    return;
  }
  try {
    auth
      .verifyIdToken(req.headers.authorization)
      .then((decodedToken) => {
        req.decodedToken = decodedToken;
        next();
      })
  } catch (err) {
    res.status(401).send({ message: "Invalid Auth Token", success: false });
  }
}