import express from 'express';
import cors from 'cors'
import openapi from './swagger/openapi.js';
import cards from './functions/cards.js';
import decks from './functions/decks.js';
import dev from './dev_scripts/scripts.js';

const port = process.env.PORT || 3000;
const app = express();
app.use(cors())

// app.use('/dev', dev)

app.use('/cards', cards);
app.use('/decks', decks);
// app.use('/api-docs', openapi);
// app.use('*', (_, res) => {
//   res.redirect('/api-docs');
// });

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});