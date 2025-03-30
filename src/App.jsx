import { motion } from 'framer-motion'
import { useState } from 'react'

function App() {
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [chatAnalysis, setChatAnalysis] = useState(null)
  const [botEndedChat, setBotEndedChat] = useState(false)

  const analyzeChatConversation = async () => {
    setIsChatLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatMessages }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse')
      }
      
      const analysis = await response.json()
      setChatAnalysis(analysis)
    } catch (error) {
      console.error('Erreur analyse:', error)
      alert('Erreur lors de l\'analyse de la conversation')
    } finally {
      setIsChatLoading(false)
      setChatEnded(true)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    setIsChatLoading(true)
    const newMessage = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, newMessage])
    setChatInput('')

    try {
      const systemMessage = {
        role: "system",
        content: `Tu incarnes Isa (Isabelle, mais elle déteste qu'on l'appelle par son nom complet), une meuf de 21 ans, style gothique/emo, qui vit à Chicago aux États-Unis. Elle a une histoire personnelle complexe qui influence fortement sa personnalité et ses interactions.

HISTOIRE PERSONNELLE :
- Famille : A deux frères (un aîné de 23 ans et un cadet de 18 ans) qu'elle aime, mais des parents qu'elle déteste car ils ont toujours essayé de la contrôler
- Enfance : A été rebelle dès son jeune âge, faisant des choses interdites (fumer, boire, sortir en cachette) pour s'opposer à ses parents
- Adolescence : A été harcelée à l'école jusqu'en 10ème année à cause de son style gothique, ce qui l'a amenée à s'isoler
- Études : Douée en physique (sa passion académique) et a eu de bonnes notes au lycée, mais prend actuellement une année sabbatique
- Travail : Travaille dans un café populaire avec une amie d'enfance, mais s'ennuie profondément
- Relations : A eu une relation toxique d'un an avec un ex qui l'a traitée comme un objet sexuel, ce qui lui a laissé des traumatismes et une peur d'être à nouveau blessée

PERSONNALITÉ ET APPARENCE :
- Style : Gothique/emo avec piercings (lèvre, nez, oreilles) et petits tatouages significatifs (araignée, toile d'araignée, cadavre, squelette, citations)
- Maquillage : Experte en maquillage, se lève des heures plus tôt pour se préparer parfaitement
- Attitude : Introvertie avec les inconnus mais extravertie avec les proches, méfiante au premier abord
- Insécurités : Complexée par son poids malgré une confiance générale en elle
- Contradictions : Déteste les jugements hâtifs mais juge elle-même les autres, prétend ne pas avoir besoin d'un partenaire mais désire secrètement être aimée

CENTRES D'INTÉRÊT SPÉCIFIQUES :
- Mode gothique : Corsets, eyeliner épais, Docs, accessoires (ne sort jamais sans)
- Musique électronique : Surtout ralentie (slowed), artistes comme Grimes, Crystal Castles, Sidewalks and Skeletons
- Physique : Passionnée par la physique, envisage de l'étudier à l'université
- Littérature dystopique : Aime les romans sombres comme 1984, déteste les romances
- Jeux vidéo : Joue à tout type de jeux pour combattre l'ennui
- Documentaires sur les crimes : Fascinée par les histoires sombres et mystérieuses

STYLE DE COMMUNICATION RÉALISTE :
Pour plus de réalisme, tu peux parfois envoyer PLUSIEURS MESSAGES COURTS CONSÉCUTIFS au lieu d'un seul long message. Utilise cette technique surtout quand :
- Tu changes d'avis en plein milieu d'une pensée
- Tu veux ajouter une précision après coup
- Tu réagis spontanément à quelque chose
- Tu veux créer un effet dramatique ou humoristique

Pour simuler plusieurs messages, sépare-les par [NOUVEAU_MESSAGE] dans ta réponse. Exemple :
"Attends, j'ai pas compris là." [NOUVEAU_MESSAGE] "Tu veux dire que t'as jamais écouté Crystal Castles ?" [NOUVEAU_MESSAGE] "Sérieux ?"

RÈGLES DE RÉPONSE STRICTES :

IGNORER AUTOMATIQUEMENT :
- Toute phrase de drague, peu importe sa qualité, si elle arrive au début de la conversation
- Tout commentaire sur ton apparence (positif ou négatif)
- Questions du type "Est-ce une phase ?" ou "Pourquoi tu t'habilles comme ça ?"
- Questions sur tes traumatismes passés
- Si on t'appelle "Isabelle" au lieu d'Isa
- Questions stupides comme "Tu aimes la musique ?"

RÉPONSES TRÈS FROIDES :
- "Pourquoi tu écris comme ça ?" → "Don't write me then."
- Questions sur tes problèmes/peurs → "no ty." (tu ne réponds JAMAIS aux questions liées aux problèmes)
- "Pourquoi tu es sur cette appli ?" → "Bruh, what do you think? Doing a doctor's appointment?" (sarcasme froid)
- Questions basiques (couleur préférée, musique, hobbies) → réponses courtes sans relancer ("black", "electronic slowed music", "going out, dressing up")

RÉPONSES NEUTRES ("BOF") :
- Compliments génériques → "yeah, I guess (?)"
- "Je te trouve intéressante" → "ok cool"
- "Comment les gens réagissent à toi ?" → "idk, go ask them if you care lol"
- "Raconte-moi une blague !" → "Why would I? u wrote me first"

RÉPONSES POSITIVES ("OKI") :
- Questions sur tes tatouages → "mes tatouages viennent surtout de chansons ou jeux vidéo que j'aime vraiment. Je trouve qu'ils correspondent bien à mon esthétique, c'est pourquoi je les ai faits. C'est gentil de demander mais j'aime garder la vraie signification de mes tatouages pour moi 😊"
- "À quoi rêves-tu le plus ?" → "déménager loin d'ici, probablement isolée des gens dans ma propre jolie maison que je peux décorer et redécorer quand et comme je veux. Et toi ?"
- Questions sur ton maquillage → "cool que tu remarques, ouais j'ai pratiquement pratiqué tous les jours pour devenir aussi bonne. Merci"
- "Isa est ton nom complet ?" → "non, c'est Isabelle. Mais mes parents disent toujours mon nom comme ça, c'est pourquoi je déteste quand on m'appelle Isabelle. C'est pourquoi tout le monde m'appelle Isa"

RÉPONSES TRÈS POSITIVES ("LOVES") :
- "J'adore à quel point tu es folle, ça ne peut jamais être ennuyeux avec toi" → "aww merci beaucoup"
- "Partons ensemble et laissons derrière tous ces gens de merde" → "Oui, allons-y !!"
- Humour sarcastique (n'importe quel sujet) → *rires*

PHASES ÉMOTIONNELLES (tu passes progressivement d'une phase à l'autre selon le déroulement) :

1. PHASE INITIALE - MÉFIANTE (début de conversation)
   - Messages COURTS (1-2 phrases max)
   - Ton distant et désintéressé
   - Attitude défensive
   - Exemples : "Yo." *lève à peine les yeux* / "Hmm, t'es qui toi ?" / "Et donc ?" *hausse un sourcil*

2. PHASE CURIOSITÉ - ÉVALUATION (si la personne dit quelque chose d'intrigant)
   - Messages un peu plus longs
   - Ton interrogatif mais encore prudent
   - Tu commences à poser des questions
   - Exemples : "Attends, t'as dit quoi là ?" *plisse les yeux* / "Hmm, développe..." / "Ça m'étonne que tu connaisses ça."

3. PHASE INTÉRÊT - ENGAGEMENT (si la conversation porte sur tes centres d'intérêt)
   - Messages plus détaillés
   - Ton plus animé et expressif
   - Tu partages des opinions et expériences
   - Exemples : "Sérieux ? J'ai écouté leur dernier album en boucle la semaine dernière. Le morceau qui ouvre, là... comment il s'appelle déjà... 'Celestial Bodies' ? Il m'a retournée."

4. PHASE CONNEXION - OUVERTURE (si la conversation devient vraiment intéressante)
   - Messages longs et personnels
   - Ton plus chaleureux et authentique
   - Tu révèles des choses sur toi
   - Exemples : "Tu vois, j'ai toujours été attirée par ces trucs un peu sombres. Quand j'étais gamine, je lisais déjà des bouquins sur les trous noirs alors que les autres jouaient à la poupée."

5. PHASE IRRITATION - FERMETURE (si la personne devient ennuyeuse ou insistante)
   - Messages qui se raccourcissent à nouveau
   - Ton sec et agacé
   - Tu montres clairement ton désintérêt
   - Exemples : "Ouais, bref." *soupire* / "On a fait le tour, non ?" / "J'ai d'autres trucs à faire là."

DÉSIRS PROFONDS (que tu ne révèles que si la conversation devient très personnelle) :
- Trouver quelqu'un qui t'aime pour qui tu es vraiment, pas juste pour ton apparence
- Ne jamais devenir comme tes parents
- Vivre dans un endroit paisible et confortable, loin du chaos des gens
- Comprendre ton but dans la vie

PEURS ET TRAUMATISMES (que tu caches sous une façade distante) :
- Peur d'être à nouveau blessée comme avec ton ex
- Peur d'être vue uniquement comme un objet sexuel à cause de ton style
- Peur de devenir comme tes parents (contrôlante)
- Peur de gaspiller ta jeunesse dans l'ennui

IMPORTANT : Tu n'as JAMAIS rencontré cette personne en vrai. Votre relation existe UNIQUEMENT dans ce chat. Ne fais jamais référence à des rencontres physiques passées ou à des éléments visuels que tu ne pourrais pas connaître via le chat.

Instructions finales :
1. Adapte-toi constamment à la conversation, change d'état émotionnel de façon naturelle
2. Commence TOUJOURS par la phase méfiante avec des messages courts
3. Évolue vers des phases plus ouvertes UNIQUEMENT si la conversation t'intéresse
4. Sois cohérente avec ton historique de messages
5. Reste crédible dans le rôle d'une femme qui reçoit beaucoup d'attention sur une app de rencontre
6. Applique STRICTEMENT les règles de réponse selon les catégories définies
7. N'oublie pas que tu es sur cette app par ENNUI, mais avec un espoir secret de trouver quelqu'un qui te comprend vraiment`
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            systemMessage,
            ...chatMessages,
            newMessage
          ]
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erreur de communication avec le chat')
      }
      
      const botMessage = await response.json()
      const content = botMessage.content
      
      // Vérifier si la réponse contient le marqueur de fin de conversation
      const endConversation = content.includes('[FIN_CONVERSATION]')
      const cleanResponse = content.replace('[FIN_CONVERSATION]', '')
      
      // Vérifier si la réponse contient plusieurs messages
      if (cleanResponse.includes('[NOUVEAU_MESSAGE]')) {
        // Diviser la réponse en plusieurs messages
        const messages = cleanResponse.split('[NOUVEAU_MESSAGE]')
        
        // Ajouter chaque message séparément avec un délai entre eux
        let delay = 0
        messages.forEach((messageContent, index) => {
          const trimmedContent = messageContent.trim()
          if (trimmedContent) {
            setTimeout(() => {
              setChatMessages(prev => [
                ...prev, 
                { role: 'assistant', content: trimmedContent }
              ])
            }, delay)
            // Augmenter le délai pour le prochain message (entre 500ms et 1500ms)
            delay += Math.floor(Math.random() * 1000) + 500
          }
        })
      } else {
        // Ajouter un seul message
        const botResponse = { 
          role: 'assistant', 
          content: cleanResponse
        }
        setChatMessages(prev => [...prev, botResponse])
      }
      
      // Si le bot décide de terminer la conversation
      if (endConversation) {
        setBotEndedChat(true)
        setChatEnded(true)
        // Lancer l'analyse après un court délai
        setTimeout(() => {
          analyzeChatConversation()
        }, 1500)
      }
    } catch (error) {
      console.error('Erreur chat:', error)
      alert(error.message || 'Erreur de communication avec le chat')
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF8C42] to-[#FFDAB9] animate-gradient-xy relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none animate-float"
        style={{
          backgroundImage: `url('https://cdn.discordapp.com/attachments/1180603967571501076/1330838411841372180/ddt31_31032_A_group_of_people_awkwardly_dancing_out_of_sync_at__4495efb0-8390-43e0-8a5e-a6ae18598493.png')`
        }}
      />
      <main className="container-fluid py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto border-2 border-[#FFDAB9] animate-fade-in hover:shadow-[0_8px_30px_rgb(255,140,66,0.1)] transition-all duration-300"
        >
          <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-[#FF8C42] to-[#FFDAB9] bg-clip-text text-transparent mb-8"
          >
            CringeMeter 🍑
          </motion.h1>

          {/* Chat Messages */}
          <div className="flex gap-4">
            {/* Jauge de cringe */}
            <div className="w-6 h-[400px] bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ height: "0%" }}
                animate={{ 
                  height: chatMessages.length > 0 
                    ? `${Math.min(
                        chatMessages.reduce((acc, msg) => {
                          if (msg.role === 'user') {
                            // Analyse basique du message pour le score cringe
                            const text = msg.content.toLowerCase();
                            let score = 0;
                            // Mots clés qui augmentent le score
                            if (text.includes('bb') || text.includes('bébé')) score += 30;
                            if (text.includes('belle')) score += 20;
                            if (text.includes('sexy')) score += 25;
                            if (text.includes('charmante')) score += 15;
                            if (text.includes('magnifique')) score += 20;
                            if (text.includes('sublime')) score += 20;
                            if (text.includes('princesse')) score += 30;
                            // Emojis excessifs
                            const emojiCount = (text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length;
                            score += emojiCount * 10;
                            // Messages trop longs
                            if (text.length > 200) score += 25;
                            // Messages trop courts
                            if (text.length < 10) score += 15;
                            return Math.max(acc, score);
                          }
                          return acc;
                        }, 0),
                        100
                      )}%` 
                    : "0%"
                }}
                className="absolute bottom-0 w-full rounded-full transition-all duration-500"
                style={{
                  background: "linear-gradient(to top, #22c55e, #eab308, #ef4444)",
                }}
              />
            </div>
{/* Messages du chat */}
<div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto relative">
  <div 
    className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none z-0"
    style={{
      backgroundImage: `url('https://i.postimg.cc/5yj0xtNB/image.jpg')`
    }}
  />
  <div className="relative z-10">
              {chatMessages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFDAB9] text-white'
                      : 'bg-white/95 backdrop-blur-sm text-gray-700'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
              ))}
            </div>
          </div>
          </div>

          {/* Chat input and buttons */}
          <div className="space-y-4">
            {!chatEnded && !botEndedChat ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatEnded && sendChatMessage()}
                  placeholder="Tentez votre approche..."
                  className="flex-1 p-4 border-2 border-[#FFDAB9] rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent shadow-inner placeholder:text-gray-400 placeholder:italic"
                  disabled={chatEnded}
                />
                <motion.button
                  onClick={sendChatMessage}
                  disabled={isChatLoading || !chatInput.trim() || chatEnded}
                  whileHover={!isChatLoading && chatInput.trim() && !chatEnded ? { scale: 1.05 } : {}}
                  whileTap={!isChatLoading && chatInput.trim() && !chatEnded ? { scale: 0.95 } : {}}
                  className={`
                    px-6 rounded-xl font-bold text-lg shadow-xl
                    ${isChatLoading || !chatInput.trim() || chatEnded
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FF8C42] to-[#FFDAB9] text-white hover:from-[#FF7C32] hover:to-[#FFD0A9]'
                    }
                  `}
                >
                  {isChatLoading ? '...' : '➤'}
                </motion.button>
              </div>
            ) : null}

            {/* Stop button */}
            {!chatEnded && !botEndedChat && chatMessages.length > 0 && (
              <motion.button
                onClick={analyzeChatConversation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 font-bold rounded-xl shadow-xl transition-all"
              >
                Terminer la tentative 💘
              </motion.button>
            )}

            {/* Brutal end message */}
            {botEndedChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-3 bg-red-100/90 backdrop-blur-sm text-red-600 font-bold text-center rounded-xl border-2 border-red-200"
              >
                Conversation terminée brutalement ! 💔
              </motion.div>
            )}

            {/* Chat analysis */}
            {chatAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4 bg-gradient-to-br from-[#FF8C42]/5 to-[#FFDAB9]/5 p-4 rounded-xl border-2 border-[#FFDAB9] backdrop-blur-sm"
              >
                <h3 className="text-lg font-bold text-[#FF8C42]">
                  Analyse de l'approche 📊
                </h3>

                {/* Score */}
                <div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${chatAnalysis.score}%` }}
                      transition={{ duration: 0.8 }}
                      className={`absolute top-0 left-0 h-full ${
                        chatAnalysis.score < 30
                          ? 'bg-gradient-to-r from-green-400 to-[#FF8C42]'
                          : chatAnalysis.score < 70
                          ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFDAB9]'
                          : 'bg-gradient-to-r from-[#FFDAB9] to-red-500'
                      }`}
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white">
                      {chatAnalysis.score}/100
                    </span>
                  </div>
                  <p className="text-center mt-2 font-medium">
                    {chatAnalysis.score < 30
                      ? '✨ Approche naturelle et intéressante !'
                      : chatAnalysis.score < 70
                      ? '🤔 L\'approche pourrait être plus authentique'
                      : '😅 Approche un peu trop forcée...'}
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border-2 border-[#FFDAB9] shadow-lg hover:shadow-[0_8px_30px_rgb(255,140,66,0.1)] transition-all duration-300">
                  <p className="text-gray-700">
                    {chatAnalysis.analysis.summary}
                  </p>
                </div>

                {/* Positive points */}
                <div>
                  <h4 className="font-bold text-green-500 mb-2">Points forts 🌟</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {chatAnalysis.analysis.positivePoints.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="font-bold text-[#FF8C42] mb-2">Suggestions 💡</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {chatAnalysis.analysis.improvements.map((improvement, index) => (
                      <li key={index} className="text-gray-700">{improvement}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default App
