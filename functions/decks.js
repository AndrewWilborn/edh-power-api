import db from '../db/dbconnect.js';
import sql from 'mssql';
import { uuid } from 'uuidv4';

export async function getAllDecks(req, res){
  try {
    const request = db.request();
    const result = await request.query("SELECT * FROM Decks");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    res.status(500).json({error: err?.message});
  }
}

export async function addDeck(req, res){
  try {
    const deck = req.body;
    const request = db.request();
    // TODO generate unique identifier instead of getting it from the body
    request.input('id', sql.UniqueIdentifier, uuid());
    // TODO change owner to a more proper datatype to store firebase user id 
    request.input('owner', sql.NVarChar(255), req.decodedToken.user_id);
    request.input('commander', sql.UniqueIdentifier, deck.commander);
    request.input('deck_name', sql.NVarChar(255), deck.deck_name);
    request.input('avg_rating', sql.Int, deck.avg_rating);
    request.input('num_ratings', sql.Int, deck.num_ratings);
    request.input('decklist_url', sql.NVarChar(255), deck.decklist_url);
    request.input('has_partner', sql.Bit, deck.partner ? 1 : 0);
    // If partner is null then it will default to prismatic piper to keep partner column from being null
    request.input('partner', sql.UniqueIdentifier, deck.partner || "a69e6d8f-f742-4508-a83a-38ae84be228c");
    request.input('timestamp', sql.BigInt, deck.timestamp);

    const result = await request.query(
      `INSERT INTO Decks (id, owner, commander, deck_name, avg_rating, num_ratings, decklist_url, has_partner, partner, timestamp)
      VALUES (@id, @owner, @commander, @deck_name, @avg_rating, @num_ratings, @decklist_url, @has_partner, @partner, @timestamp)`
    );

    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({error: err?.message});
  }
}
