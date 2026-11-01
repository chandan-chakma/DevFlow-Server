const axios = require('axios');
const express = require('express');
const crypto = require('crypto');

const app = express();
const port = Number(process.env.OLLAMA_PROXY_PORT || 11435);
const authToken = process.env.OLLAMA_AUTH_TOKEN;

if (!authToken || Buffer.byteLength(authToken) < 32) {
    throw new Error('OLLAMA_AUTH_TOKEN must be set to a secret of at least 32 bytes');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.post('/api/generate', async (req, res) => {
    const providedToken = req.get('authorization') || '';
    const expectedToken = `Bearer ${authToken}`;
    const providedBuffer = Buffer.from(providedToken);
    const expectedBuffer = Buffer.from(expectedToken);

    if (
        providedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const response = await axios.post(
            'http://127.0.0.1:11434/api/generate',
            req.body
        );

        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Local Ollama request failed:', error.message);
        return res.status(502).json({ error: 'Local Ollama is unavailable' });
    }
});

app.listen(port, '127.0.0.1', () => {
    console.log(`Authenticated Ollama proxy listening on 127.0.0.1:${port}`);
});
