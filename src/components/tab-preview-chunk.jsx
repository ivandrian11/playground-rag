'use client' // Menggunakan Client-Side Rendering
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

// Konfigurasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY
const supabaseClient = createClient(supabaseUrl, supabaseKey)

// Konfigurasi Hugging Face
const hfApiKey = process.env.NEXT_PUBLIC_HUGGINGFACEHUB_API_KEY
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: hfApiKey,
  model: 'quarkss/indobert-base-p2-sts-arxiv-id',
})

export default function Tab2PreviewChunk() {
  const [chunkSize, setChunkSize] = useState(500)
  const [chunkOverlap, setChunkOverlap] = useState(100)
  const [chunks, setChunks] = useState([]) // Menyimpan hasil chunk
  const [processing, setProcessing] = useState(false) // State untuk loading tombol Proses
  const [uploading, setUploading] = useState(false) // State untuk loading tombol Kirim ke Supabase
  const [text, setText] = useState('')

  // Fungsi untuk memproses teks menjadi chunk
  const processText = async (text) => {
    setProcessing(true) // Mulai loading tombol Proses

    // Define the splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunkSize, // Menggunakan nilai chunkSize dari state
      chunkOverlap: chunkOverlap, // Menggunakan nilai chunkOverlap dari state
      separators: ['\n\n', '\n', ' ', ''], // Separator default
    })

    // Split the text into documents using createDocuments
    const splitDocs = await splitter.createDocuments([text])

    // Map hasil split ke state chunks
    const processedChunks = splitDocs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata, // Metadata disertakan dari dokumen
    }))

    setChunks(processedChunks) // Set chunks yang sudah diproses
    setProcessing(false) // Selesai loading tombol Proses
  }

  // Fungsi untuk memuat dan memproses file teks dari API route
  const loadAndProcessTextFile = async () => {
    try {
      const response = await fetch('/api/read') // Menggunakan API route untuk membaca file
      const data = await response.json()
      if (response.ok) {
        setText(data.text) // Set teks yang sudah dimuat
        await processText(data.text) // Proses teks setelah dimuat
      } else {
        console.error('Gagal memuat file:', data.error)
      }
    } catch (error) {
      console.error('Error fetching text file:', error)
    }
  }

  // useEffect untuk memuat file teks hanya sekali saat komponen dirender
  useEffect(() => {
    setProcessing(true)
    loadAndProcessTextFile() // Membaca file dan memproses teks secara otomatis sekali saat halaman pertama kali dimuat
  }, []) // Kosong berarti hanya dijalankan sekali

  // Fungsi untuk mengirim hasil chunk ke Supabase
  const handleSendToSupabase = async () => {
    if (chunks.length === 0) {
      alert('Tidak ada chunk yang tersedia untuk dikirim.')
      return
    }

    setUploading(true) // Mulai loading tombol Kirim ke Supabase

    for (const chunk of chunks) {
      try {
        const embedding = await embeddings.embedQuery(chunk.pageContent)

        await supabaseClient
          .from('documents') // Nama tabel di Supabase
          .insert([
            {
              content: chunk.pageContent,
              metadata: chunk.metadata, // Metadata yang sudah disertakan
              embedding: embedding, // Simpan embedding yang dihasilkan
            },
          ])

        console.log('Uploaded embedding to Supabase:', chunk.pageContent)
      } catch (error) {
        console.error('Error uploading to Supabase:', error)
      }
    }

    setUploading(false) // Selesai loading tombol Kirim ke Supabase
    alert('Hasil chunk berhasil dikirim ke Supabase!')
  }

  return (
    <main className='p-8 mx-auto text-black/70'>
      <h1 className='mb-8 text-4xl font-bold text-center'>Text Chunks</h1>

      {/* Input untuk chunkSize dan chunkOverlap serta tombol Proses */}
      <div className='flex mb-8 space-x-4'>
        <div>
          <label className='block text-gray-700'>Chunk Size</label>
          <input
            type='number'
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className='w-full p-2 border border-gray-300 rounded'
            disabled={processing || uploading} // Disable input jika sedang loading
          />
        </div>
        <div>
          <label className='block text-gray-700'>Chunk Overlap</label>
          <input
            type='number'
            value={chunkOverlap}
            onChange={(e) => setChunkOverlap(Number(e.target.value))}
            className='w-full p-2 border border-gray-300 rounded'
            disabled={processing || uploading} // Disable input jika sedang loading
          />
        </div>
        <button
          onClick={() => processText(text)} // Proses ulang teks sesuai chunkSize dan chunkOverlap
          className='self-end p-2 text-white bg-blue-500 rounded disabled:bg-blue-100'
          disabled={processing} // Disable button jika sedang loading
        >
          {'Proses'}
        </button>
      </div>

      {/* Tampilkan hasil chunk */}
      {processing ? (
        <p className='text-gray-600'>Memproses teks...</p>
      ) : (
        <>
          <ul className='space-y-6'>
            {chunks.map((chunk, index) => (
              <li
                key={index}
                className='p-6 bg-white border border-gray-200 rounded-lg shadow-md'
              >
                <div className='mb-2 text-lg font-semibold text-blue-600'>
                  Chunk {index + 1}:
                </div>
                <p className='leading-relaxed text-gray-700 whitespace-pre-line'>
                  {chunk.pageContent}
                </p>
              </li>
            ))}
          </ul>

          {/* Tombol untuk mengirim chunk ke Supabase */}
          <button
            onClick={handleSendToSupabase}
            className='w-full p-2 mt-6 text-white rounded bg-cyan-600'
            disabled={uploading} // Disable button jika sedang loading
          >
            {uploading ? 'Mengirim ke Supabase...' : 'Kirim ke Supabase'}
          </button>
        </>
      )}
    </main>
  )
}
