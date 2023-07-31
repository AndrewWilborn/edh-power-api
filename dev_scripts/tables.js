import express from 'express';
import db from '../db/dbconnect.js';
import sql from 'mssql';

const router = express.Router();

// Run dev commands from here
router.get('/', async (req, res) => {
  try {
    const request = db.request();
    await request.query("");
    res.status(200).json({ message: "script run successfully"});
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
})

// Utility route for updating the artist column
router.patch('/', async(req, res) => {
  try{
    const card = req.body;
    const request = db.request();
    request.input('id', sql.UniqueIdentifier, card.id);
    request.input('artist', sql.NVarChar(255), card.artist);

    const result = await request.query(
      "UPDATE Cards SET artist = @artist WHERE id=@id"
    );
    
    const rowsAffected = result.rowsAffected[0];

    res.status(201).json({ rowsAffected });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
})

// Structure for creating cards table
const createCards = `CREATE TABLE Cards (
  id uniqueidentifier NOT NULL PRIMARY KEY,
  name varchar(192) NOT NULL,
  image_uri varchar(255) NOT NULL,
  color_identity varchar(5) NOT NULL,
  valid_commander bit NOT NULL,
  artist varchar(255) NOT NULL
)`

// Structure for creating decks table
const createDecks = `CREATE TABLE Decks (
  id uniqueidentifier NOT NULL PRIMARY KEY,
  owner varchar(255) NOT NULL,
  commander uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Cards(id),
  deck_name varchar(255) NOT NULL,
  avg_rating int,
  num_ratings int,
  decklist_url varchar(255),
  has_partner bit,
  partner uniqueidentifier FOREIGN KEY REFERENCES Cards(id),
  timestamp bigint,
  which_art tinyint
)`

// Structure for creating ratings table
const createRatings = `CREATE TABLE Ratings(
  id uniqueidentifier NOT NULL PRIMARY KEY,
  deck_id uniqueidentifier NOT NULL FOREIGN KEY REFERENCES Decks(id),
  user_id varchar(255) NOT NULL,
  rating_val int NOT NULL,
  outdated bit
)`

export default router;