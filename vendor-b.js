const express = require('express');
const app = express();
const port = 3307;
const authMiddleware = require('./middleware/authMiddleware');


const distrofashion = [
  { "sku": "TSHIRT-001", "productName": "Kaos Ijen Crater", "price": 75000, "isAvaliable": true },
];

// Endpoint wajib
app.get('/api/vendor-b', (req, res) => {
  res.json(distrofashion);
});


// Biar bisa buka di browser langsung
app.get('/', (req, res) => {
  res.send(`
    <h1>Vendor B - Distro Fashion Legacy</h1>
    <h3>Praktikum Interoperabilitas - Poliwangi 2025/2026</h3>
    <p>Endpoint: <a href="/api/vendor-b">/api/vendor-b</a></p>
    <pre>${JSON.stringify(distrofashion, null, 2)}</pre>
  `);
});

app.listen(port, () => {
  console.log('Vendor B SUDAH JALAN!');
  console.log('Buka di browser: http://localhost:3307/api/vendor-b');
});