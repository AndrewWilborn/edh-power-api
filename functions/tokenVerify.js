import auth from "../db/firebaseSDK.js";

export async function validToken(req, res, next) {
  console.log("verifying token")
  if (!req.headers || !req.headers.authorization) {
    res.status(401).send({ message: "No Authorization Token", success: false })
    return
  }
  try {
    auth
      .verifyIdToken(req.headers.authorization)
      .then((decodedToken) => {
        req.decodedToken = decodedToken
        console.log("token is valid")
        next()
      })
  } catch (err) {
    console.log("token is not valid")
    res.status(401).send({ message: "Invalid Auth Token", success: false })
  }
}