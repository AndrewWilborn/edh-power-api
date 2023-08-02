import db from '../db/dbconnect.js';
import sql from 'mssql';
import { uuid } from 'uuidv4';
import { getCardsFromName } from './cards.js';

export async function getAllDecks(req, res) {
  try {
    const request = db.request();
    const result = await request.query("SELECT commander, deck_name, avg_rating, num_ratings, decklist_url, partner, timestamp, which_art FROM decks");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    console.log(err);
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
        `SELECT commander, deck_name, avg_rating, num_ratings, decklist_url, partner, timestamp, which_art FROM decks WHERE id = @id`
      );
      const deck = result.recordsets[0][0];
      if (!deck) {
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
    const result = await request.query("SELECT * FROM decks WHERE owner = @owner");
    const decks = result.recordsets;
    res.status(200).json(decks[0]);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

export async function addDeck(req, res) {
  try {
    const deck = req.body;
    const commanderId = await getCardsFromName(deck.commander);
    const partnerId = deck.partner && await getCardsFromName(deck.partner);
    const request = db.request();
    const _uuid = uuid();
    request.input('id', sql.UniqueIdentifier, _uuid);
    // TODO change owner to a more proper datatype to store firebase user id 
    request.input('owner', sql.NVarChar(255), req.decodedToken.user_id);
    request.input('commander', sql.UniqueIdentifier, commanderId[0].id);
    request.input('deck_name', sql.NVarChar(255), deck.deck_name);
    request.input('decklist_url', sql.NVarChar(255), deck.decklist_url);
    request.input('partner', sql.UniqueIdentifier, deck.partner && partnerId[0].id);
    request.input('timestamp', sql.BigInt, deck.timestamp);

    const result = await request.query(
      `INSERT INTO decks (id, owner, commander, deck_name, avg_rating, num_ratings, decklist_url, partner, timestamp, which_art)
      VALUES (@id, @owner, @commander, @deck_name, 0, 0, @decklist_url, @partner, @timestamp, 0)`
    );

    res.status(201).json({ id: _uuid });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err?.message });
  }
}

export async function toggleArtById(req, res) {
  try {
    const deckId = req.params.id;
    if (!deckId) {
      res.status(404);
    } else {
      const request = db.request();
      request.input('deckId', sql.UniqueIdentifier, deckId);
      const result = await request.query(
        `DECLARE @commander AS UniqueIdentifier
        SELECT @commander = commander FROM decks WHERE id = @deckId
        DECLARE @name as VARCHAR(192)
        SELECT @name = name from cards WHERE id = @commander
        SELECT id FROM cards WHERE name = @name
        SELECT which_art FROM decks WHERE id = @deckId`
      );
      // Array with each art of the commander of the deck
      const cards = result.recordsets[0];
      const which_art = (result.recordsets[1][0].which_art + 1) % cards.length;
      // Skip type verification for cards and which_art as both come directly from db
      await request.query(
        `UPDATE decks SET which_art = '${which_art}', commander = '${cards[which_art].id}' WHERE id = @deckId`
      )
      res.status(201).json({ newId: cards[which_art].id })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err?.message });
  }
}

export async function updateDeck(req, res) {
  try {
    const uid = req.decodedToken.user_id;
    const deckId = req.params.id;
    if (!(uid && deckId)) {
      res.status(404);
    } else {

    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err?.message });
  }
}

export async function deleteDeck(req, res) {
  try {
    const uid = req.decodedToken.user_id;
    const deckId = req.params.id;
    if (!(uid && deckId)) {
      res.status(404);
    } else {
      const request = db.request();
      request.input('deckId', sql.UniqueIdentifier, deckId);
      request.input('userId', sql.NVarChar(255), uid);
      const result = await request.query(`
        IF(@userId = (SELECT owner FROM decks WHERE id=@deckId))
        BEGIN
        DELETE FROM ratings WHERE deck_id=@deckId
        DELETE FROM decks WHERE id=@deckId
        END
      `)
      const rowsAffected = result.recordsets[0];
      res.status(201).json({ rowsAffected });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err?.message });
  }
}