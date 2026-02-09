const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Fix DNS server issue found in Node 24
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare or Google DNS   

//Connect Database
connectDB();
app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
