import express from 'express';
import db from '../db/dbconnect.js';
import sql from 'mssql'

const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
  try{
    const request = db.request();
    const result = await request.query("SELECT * FROM Cards");
    const cards = result.recordsets;
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
})

router.post('/', async (req, res) => {
  try{
    const card = req.body;
    const request = db.request();
    request.input('id', sql.UniqueIdentifier, card.id);
    request.input('name', sql.NVarChar(192), card.name);
    request.input('image_uri', sql.NVarChar(255), card.image_uri);
    request.input('color_identity', sql.NVarChar(5), card.color_identity);
    request.input('legality', sql.NVarChar(64), card.legality);
    request.input('type_line', sql.NVarChar(255), card.type_line);

    const result = await request.query(
      `INSERT INTO Cards (id, name, image_uri, color_identity, legality, type_line)
      VALUES (@id, @name, @image_uri, @color_identity, @legality, @type_line)`
    );
    
    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({error: err?.message });
  }
});

router.delete('/:id', async (req, res) => {
  try{
    const cardId = req.params.id;
    if(!cardId){
      res.status(404);
    } else {
      const request = db.request();
      request.input('id', sql.UniqueIdentifier, cardId);
      const result = await request.query(
        `DELETE FROM Cards WHERE id = @id`
      );
      const rowsAffected = result.rowsAffected[0];

      res.status(204).json({ rowsAffected });
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
})

export default router;