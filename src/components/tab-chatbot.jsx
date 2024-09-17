'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMardown from 'react-markdown'

export default function Chatbot() {
  // State untuk query dan hasil percakapan
  const [query, setQuery] = useState('') // Pertanyaan dari user
  const [conversations, setConversations] = useState([]) // Menyimpan percakapan sebagai array
  const [loading, setLoading] = useState(false)
  const chatContainerRef = useRef(null)

  // Scroll otomatis ke bagian bawah setelah percakapan diperbarui
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversations])

  // Function untuk mengirim query dan menerima hasil dari API RAG
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query) return

    // Tambahkan pertanyaan pengguna ke state percakapan
    setConversations((prevConversations) => [
      ...prevConversations,
      { type: 'user', text: query },
    ])

    setLoading(true)
    setQuery('') // Bersihkan input setelah query terkirim

    // Mengirim query ke API
    const response = await fetch('/api/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    // Tambahkan jawaban dari chatbot ke state percakapan
    setConversations((prevConversations) => [
      ...prevConversations,
      { type: 'bot', text: data.answer },
    ])

    setLoading(false)
  }

  return (
    <main className='p-4 mx-auto text-black/70'>
      <h1 className='mb-8 text-3xl font-bold text-center'>Chatbot RAG</h1>

      {/* Area Percakapan dengan scroll */}
      <div
        ref={chatContainerRef}
        className='max-h-screen p-4 mb-8 space-y-4 overflow-y-auto bg-gray-100 rounded-lg h-96'
      >
        {conversations.map((conversation, index) => (
          <div
            key={index}
            className={`flex ${
              conversation.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <p
              className={`p-4 rounded-lg max-w-md whitespace-pre-line ${
                conversation.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {conversation.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          className='w-full p-2 mb-4 text-black border border-gray-300 rounded'
          placeholder='Masukkan pertanyaan Anda...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type='submit'
          className={`w-full p-2 text-white rounded ${
            loading ? 'bg-blue-100' : 'bg-blue-500'
          }`}
          disabled={loading}
        >
          {loading ? 'Sedang memproses...' : 'Tanyakan'}
        </button>
      </form>
    </main>
  )
}
