'use client'
import { cleanToMarkdown } from '@/utils'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Tab1PreviewText() {
  const [inputText, setInputText] = useState('') // Untuk menyimpan input teks
  const [cleanedText, setCleanedText] = useState('') // Untuk menyimpan hasil teks yang dibersihkan

  // Fungsi untuk membersihkan teks saat input berubah
  const handleTextChange = (e) => {
    const newText = e.target.value
    setInputText(newText)
    setCleanedText(cleanToMarkdown(newText)) // Bersihkan teks secara langsung saat input berubah
  }

  // Fungsi untuk menyimpan hasil cleaned text
  const handleSave = async () => {
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cleanedText }), // Kirim cleanedText ke server
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message) // Notifikasi bahwa teks sudah disimpan
      } else {
        alert('Gagal menyimpan teks')
      }
    } catch (error) {
      alert(error.message || 'Terjadi kesalahan')
    }
  }

  return (
    <div className='grid grid-cols-2 gap-4 text-black/70'>
      {/* Kolom Pertama - Input Textarea */}
      <div>
        <h2 className='mb-4 text-2xl font-semibold'>Raw Text</h2>
        <textarea
          value={inputText}
          onChange={handleTextChange}
          className='w-full h-[500px] p-2 border border-gray-300 rounded'
          placeholder='Masukkan teks yang ingin dibersihkan...'
        />
      </div>

      {/* Kolom Kedua - Hasil Preview ReactMarkdown */}
      <div>
        <h2 className='mb-4 text-2xl font-semibold'>Cleaned Text</h2>
        <div className='h-[500px] p-4 overflow-auto bg-white border border-gray-300 rounded'>
          <ReactMarkdown>{cleanedText}</ReactMarkdown>
        </div>
      </div>

      {/* Tombol Save di bawah kedua kolom */}
      <div className='col-span-2'>
        <button
          onClick={handleSave}
          className='w-full p-2 mt-4 text-white rounded bg-cyan-600'
        >
          Save
        </button>
      </div>
    </div>
  )
}
