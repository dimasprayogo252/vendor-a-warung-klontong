const express = require('express');
const app = express();

const PORT_A = 3306;
const PORT_B = 3307;
const PORT_C = 3308;
const PORT_INTEGRATOR = 3305;

// Data Vendor A - Warung Klontong
const dataWarung = [
  { "kd_produk": "A001", "nm_brg": "Kopi Bubuk 100g", "hrg": "15000", "ket_stok": "ada" },
  { "kd_produk": "A002", "nm_brg": "Gula Merah", "hrg": "12500", "ket_stok": "habis" }
];

// Data Vendor B - Distro Fashion
const distrofashion = [
  { "sku": "TSHIRT-001", "productName": "Kaos Ijen Crater", "price": 75000, "isAvaliable": true }
];

// Data Vendor C - Restoran
const dataRestoran = [
  { 
    "id": 501, 
    "details": { "name": "Nasi Goreng Spesial", "category": "Makanan" }, 
    "pricing": { "base_price": 25000, "tax": 2500 }, 
    "stock": 10 
  },
  { 
    "id": 502, 
    "details": { "name": "Es Teh Manis", "category": "Minuman" }, 
    "pricing": { "base_price": 5000, "tax": 500 }, 
    "stock": 50 
  },
  { 
    "id": 503, 
    "details": { "name": "Ayam Bakar", "category": "Makanan" }, 
    "pricing": { "base_price": 35000, "tax": 3500 }, 
    "stock": 0 
  }
];

const appA = express();
appA.get('/api/vendor-a', (req, res) => {
  res.json(dataWarung);
});

appA.get('/', (req, res) => {
  res.json({ 
    vendor: 'Warung Klontong (A)', 
    port: PORT_A,
    endpoint: '/api/vendor-a',
    total_products: dataWarung.length
  });
});

appA.listen(PORT_A, () => {
  console.log(`Vendor A: http://localhost:${PORT_A}`);
});

const appB = express();
appB.get('/api/vendor-b', (req, res) => {
  res.json(distrofashion);
});

appB.get('/', (req, res) => {
  res.json({ 
    vendor: 'Distro Fashion (B)', 
    port: PORT_B,
    endpoint: '/api/vendor-b',
    total_products: distrofashion.length
  });
});

appB.listen(PORT_B, () => {
  console.log(`Vendor B: http://localhost:${PORT_B}`);
});

const appC = express();
appC.use(express.json());

appC.get('/api/vendor-c', (req, res) => {
  res.json(dataRestoran);
});

appC.get('/api/products', (req, res) => {
  const processed = dataRestoran.map(p => {
    const hargaFinal = (p.pricing.base_price || 0) + (p.pricing.tax || 0);
    return {
      ...p,
      total_price: hargaFinal,
      status: p.stock > 0 ? "Tersedia" : "Habis"
    };
  });
  res.json(processed);
});

appC.get('/', (req, res) => {
  res.json({ 
    vendor: 'Restoran (C)', 
    port: PORT_C,
    endpoints: ['/api/vendor-c', '/api/products'],
    total_products: dataRestoran.length
  });
});

appC.listen(PORT_C, () => {
  console.log(`Vendor C: http://localhost:${PORT_C}`);
});

app.get('/marketplace', (req, res) => {

  const allProducts = [];
  
  // Data Vendor A
  dataWarung.forEach(p => {
    allProducts.push({
      id: p.kd_produk,
      name: p.nm_brg,
      price: parseInt(p.hrg),
      stock: p.ket_stok === 'ada' ? 'Tersedia' : 'Habis',
      vendor: 'Warung Klontong (A)',
      category: 'Sembako'
    });
  });
  
  // Data Vendor B
  distrofashion.forEach(p => {
    allProducts.push({
      id: p.sku,
      name: p.productName,
      price: p.price,
      stock: p.isAvaliable ? 'Tersedia' : 'Habis',
      vendor: 'Distro Fashion (B)',
      category: 'Pakaian'
    });
  });
  
  // Data Vendor C
  dataRestoran.forEach(p => {
    const totalPrice = (p.pricing.base_price || 0) + (p.pricing.tax || 0);
    allProducts.push({
      id: `C${p.id}`,
      name: p.details.name,
      price: totalPrice,
      stock: p.stock > 0 ? 'Tersedia' : 'Habis',
      vendor: 'Restoran (C)',
      category: p.details.category
    });
  });

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    total_products: allProducts.length,
    summary: {
      vendor_a: dataWarung.length,
      vendor_b: distrofashion.length,
      vendor_c: dataRestoran.length,
      total_vendors: 3
    },
    products: allProducts
  });
});

app.get('/api/marketplace', (req, res) => {
  res.redirect('/marketplace');
});

app.get('/', (req, res) => {
  res.json({
    service: 'Marketplace Integrator',
    description: 'Integrasi Vendor A, B, dan C',
    endpoints: {
      marketplace: '/marketplace',
      vendor_a: `http://localhost:${PORT_A}/api/vendor-a`,
      vendor_b: `http://localhost:${PORT_B}/api/vendor-b`,
      vendor_c: `http://localhost:${PORT_C}/api/vendor-c`
    },
    ports: {
      vendor_a: PORT_A,
      vendor_b: PORT_B,
      vendor_c: PORT_C,
      integrator: PORT_INTEGRATOR
    }
  });
});

app.listen(PORT_INTEGRATOR, () => {
  console.log(`\n SEMUA SERVICE BERJALAN:`);
  console.log(`1. Vendor A (Warung): http://localhost:${PORT_A}`);
  console.log(`2. Vendor B (Distro): http://localhost:${PORT_B}`);
  console.log(`3. Vendor C (Resto): http://localhost:${PORT_C}`);
  console.log(`4. Integrator: http://localhost:${PORT_INTEGRATOR}`);
  console.log(`\n Marketplace: http://localhost:${PORT_INTEGRATOR}/marketplace`);
  console.log(`Total Produk: ${dataWarung.length + distrofashion.length + dataRestoran.length} item`);
});