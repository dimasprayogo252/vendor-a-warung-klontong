require('dotenv').config();
const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const dataWarung = [
  { "kd_produk": "A001", "nm_brg": "Kopi Bubuk 100g", "hrg": "15000", "ket_stok": "ada" },
  { "kd_produk": "A002", "nm_brg": "Gula Merah", "hrg": "12500", "ket_stok": "habis" },
  { "kd_produk": "A003", "nm_brg": "Mie Instan Goreng", "hrg": "3500", "ket_stok": "ada" },
  { "kd_produk": "A004", "nm_brg": "Sabun Colek", "hrg": "5000", "ket_stok": "ada" },
  { "kd_produk": "A005", "nm_brg": "Telur Ayam 1kg", "hrg": "28000", "ket_stok": "habis" }
];

app.get('/api/vendor-a', authMiddleware, (req, res) => {
  res.json({
    vendor: "Warung Klontong Legacy",
    total_produk: dataWarung.length,
    data: dataWarung
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Vendor A - Warung Klontong Legacy</h1>
    <p>Endpoint: <a href="/api/vendor-a">/api/vendor-a</a></p>
    <p><small>Praktikum Interoperabilitas - Poliwangi 2025/2026</small></p>
    <pre>${JSON.stringify(dataWarung, null, 2)}</pre>
  `);
});

app.listen(port, () => {
  console.log(`Vendor A jalan di port ${port}`);
});
