const express = require('express');
const axios = require('axios');
const app = express();

const VENDOR_A = 'http://localhost:3310/api/vendor-a'; 
const VENDOR_B = 'http://localhost:3307/api/vendor-b';  
const VENDOR_C = 'https://vendor-c-resto.vercel.app/api/vendor-c'; 

const FALLBACK_URLS = {
  vendorA: ['http://localhost:3310/api/vendor-a', 'https://vendor-a-klontong.vercel.app/api/vendor-a'],
  vendorB: ['http://localhost:3307/api/vendor-b', 'https://vendor-b-distro.vercel.app/api/vendor-b'],
  vendorC: ['https://vendor-c-resto.vercel.app/api/vendor-c']
};

async function tryFetchWithFallback(vendor, urls) {
  for (const url of urls) {
    try {
      console.log(`Coba ${vendor}: ${url}`);
      const response = await axios.get(url, { timeout: 3000 });
      console.log(`${vendor} berhasil: ${url}`);
      return response.data;
    } catch (error) {
      console.log(`${vendor} gagal: ${url} - ${error.code || error.message}`);
    }
  }
  console.log(`Semua endpoint ${vendor} gagal, menggunakan data dummy`);
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
          price: Math.floor(harga * 0.9),
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

  } catch (err) {
    console.error('Error utama:', err.message);
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

app.get('/', (req, res) => {
  res.redirect('/marketplace');
});

const port = process.env.PORT || 3310;
app.listen(port, () => {
  console.log('\n');
  console.log('Integrator BERHASIL jalan!');
  console.log(`Buka di browser: http://localhost:${port}/marketplace`);
  console.log('Sedang mencoba menghubungkan ke vendor...');
  console.log('\n');

  setTimeout(async () => {
    try {
      console.log('Testing koneksi ke Vendor A (localhost:3310)...');
      const testA = await axios.get('http://localhost:3310/api/vendor-a', { timeout: 2000 });
      console.log(`Vendor A terhubung: ${testA.data.length} produk`);
    } catch (e) {
      console.log('Vendor A tidak merespon di localhost:3310');
      console.log('   Pastikan Vendor A berjalan di terminal lain');
    }
    
    try {
      console.log('Testing koneksi ke Vendor B (localhost:3307)...');
      const testB = await axios.get('http://localhost:3307/api/vendor-b', { timeout: 2000 });
      console.log(`Vendor B terhubung: ${testB.data.length} produk`);
    } catch (e) {
      console.log('Vendor B tidak merespon di localhost:3307');
      console.log('   Pastikan Vendor B berjalan di terminal lain');
    }
  }, 1000);
});

module.exports = app;