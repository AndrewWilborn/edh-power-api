import express from 'express';
import cors from 'cors';
import openapi from './swagger/openapi.js';
import { addDeck, getAllDecks } from './functions/decks.js';
import { addCard, getAllCards, getCardById } from './functions/cards.js';
import dev from './dev_scripts/tables.js';
import { validToken } from './functions/tokenVerify.js';

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

// TODO: make this route admin only
app.use('/dev', dev);

app.get('/decks', getAllDecks);
app.post('/decks', validToken, addDeck);

app.get('/cards', getAllCards);
app.get('/cards/:id', getCardById);
// TODO: make this route admin only
app.post('/cards', addCard);

// app.use('/api-docs', openapi);
// app.use('*', (_, res) => {
//   res.redirect('/api-docs');
// });

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});