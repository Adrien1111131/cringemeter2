import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { messages } = req.body;
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Notez: pas de préfixe VITE_
    });

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o-mini",
    });

    return res.status(200).json(completion.choices[0].message);
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: error.message });
  }
}
