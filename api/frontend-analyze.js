import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { chatMessages, analysisPrompt } = req.body;
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: "gpt-4o-mini",
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Erreur analyse:', error);
    return res.status(500).json({ error: error.message });
  }
}
