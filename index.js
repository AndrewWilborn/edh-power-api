import express from 'express';
import { config } from './database/config.js';
import Database from './database/database.js';

import openapi from './swagger/openapi.js';

const port = process.env.PORT || 3000;
const app = express();

if(process.env.NODE_ENV === 'development') {
  const database = new Database(config);
  database
    .executeQuery(
      ""
    )
    .then(() => {
      console.log('Table created');
    })
    .catch((err) => {
      console.error(`Error creating table: ${err}`)
    });
  
}


// app.use('/api-docs', openapi);
// app.use('*', (_, res) => {
//   res.redirect('/api-docs');
// });

app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});