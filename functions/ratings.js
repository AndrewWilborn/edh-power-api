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
    const result = await request.query(
      `
      IF ((SELECT COUNT(*) FROM Ratings WHERE deck_id=@deck_id AND user_id=@user_id) = 1)
      BEGIN
        UPDATE Ratings SET rating_val=@rating_val, outdated=@outdated WHERE deck_id=@deck_id AND user_id=@user_id
      END
      ELSE
      BEGIN
        INSERT INTO Ratings (id, deck_id, user_id, rating_val, outdated) VALUES (@id, @deck_id, @user_id, @rating_val, @outdated)
      END
      `
    );
    // TODO: update average rating
    const updateAvg = db.request();
    updateAvg.input('deck_id', sql.UniqueIdentifier, deckId);
    const avgResult = await updateAvg.query(
      `
      UPDATE Decks SET avg_rating=(SELECT AVG(rating_val) FROM Ratings WHERE deck_id=@deck_id) WHERE id=@deck_id
      `
    )
    const rowsAffected = result.rowsAffected[0];
    const rowsAffectedAvg = avgResult.rowsAffected[0];
    res.status(201).json({ rowsAffected, rowsAffectedAvg });
  } catch (err) {
    res.status(500).json({ error: err?.message });
    return;
  }
}