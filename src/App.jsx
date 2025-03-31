import { motion } from 'framer-motion'
import { useState } from 'react'
import OpenAI from 'openai'
import characters from './characters'

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const [chatAnalysis, setChatAnalysis] = useState(null)
  const [botEndedChat, setBotEndedChat] = useState(false)
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)

  const analyzeChatConversation = async () => {
    setIsChatLoading(true)
    try {
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
      - L'équilibre entre confiance et humilité`

      const response = await fetch('/api/frontend-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatMessages, analysisPrompt }),
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

  // Fonction pour changer de personnage
  const handleCharacterChange = (charId) => {
    if (chatMessages.length > 0) {
      if (confirm("Changer de personnage réinitialisera la conversation. Continuer?")) {
        setSelectedCharacter(charId);
        setChatMessages([]);
        setChatEnded(false);
        setChatAnalysis(null);
        setBotEndedChat(false);
        setShowCharacterSelect(false);
      }
    } else {
      setSelectedCharacter(charId);
      setShowCharacterSelect(false);
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
        content: characters[selectedCharacter].prompt
      }

      const messages = [
        systemMessage,
        ...chatMessages,
        newMessage
      ]

      const response = await fetch('/api/frontend-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      const botResponseData = await response.json()
      const cleanResponse = botResponseData.content.replace('[FIN_CONVERSATION]', '')
      
      // Vérifier si la réponse contient le marqueur de fin de conversation
      const endConversation = botResponseData.content.includes('[FIN_CONVERSATION]')
      
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
            className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-[#FF8C42] to-[#FFDAB9] bg-clip-text text-transparent mb-4"
          >
            CringeMeter 🍑
          </motion.h1>

          {/* Bouton pour choisir le personnage */}
          <div className="mb-6 flex flex-col items-center">
            <button 
              className="mb-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 font-bold rounded-xl shadow-xl transition-all"
              onClick={() => setShowCharacterSelect(!showCharacterSelect)}
            >
              Choisis ton personnage
            </button>
            
            {showCharacterSelect && (
              <div className="w-full max-w-md">
                {characters.map((char) => (
                  <div 
                    key={char.id}
                    className={`p-3 mb-1 rounded-lg cursor-pointer flex justify-between items-center ${selectedCharacter === char.id ? 'bg-[#FFDAB9]/50' : 'bg-white/90'}`}
                    onClick={() => handleCharacterChange(char.id)}
                  >
                    <span className="font-bold">{char.name}</span>
                    <span className="text-gray-600">{char.personality}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  backgroundImage: `url('${characters[selectedCharacter].backgroundImage}')`
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
          <div className="space-y-4 mt-4">
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
