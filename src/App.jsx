import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
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
  const [endReason, setEndReason] = useState(null) // 'normal', 'boring', 'inappropriate'
  const [showHeartBreakAnimation, setShowHeartBreakAnimation] = useState(false)
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
      // Nettoyer la réponse et vérifier les marqueurs de fin
      let cleanResponse = botResponseData.content
      let endConversation = false
      let endReasonType = 'normal'
      
      // Vérifier si la réponse contient le marqueur de conversation ennuyeuse
      if (cleanResponse.includes('[CONVERSATION_ENNUYEUSE][FIN_CONVERSATION]')) {
        cleanResponse = cleanResponse.replace('[CONVERSATION_ENNUYEUSE][FIN_CONVERSATION]', '')
        endConversation = true
        endReasonType = 'boring'
      } 
      // Vérifier si la réponse contient le marqueur de conversation déplacée
      else if (cleanResponse.includes('[CONVERSATION_DEPLACEE][FIN_CONVERSATION]')) {
        cleanResponse = cleanResponse.replace('[CONVERSATION_DEPLACEE][FIN_CONVERSATION]', '')
        endConversation = true
        endReasonType = 'inappropriate'
      }
      // Vérifier si la réponse contient le marqueur standard de fin de conversation
      else if (cleanResponse.includes('[FIN_CONVERSATION]')) {
        cleanResponse = cleanResponse.replace('[FIN_CONVERSATION]', '')
        endConversation = true
      }
      
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
        setEndReason(endReasonType)
        
        // Afficher l'animation des cœurs brisés
        setShowHeartBreakAnimation(true)
        
        // Lancer l'analyse après un court délai
        setTimeout(() => {
          analyzeChatConversation()
        }, 3000) // Délai plus long pour laisser l'animation se jouer
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
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-20 pointer-events-none animate-float"
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
            <div className="flex-1 relative">
              {/* Image d'arrière-plan fixe */}
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-25 pointer-events-none z-0 bg-fixed"
                style={{
                  backgroundImage: `url('${characters[selectedCharacter].backgroundImage}')`
                }}
              />
              {/* Conteneur de défilement */}
              <div className="max-h-[400px] overflow-y-auto relative">
                <div className="space-y-4 relative z-10">
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

            {/* Animation des cœurs brisés */}
            <AnimatePresence>
              {showHeartBreakAnimation && (
                <motion.div
                  className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-4xl"
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        scale: 0,
                        rotate: Math.random() * 180 - 90
                      }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 400, 
                        y: (Math.random() - 0.5) * 400,
                        scale: [0, 1.5, 0],
                        rotate: [Math.random() * 180 - 90, Math.random() * 360 - 180]
                      }}
                      transition={{ 
                        duration: 2,
                        ease: "easeOut",
                        times: [0, 0.3, 1],
                        delay: Math.random() * 0.5
                      }}
                    >
                      💔
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Brutal end message */}
            {botEndedChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full py-3 backdrop-blur-sm font-bold text-center rounded-xl border-2 ${
                  endReason === 'boring' 
                    ? 'bg-blue-100/90 text-blue-600 border-blue-200' 
                    : endReason === 'inappropriate' 
                      ? 'bg-purple-100/90 text-purple-600 border-purple-200'
                      : 'bg-red-100/90 text-red-600 border-red-200'
                }`}
              >
                {endReason === 'boring' 
                  ? 'Conversation trop ennuyeuse... 😴💔' 
                  : endReason === 'inappropriate' 
                    ? 'Conversation inappropriée ! 🚫💔'
                    : 'Conversation terminée brutalement ! 💔'}
              </motion.div>
            )}

            {/* Chat analysis section removed */}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default App
