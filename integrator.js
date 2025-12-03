const express = require('express');
const axios = require('axios');
const app = express();

// URL SIMPEL - pakai localhost karena vendor A dan B lokal
const VENDOR_A = 'http://localhost:3310/api/vendor-a';
const VENDOR_B = 'http://localhost:3307/api/vendor-b';

app.get('/marketplace', async (req, res) => {
  try {
    // Ambil data dari vendor A dan B
    const [responseA, responseB] = await Promise.all([
      axios.get(VENDOR_A).catch(() => ({ data: [] })),
      axios.get(VENDOR_B).catch(() => ({ data: [] }))
    ]);

    const dataA = responseA.data || [];
    const dataB = responseB.data || [];
    
    const result = [];

    // Vendor A data
    dataA.forEach(p => {
      const harga = parseInt(p.hrg) || 0;
      result.push({
        id: p.kd_produk,
        name: p.nm_brg,
        price: harga,
        stock: p.ket_stok,
        vendor: "Warung Klontong"
      });
    });

    // Vendor B data
    dataB.forEach(p => {
      result.push({
        id: p.sku,
        name: p.productName,
        price: p.price || 0,
        stock: p.isAvaliable ? "Tersedia" : "Habis",
        vendor: "Distro Fashion"
      });
    });

    // Return JSON atau HTML sederhana
    if (req.query.format === 'json') {
      res.json({
        success: true,
        products: result,
        total: result.length
      });
    } else {
      // HTML sederhana
      const html = `
        <h1>Marketplace Sederhana</h1>
        <p>Total Produk: ${result.length}</p>
        ${result.map(p => `
          <div style="border:1px solid #ddd; padding:10px; margin:5px;">
            <h3>${p.name}</h3>
            <p>Harga: Rp ${p.price}</p>
            <p>Stock: ${p.stock}</p>
            <p>Vendor: ${p.vendor}</p>
          </div>
        `).join('')}
        <p><a href="/marketplace?format=json">Lihat JSON</a></p>
      `;
      res.send(html);
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Terjadi error: ' + error.message);
  }
});

app.get('/', (req, res) => {
  res.redirect('/marketplace');
});

const port = process.env.PORT || 3310;
app.listen(port, () => {
  console.log('✅ Integrator jalan di http://localhost:' + port);
});