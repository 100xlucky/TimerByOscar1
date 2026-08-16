const express = require('express');
const path = require('path');
const app = express();

// Public klasöründeki dosyaları dışarı sunar
app.use(express.static(path.join(__dirname, 'public')));

// Herhangi bir adrese girildiğinde direkt index.html'i açar
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
