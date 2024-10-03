const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let variants = [
    { id: 1, text: "Вариант 1", votes: 0 },
    { id: 2, text: "Вариант 2", votes: 0 },
    { id: 3, text: "Вариант 3", votes: 0 },
];

let statFile = path.join(__dirname, 'public', 'stat.json');

app.get('/variants', (req, res) => {
    res.json(variants);
});

app.post('/vote', (req, res) => {
    const { variantId } = req.body;
    const variant = variants.find(variant => variant.id === variantId);
    if (variant) {
        variant.votes += 1;
        res.status(200).send('Vote counted');
    } else {
        res.status(400).send('Variant not found');
    }

    fs.writeFile(statFile, JSON.stringify(variants), (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
    });

});

app.post('/stat', (req, res) => {
    const stats = variants.map(variant => ({ id: variant.id, count: variant.votes }));
    res.json(stats);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});