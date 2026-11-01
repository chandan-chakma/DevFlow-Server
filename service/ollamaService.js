const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

const generateAIResponse = async (prompt) => {
    try {
        const isLocalOllama =
            OLLAMA_URL.startsWith('http://localhost:') ||
            OLLAMA_URL.startsWith('http://127.0.0.1:');
        const ollamaAuthToken = process.env.OLLAMA_AUTH_TOKEN;

        if (!isLocalOllama && !OLLAMA_URL.startsWith('https://')) {
            throw new Error('Remote Ollama URLs must use HTTPS');
        }

        if (!isLocalOllama && !ollamaAuthToken) {
            throw new Error('OLLAMA_AUTH_TOKEN is required for remote Ollama URLs');
        }

        const response = await axios.post(
            OLLAMA_URL,
            {
                model: 'qwen2.5:3b',
                prompt: prompt,
                stream: false
            },
            ollamaAuthToken
                ? { headers: { Authorization: `Bearer ${ollamaAuthToken}` } }
                : undefined
        );

        return response.data.response;

    } catch (error) {
        console.error('AI provider error:', error.message);
        throw new Error('Failed to generate AI response');
    }
};

module.exports = { generateAIResponse };