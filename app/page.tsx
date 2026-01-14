'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'pt-BR'

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript
          setTranscript(text)
          processCommand(text)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Erro no reconhecimento:', event.error)
          setIsListening(false)
        }
      }

      synthRef.current = window.speechSynthesis
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setResponse('')
      setVideos([])
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      synthRef.current.speak(utterance)
    }
  }

  const processCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes('pesquisar') || lowerCommand.includes('buscar') || lowerCommand.includes('procurar') || lowerCommand.includes('encontrar')) {
      const searchTerm = command.replace(/pesquisar|buscar|procurar|encontrar/gi, '').trim()
      if (searchTerm) {
        await searchYouTube(searchTerm)
      } else {
        const msg = 'Por favor, diga o que você quer pesquisar no YouTube.'
        setResponse(msg)
        speak(msg)
      }
    } else if (lowerCommand.includes('vídeos') || lowerCommand.includes('videos') || lowerCommand.includes('sobre')) {
      await searchYouTube(command)
    } else {
      const msg = `Você disse: "${command}". Posso pesquisar vídeos no YouTube para você. Diga "pesquisar" seguido do tema que deseja.`
      setResponse(msg)
      speak(msg)
    }
  }

  const searchYouTube = async (query: string) => {
    try {
      const msg = `Pesquisando vídeos sobre ${query} no YouTube...`
      setResponse(msg)
      speak(msg)

      const res = await axios.get('/api/youtube', {
        params: { q: query }
      })

      if (res.data.items && res.data.items.length > 0) {
        setVideos(res.data.items)
        const count = res.data.items.length
        const resultMsg = `Encontrei ${count} vídeos sobre ${query}. Os resultados estão na tela.`
        setResponse(resultMsg)
        speak(resultMsg)
      } else {
        const noResultMsg = `Não encontrei vídeos sobre ${query}.`
        setResponse(noResultMsg)
        speak(noResultMsg)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      const errorMsg = 'Desculpe, ocorreu um erro ao pesquisar no YouTube.'
      setResponse(errorMsg)
      speak(errorMsg)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Agente de Voz YouTube
          </h1>
          <p className="text-gray-400 text-lg">
            Pesquise vídeos no YouTube usando sua voz
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                isListening
                  ? 'bg-red-600 animate-pulse shadow-2xl shadow-red-500/50'
                  : isSpeaking
                  ? 'bg-blue-600 shadow-2xl shadow-blue-500/50'
                  : 'bg-gradient-to-br from-red-500 to-red-700 hover:shadow-2xl hover:shadow-red-500/50'
              } ${isSpeaking ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isListening ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                )}
              </svg>
            </button>
            {isListening && (
              <div className="absolute -inset-4 border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
            )}
          </div>

          <p className="text-xl text-gray-300">
            {isSpeaking ? '🔊 Falando...' : isListening ? '🎤 Escutando...' : '🎙️ Clique para falar'}
          </p>

          {transcript && (
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <p className="text-sm text-gray-400 mb-2">Você disse:</p>
              <p className="text-lg text-white">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 rounded-lg p-6 w-full max-w-2xl border border-red-700">
              <p className="text-sm text-gray-400 mb-2">Resposta:</p>
              <p className="text-lg text-white">{response}</p>
            </div>
          )}

          {videos.length > 0 && (
            <div className="w-full max-w-6xl mt-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Resultados da Pesquisa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <a
                    key={video.id.videoId}
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all transform hover:scale-105"
                  >
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-white line-clamp-2 mb-2">
                        {video.snippet.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {video.snippet.channelTitle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-gray-500 text-sm max-w-2xl mt-8">
            <p className="mb-2">💡 Exemplos de comandos:</p>
            <p>"Pesquisar vídeos sobre programação"</p>
            <p>"Buscar tutoriais de JavaScript"</p>
            <p>"Encontrar música clássica"</p>
          </div>
        </div>
      </div>
    </main>
  )
}
