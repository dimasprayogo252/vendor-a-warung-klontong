const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const authMiddleware = require('./middleware/authMiddleware'); // Asumsi file ini ada

app.use(express.json());

function processProduct(product) {
    if (!product.pricing) {
        return { ...product, error: "Pricing data is missing" };
    }
    
    const basePrice = product.pricing.base_price || 0;
    const tax = product.pricing.tax || 0;
    const stock = product.stock || 0;

    
    const hargaFinal = basePrice + tax;

    const statusString = stock > 0 ? "Tersedia" : "Tidak Tersedia";

    return {
        id: product.id,
        details: product.details,
        pricing: {
            ...product.pricing,
            harga_final: hargaFinal 
        },
        stock: product.stock,
        status_string: statusString 
    };
}

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = products.find(p => p.id === id);
    if (!item) return res.status(404).json({ message: 'Product not found' });
    res.json(item);
});


app.get('/api/products/:id/total', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = products.find(p => p.id === id);
      if (!item) return res.status(404).json({ message: 'Product not found' });
        const total = (item.pricing?.base_price || 0) + (item.pricing?.tax || 0); 
         res.json({ id: item.id, total_price: total });
});

app.post('/api/products', (req, res) => {
    const newProduct = req.body;
      if (!newProduct.pricing || !newProduct.details) {
        return res.status(400).json({ 
            message: "Body request harus memiliki 'pricing' dan 'details'." 
        });
      }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 501;
    newProduct.id = newId;
    products.push(newProduct);

    res.status(201).json(newProduct);
}); 


app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});