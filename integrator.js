const express = require('express');
const axios = require('axios');
const app = express();

// GANTI URL ke localhost (sesuai port yang jalan)
const VENDOR_A = 'http://localhost:3310/api/vendor-a';  // Port 3310 dari Vendor A
const VENDOR_B = 'http://localhost:3307/api/vendor-b';  // Port 3307 dari Vendor B
const VENDOR_C = 'https://vendor-c-resto.vercel.app/api/vendor-c';  // Biarkan ini jika ada

// Fallback URLs jika localhost gagal
const FALLBACK_URLS = {
  vendorA: ['http://localhost:3310/api/vendor-a', 'https://vendor-a-klontong.vercel.app/api/vendor-a'],
  vendorB: ['http://localhost:3307/api/vendor-b', 'https://vendor-b-distro.vercel.app/api/vendor-b'],
  vendorC: ['https://vendor-c-resto.vercel.app/api/vendor-c']
};

async function tryFetchWithFallback(vendor, urls) {
  for (const url of urls) {
    try {
      console.log(`🔄 Mencoba ${vendor}: ${url}`);
      const response = await axios.get(url, { timeout: 3000 });
      console.log(`✅ ${vendor} berhasil: ${url}`);
      return response.data;
    } catch (error) {
      console.log(`❌ ${vendor} gagal: ${url} - ${error.code || error.message}`);
    }
  }
  console.log(`⚠️ Semua endpoint ${vendor} gagal, menggunakan data dummy`);
  return getDummyData(vendor);
}

function getDummyData(vendor) {
  const dummyData = {
    'vendorA': [
      { "kd_produk": "A001", "nm_brg": "Kopi Bubuk 100g", "hrg": "15000", "ket_stok": "ada" },
      { "kd_produk": "A002", "nm_brg": "Gula Merah", "hrg": "12500", "ket_stok": "habis" }
    ],
    'vendorB': [
      { "sku": "TSHIRT-001", "productName": "Kaos Ijen Crater", "price": 75000, "isAvaliable": true }
    ],
    'vendorC': [
      { "id": 1, "details": { "name": "Nasi Goreng", "category": "Food" }, "pricing": { "base_price": 25000, "tax": 2500 }, "stock": 10 }
    ]
  };
  return dummyData[vendor] || [];
}

app.get('/marketplace', async (req, res) => {
  try {
    console.log('\n🚀 Memulai integrasi marketplace...');
    
    // Ambil data dengan fallback
    const [dataA, dataB, dataC] = await Promise.all([
      tryFetchWithFallback('vendorA', FALLBACK_URLS.vendorA),
      tryFetchWithFallback('vendorB', FALLBACK_URLS.vendorB),
      tryFetchWithFallback('vendorC', FALLBACK_URLS.vendorC)
    ]);

    const result = [];

    // Process Vendor A data
    if (Array.isArray(dataA)) {
      dataA.forEach(p => {
        const harga = parseInt(p.hrg) || 0;
        result.push({
          id: p.kd_produk,
          name: p.nm_brg,
          price: Math.floor(harga * 0.9), // Discount 10%
          stock_status: p.ket_stok === 'ada' ? 'Tersedia' : 'Habis',
          vendor: "Warung Klontong (A)",
          original_price: harga
        });
      });
    }

    // Process Vendor B data
    if (Array.isArray(dataB)) {
      dataB.forEach(p => {
        result.push({
          id: p.sku,
          name: p.productName,
          price: p.price || 0,
          stock_status: p.isAvaliable ? "Tersedia" : "Habis",
          vendor: "Distro Fashion (B)",
          original_price: p.price || 0
        });
      });
    }

    // Process Vendor C data
    if (Array.isArray(dataC)) {
      dataC.forEach(p => {
        let name = p.details?.name || "Unknown";
        if (p.details?.category === "Food") name += " (Recommended)";
        const totalPrice = (p.pricing?.base_price || 0) + (p.pricing?.tax || 0);
        result.push({
          id: p.id?.toString() || Math.random().toString(),
          name,
          price: totalPrice,
          stock_status: p.stock > 0 ? "Tersedia" : "Habis",
          vendor: "Restoran (C)",
          original_price: totalPrice
        });
      });
    }

    // Tambah HTML view
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      res.send(generateHTML(result));
    } else {
      res.json({
        success: true,
        total_products: result.length,
        vendors: {
          A: Array.isArray(dataA) ? dataA.length : 0,
          B: Array.isArray(dataB) ? dataB.length : 0,
          C: Array.isArray(dataC) ? dataC.length : 0
        },
        products: result,
        timestamp: new Date().toISOString()
      });
    }

  } catch (err) {
    console.error('❌ Error utama:', err.message);
    res.status(500).json({ 
      error: "Gagal mengambil data vendor",
      message: err.message,
      dummy_data: [
        getDummyData('vendorA'),
        getDummyData('vendorB'),
        getDummyData('vendorC')
      ]
    });
  }
});

function generateHTML(products) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Banyuwangi Marketplace</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; background: #f7f9fc; }
      .container { max-width: 1200px; margin: 0 auto; }
      .header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 30px; 
        border-radius: 10px;
        text-align: center;
        margin-bottom: 30px;
      }
      .product-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
        gap: 20px; 
      }
      .product-card { 
        background: white; 
        padding: 20px; 
        border-radius: 10px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.3s;
      }
      .product-card:hover { transform: translateY(-5px); }
      .vendor-badge { 
        display: inline-block; 
        padding: 4px 12px; 
        border-radius: 20px; 
        font-size: 12px; 
        font-weight: bold;
        margin-bottom: 10px;
      }
      .vendor-a { background: #4CAF50; color: white; }
      .vendor-b { background: #2196F3; color: white; }
      .vendor-c { background: #FF9800; color: white; }
      .price { 
        font-size: 24px; 
        font-weight: bold; 
        color: #2c3e50;
        margin: 10px 0;
      }
      .original-price { 
        text-decoration: line-through; 
        color: #95a5a6; 
        font-size: 14px;
      }
      .stock { 
        padding: 5px 10px; 
        border-radius: 5px; 
        font-size: 14px;
      }
      .available { background: #d4edda; color: #155724; }
      .unavailable { background: #f8d7da; color: #721c24; }
      .summary {
        background: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🛍️ Banyuwangi Marketplace</h1>
        <p>Integrasi Multi-Vendor - UAS Interoperabilitas</p>
        <p>Total Produk: ${products.length} items</p>
      </div>
      
      <div class="summary">
        <h3>📊 Ringkasan Integrasi</h3>
        <p>Vendor A (Warung Klontong) | Vendor B (Distro Fashion) | Vendor C (Restoran)</p>
      </div>
      
      <div class="product-grid">
        ${products.map(p => `
          <div class="product-card">
            <div class="vendor-badge ${'vendor-' + p.vendor.charAt(0).toLowerCase()}">
              ${p.vendor}
            </div>
            <h3>${p.name}</h3>
            <div class="price">Rp ${p.price.toLocaleString()}</div>
            ${p.original_price && p.original_price !== p.price ? 
              `<div class="original-price">Rp ${p.original_price.toLocaleString()}</div>` : ''}
            <div class="stock ${p.stock_status === 'Tersedia' ? 'available' : 'unavailable'}">
              ${p.stock_status}
            </div>
            <p><strong>ID:</strong> ${p.id}</p>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 10px;">
        <h3>📡 API Endpoints</h3>
        <ul>
          <li><a href="/marketplace">/marketplace</a> - Halaman ini (HTML)</li>
          <li><a href="/marketplace" onclick="fetchJSON(event)">/marketplace</a> - Data JSON (klik kanan untuk raw)</li>
          <li><a href="http://localhost:3310/api/vendor-a" target="_blank">Vendor A API</a></li>
          <li><a href="http://localhost:3307/api/vendor-b" target="_blank">Vendor B API</a></li>
          <li><a href="https://vendor-c-resto.vercel.app/api/vendor-c" target="_blank">Vendor C API</a></li>
        </ul>
      </div>
    </div>
    
    <script>
      function fetchJSON(e) {
        e.preventDefault();
        fetch('/marketplace')
          .then(r => r.json())
          .then(data => {
            console.log('JSON Data:', data);
            alert('JSON data dikonsol. Lihat Developer Tools (F12)');
          });
      }
    </script>
  </body>
  </html>
  `;
}

app.get('/', (req, res) => {
  res.redirect('/marketplace');
});

const port = process.env.PORT || 3310;
app.listen(port, () => {
  console.log('\n========================================');
  console.log('🚀 Integrator BERHASIL jalan!');
  console.log(`🌐 Buka di browser: http://localhost:${port}/marketplace`);
  console.log('📡 Sedang mencoba menghubungkan ke vendor...');
  console.log('========================================\n');
  
  // Test koneksi saat startup
  setTimeout(async () => {
    try {
      console.log('🔄 Testing koneksi ke Vendor A (localhost:3310)...');
      const testA = await axios.get('http://localhost:3310/api/vendor-a', { timeout: 2000 });
      console.log(`✅ Vendor A terhubung: ${testA.data.length} produk`);
    } catch (e) {
      console.log('❌ Vendor A tidak merespon di localhost:3310');
      console.log('   Pastikan Vendor A berjalan di terminal lain');
    }
    
    try {
      console.log('🔄 Testing koneksi ke Vendor B (localhost:3307)...');
      const testB = await axios.get('http://localhost:3307/api/vendor-b', { timeout: 2000 });
      console.log(`✅ Vendor B terhubung: ${testB.data.length} produk`);
    } catch (e) {
      console.log('❌ Vendor B tidak merespon di localhost:3307');
      console.log('   Pastikan Vendor B berjalan di terminal lain');
    }
  }, 1000);
});

module.exports = app;