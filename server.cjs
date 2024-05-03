/* 
import express from 'express';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 
*/

const express = require("express");

const app = express();
const port = 8000;

app.use(express.static(__dirname));
// express.static(path.join(__dirname, 'public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
