import db from '../db/dbconnect.js';
import sql from 'mssql';
import { uuid } from 'uuidv4';
import { getCardIdFromName } from './cards.js';

export async function getAllDecks(req, res) {
  try {
    const request = db.request();
    const result = await request.query("SELECT * FROM Decks");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

export async function getDeckById(req, res) {
  try {
    const deckId = req.params.id;
    if (!deckId) {
      res.status(404);
    } else {
      const request = db.request();
      request.input('id', sql.UniqueIdentifier, deckId);
      const result = await request.query(
        `SELECT * FROM Decks WHERE id = @id`
      );
      const deck = result.recordsets[0][0];
      if(!deck){
        res.status(404);
      }
      res.status(200).json(deck);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}


export async function getDecksByOwner(req, res) {
  try {
    const owner = req.params.owner;
    const request = db.request();
    request.input('owner', sql.NVarChar(255), owner);
    const result = await request.query("SELECT * FROM Decks WHERE owner = @owner");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

export async function addDeck(req, res) {
  try {
    const deck = req.body;
    const commanderId = await getCardIdFromName(deck.commander);
    const partnerId = deck.partner && await getCardIdFromName(deck.partner);
    const request = db.request();
    // TODO generate unique identifier instead of getting it from the body
    request.input('id', sql.UniqueIdentifier, uuid());
    // TODO change owner to a more proper datatype to store firebase user id 
    request.input('owner', sql.NVarChar(255), req.decodedToken.user_id);
    request.input('commander', sql.UniqueIdentifier, commanderId);
    request.input('deck_name', sql.NVarChar(255), deck.deck_name);
    request.input('avg_rating', sql.Int, deck.avg_rating);
    request.input('num_ratings', sql.Int, deck.num_ratings);
    request.input('decklist_url', sql.NVarChar(255), deck.decklist_url);
    request.input('partner', sql.UniqueIdentifier, partnerId);
    request.input('timestamp', sql.BigInt, deck.timestamp);

    const result = await request.query(
      `INSERT INTO Decks (id, owner, commander, deck_name, avg_rating, num_ratings, decklist_url, partner, timestamp)
      VALUES (@id, @owner, @commander, @deck_name, @avg_rating, @num_ratings, @decklist_url, @partner, @timestamp)`
    );

    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}
