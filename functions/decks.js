import express from 'express';
import db from '../db/dbconnect.js';
import sql, { UniqueIdentifier } from 'mssql'

const router = express.Router();
router.use(express.json());

router.post('/', async (req, res) => {
  try {
    const deck = req.body;
    const request = db.request();
    request.input('id', sql.UniqueIdentifier, deck.id);
    // TODO change owner to a more proper datatype to store firebase user id 
    request.input('owner', sql.NVarChar(255), deck.owner);
    request.input('commander', UniqueIdentifier, deck.commander);
    request.input('deck_name', sql.VarChar(255), deck.deck_name);
    request.input('avg_rating', sql.Int, deck.avg_rating);
    request.input('num_ratings', sql.Int, deck.num_ratings);
    request.input('decklist_url', sql.VarChar(255), deck.decklist_url);
    request.input('partner', sql.UniqueIdentifier, deck.partner);

    const result = await request.query(
      `INSERT INTO Decks (id, owner, commander, deck_name, avg_rating, num_ratings, decklist_url, partner)
      VALUES (@id, @owner, @commander, @deck_name, @avg_rating, @num_ratings, @decklist_url, @partner)`
    );

    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({error: err?.message});
  }
})

export default router;