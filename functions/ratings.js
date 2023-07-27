import db from "../db/dbconnect.js";
import sql from 'mssql';
import { uuid } from 'uuidv4'

export async function getAllRatings(req, res) {
  try {
    const request = db.request();
    const result = await request.query("SELECT * FROM Ratings");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

export async function addRating(req, res) {
  // Establish input
  const user = req.decodedToken.user_id;
  const deckId = req.body.deckId;
  const ratingVal = req.body.ratingVal;
  if (ratingVal > 1000 || ratingVal < 0) {
    res.status(400);
    return;
  }

  // Add rating to database
  try {
    const request = db.request();
    const _uuid = uuid();
    request.input('id', sql.UniqueIdentifier, _uuid);
    request.input('deck_id', sql.UniqueIdentifier, deckId);
    request.input('user_id', sql.NVarChar(255), user);
    request.input('rating_val', sql.Int, ratingVal);
    request.input('outdated', sql.Bit, false);
    console.log(`INSERT INTO Ratings (id, deck_id, user_id, rating_val, outdated)
    VALUES (${_uuid}, ${deckId}, ${user}, ${ratingVal}, 0)`)
    const result = await request.query(
      `INSERT INTO Ratings (id, deck_id, user_id, rating_val, outdated)
      VALUES (@id, @deck_id, @user_id, @rating_val, @outdated)`
    );
    console.log("finished posting")

    // TODO: update average rating
    const rowsAffected = result.rowsAffected[0];
    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
    return;
  }
}