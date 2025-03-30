import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { chatMessages } = req.body;
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const analysisPrompt = `Analyse cette tentative de séduction : 
    ${chatMessages.map(msg => `${msg.role === 'user' ? 'Séducteur' : 'Personne ciblée'}: ${msg.content}`).join('\n')}

    Évalue l'approche selon les critères suivants et fournis une réponse au format JSON :
    {
      "score": (nombre de 0 à 100, où 0 est très naturel et 100 est très cringe),
      "analysis": {
        "positivePoints": ["points forts de l'approche"],
        "improvements": ["suggestions pour une approche plus authentique"],
        "summary": "résumé de l'analyse de la tentative de séduction"
      }
    }

    Concentre-toi sur :
    - L'authenticité de l'approche
    - Le niveau de malaise créé
    - Le respect et la compréhension des signaux
    - La capacité à maintenir une conversation intéressante
    - L'équilibre entre confiance et humilité`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: "gpt-4",
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Erreur analyse:', error);
    return res.status(500).json({ error: error.message });
  }
}
