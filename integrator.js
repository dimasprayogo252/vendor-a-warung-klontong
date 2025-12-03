// integrator.js
const express = require('express');
const axios = require('axios');
const app = express();

const VENDOR_A = 'https://vendor-a-klontong.vercel.app/products';
const VENDOR_B = 'https://vendor-b-distro.vercel.app/products';
const VENDOR_C = 'https://vendor-c-resto.vercel.app/products';

app.get('/marketplace', async (req, res) => {
  try {
    const [a, b, c] = await Promise.all([
      axios.get(VENDOR_A),
      axios.get(VENDOR_B),
      axios.get(VENDOR_C)
    ]);

    const result = [];

    // Vendor A – Jadul
    a.data.forEach(p => {
      const harga = parseInt(p.hrg);
      result.push({
        id: p.kd_produk,
        name: p.nm_brg,
        price: Math.floor(harga * 0.9),  // diskon 10%
        stock_status: p.ket_stok,
        vendor: "A"
      });
    });

    // Vendor B – Modern
    b.data.forEach(p => {
      result.push({
        id: p.sku,
        name: p.productName,
        price: p.price,
        stock_status: p.isAvailable ? "Tersedia" : "habis",
        vendor: "B"
      });
    });

    // Vendor C – Nested
    c.data.forEach(p => {
      let name = p.details.name;
      if (p.details.category === "Food") name += " (Recommended)";
      result.push({
        id: p.id.toString(),
        name,
        price: p.pricing.base_price + p.pricing.tax,
        stock_status: p.stock > 0 ? "Tersedia" : "habis",
        vendor: "C"
      });
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data vendor" });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Banyuwangi Marketplace - Integrator UAS Interopabilitas</h1>
    <p><a href="/marketplace">Klik di sini</a> untuk melihat hasil normalisasi semua vendor</p>
    <p>Dikerjakan sendiri oleh: Dimas Prayogo (dimasprayogo252)</p>
  `);
});

const port = process.env.PORT || 3310;
app.listen(port, () => {
  console.log('Integrator BERHASIL jalan!');
  console.log(`Buka di browser: http://localhost:${port}/marketplace`);
  console.log('Atau cek semua vendor dulu:');
  console.log(`   Vendor A → http://localhost:3001/products`);
  console.log(`   Vendor B → http://localhost:3002/products`);
  console.log(`   Vendor C → http://localhost:3003/products`);
});