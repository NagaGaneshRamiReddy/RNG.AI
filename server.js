const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

app.get('/health', (req, res) => {
    return res.json({ ok: true, hasApiKey: Boolean(API_KEY) });
});

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body || {};
        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }
        if (!API_KEY) {
            return res.status(500).json({ error: 'Server missing GEMINI_API_KEY. Set it in .env and restart.' });
        }

        const payload = {
            contents: [
                { role: 'user', parts: [{ text: message }] }
            ]
        };

        const r = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000,
        });

        const data = r.data || {};
        const candidate = (data.candidates && data.candidates[0]) || {};
        const parts = (candidate.content && candidate.content.parts) || [];
        const text = parts.map(p => (p && p.text) ? p.text : '').join('') || 'Sorry, no response.';
        return res.json({ text });
    } catch (err) {
        const status = err?.response?.status || 500;
        const data = err?.response?.data;
        console.error('Chat error:', data || err.message);
        return res.status(status).json({ error: 'Upstream error', details: data || err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});


