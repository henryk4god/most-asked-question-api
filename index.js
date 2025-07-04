require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter API endpoint
app.post('/api/most-asked-questions', async (req, res) => {
    const { niche } = req.body;

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "deepseek/deepseek-chat:free",
                messages: [
                    {
                        role: "user",
                        content: buildPrompt(niche)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': req.headers.referer || 'https://henryk4god.github.io/most-asked-questions-widget/',
                    'X-Title': 'Most Asked Questions Widget'
                }
            }
        );

        res.json({ success: true, data: response.data.choices[0].message.content });
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data?.error?.message || 'Failed to fetch questions' 
        });
    }
});

function buildPrompt(niche) {
    return `Generate 10 of the most frequently asked online questions ${niche ? `specifically in the ${niche} niche` : `across diverse niches`}, focusing on trending topics not older than six months with proven market demand indicated by active paid advertising campaigns. For each question, propose a scalable product idea that addresses the underlying problem or need, ensuring the solution can be monetized as either a digital product, physical item, or SaaS platform. Format each entry as:
    
    Question: [The question]
    Niche: [The niche/category]
    Product Idea: [The product solution]
    Monetization: [How it can be monetized]`;
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
