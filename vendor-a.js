const express = require('express');
const app = express();
const port = 3310;
const authMiddleware = require('./middleware/authMiddleware');


const dataWarung = [
  { "kd_produk": "A001", "nm_brg": "Kopi Bubuk 100g", "hrg": "15000", "ket_stok": "ada" },
  { "kd_produk": "A002", "nm_brg": "Gula Merah",       "hrg": "12500", "ket_stok": "habis" }
];

app.get('/api/vendor-a', (req, res) => {
  res.json(dataWarung);
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Vendor A - Warung Klontong Legacy</h1>
    <h3>UAS PRAKTIKUM INTROPERABITAS</h3>
    <p>Endpoint: <a href="/api/vendor-a">/api/vendor-a</a></p>
    <pre>${JSON.stringify(dataWarung, null, 2)}</pre>
  `);
});

app.listen(port, () => {
  console.log(`Server aktif di http://localhost:${port}`);
});