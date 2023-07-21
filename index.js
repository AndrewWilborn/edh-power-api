import express from 'express';
import db from './db/dbconnect.js'
import openapi from './swagger/openapi.js';
import cards from './functions/cards.js'

const port = process.env.PORT || 3000;
const app = express();

if(process.env.NODE_ENV === 'development') {
  try {
    const request = db.request()
    await request.query(`
    CREATE TABLE Cards (
      id uniqueidentifier NOT NULL PRIMARY KEY,
      name varchar(192),
      image_uri varchar(255),
      color_identity varchar(5),
      legality varchar(64),
      type_line varchar(255)
    )`)
  } catch (err) {
    console.error(`Error creating table: ${err}`);
  }
}

app.use('/cards', cards);
// app.use('/api-docs', openapi);
// app.use('*', (_, res) => {
//   res.redirect('/api-docs');
// });

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});