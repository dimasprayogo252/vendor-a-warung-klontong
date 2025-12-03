const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// CORS biar bisa di-fetch dari mana aja
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// DATA JADUL 100% SESUAI SOAL (Vendor A - Warung Klontong Legacy)
const dataWarung = [
  { "kd_produk": "A001", "nm_brg": "Kopi Bubuk 100g", "hrg": "15000", "ket_stok": "ada" },
  { "kd_produk": "A002", "nm_brg": "Gula Merah", "hrg": "12500", "ket_stok": "habis" },
  { "kd_produk": "A003", "nm_brg": "Mie Instan Goreng", "hrg": "3500", "ket_stok": "ada" },
  { "kd_produk": "A004", "nm_brg": "Sabun Colek", "hrg": "5000", "ket_stok": "ada" }
];

// Endpoint utama (ini yang wajib ada!)
app.get('/api/vendor-a', (req, res) => {
  res.json(dataWarung);
});

// Root biar gak 404 total
app.get('/', (req, res) => {
  res.send(`
    <h1>Vendor A - Warung Klontong Legacy (Interoperabilitas)</h1>
    <p>Endpoint: <a href="/api/vendor-a">/api/vendor-a</a></p>
    <pre>${JSON.stringify(dataWarung, null, 2)}</pre>
  `);
});

app.listen(port, () => {
  console.log('Vendor A jalan!');
});
