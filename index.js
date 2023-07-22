import express from 'express';
import db from './db/dbconnect.js'
import openapi from './swagger/openapi.js';
import cards from './functions/cards.js';
import decks from './functions/decks.js';

const port = process.env.PORT || 3000;
const app = express();

// Structure for creating cards table

/*
if(process.env.NODE_ENV === 'development') {
  try {
    const request = db.request();
    await request.query(`
    CREATE TABLE Cards (
      id uniqueidentifier NOT NULL PRIMARY KEY,
      name varchar(192),
      image_uri varchar(255),
      color_identity varchar(5),
      legality varchar(64),
      type_line varchar(255)
    )`);
  } catch (err) {
    console.error(`Error creating table: ${err}`);
  }
}
*/

// Structure for creating decks table

if(process.env.NODE_ENV === 'development') {
  try {
    const request = db.request();
    // TODO change owner to be a more proper datatype to store firebase user id
    await request.query(`
    CREATE TABLE Decks (
      id uniqueidentifier NOT NULL PRIMARY KEY,
      owner varchar(255) NOT NULL,
      commander uniqueidentifier NOT NULL,
      deck_name varchar(255) NOT NULL,
      avg_rating int,
      num_ratings int,
      decklist_url varchar(255),
      partner uniqueidentifier
    )`);
  } catch (err) {
    console.error(`Error creating table: ${err}`);
  }
}

app.use('/cards', cards);
app.use('/decks', decks);
// app.use('/api-docs', openapi);
// app.use('*', (_, res) => {
//   res.redirect('/api-docs');
// });

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});