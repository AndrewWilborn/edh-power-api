import db from '../db/dbconnect.js';
import sql from 'mssql'

export async function getAllCards(req, res){
  try{
    const request = db.request();
    const result = await request.query("SELECT * FROM Cards");
    const cards = result.recordsets;
    res.status(200).json(cards[0]);
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}
export async function getCardById(req, res){
  try{
    const cardId = req.params.id;
    if(!cardId){
      res.status(404);
    } else {
      const request = db.request();
      request.input('id', sql.UniqueIdentifier, cardId);
      const result = await request.query(
        `SELECT * FROM Cards WHERE id = @id`
      );
      const card = result.recordsets[0][0];
      res.status(200).json(card);
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

export async function addCard(req, res){
  try{
    const card = req.body;
    const request = db.request();
    request.input('id', sql.UniqueIdentifier, card.id);
    request.input('name', sql.NVarChar(192), card.name);
    request.input('image_uri', sql.NVarChar(255), card.image_uri);
    request.input('color_identity', sql.NVarChar(5), card.color_identity);
    request.input('valid_commander', sql.Bit, card.valid_commander)

    const result = await request.query(
      `INSERT INTO Cards (id, name, image_uri, color_identity, valid_commander)
      VALUES (@id, @name, @image_uri, @color_identity, @valid_commander)`
    );
    
    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
}

// export async function deleteCard(req, res){
//   try{
//     const cardId = req.params.id;
//     if(!cardId){
//       res.status(404);
//     } else {
//       const request = db.request();
//       request.input('id', sql.UniqueIdentifier, cardId);
//       const result = await request.query(
//         `DELETE FROM Cards WHERE id = @id`
//       );
//       const rowsAffected = result.rowsAffected[0];

//       res.status(204).json({ rowsAffected });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err?.message });
//   }
// }