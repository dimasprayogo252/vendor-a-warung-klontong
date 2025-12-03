const express = require('express');
const axios = require('axios');
const app = express();

const VENDOR_A = 'https://vendor-a-klontong.vercel.app/api/vendor-a';
const VENDOR_B = 'https://vendor-b-distro.vercel.app/api/vendor-b';
const VENDOR_C = 'https://vendor-c-resto.vercel.app/api/vendor-c';

app.get('/marketplace', async (req, res) => {
    try {
        const [a, b, c] = await Promise.all([
            axios.get(VENDOR_A),
            axios.get(VENDOR_B),
            axios.get(VENDOR_C)
        ]);

        const result = [];

        a.data.forEach(p => {
            const harga = parseInt(p.hrg) || 0;
            result.push({
                id: p.kd_produk,
                name: p.nm_brg,
                price: Math.floor(harga * 0.9),
                stock_status: p.ket_stok,
                vendor: "A"
            });
        });

        b.data.forEach(p => {
            result.push({
                id: p.sku,
                name: p.productName,
                price: p.price || 0,
                stock_status: p.isAvailable ? "Tersedia" : "habis",
                vendor: "B"
            });
        });

        c.data.forEach(p => {
            let name = p.details?.name || "Unknown";
            if (p.details?.category === "Food") name += " (Recommended)";
            result.push({
                id: p.id.toString(),
                name,
                price: (p.pricing?.base_price || 0) + (p.pricing?.tax || 0),
                stock_status: p.stock > 0 ? "Tersedia" : "habis",
                vendor: "C"
            });
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data vendor" });
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Banyuwangi Marketplace - Integrator UAS Interopabilitas</h1>');
});

const port = process.env.PORT || 3310;
app.listen(port, () => {
    console.log('Integrator BERHASIL jalan!');
    console.log(`Buka di browser: http://localhost:3310/marketplace`);
});
