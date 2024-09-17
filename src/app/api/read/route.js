import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// API route untuk membaca file teks menggunakan fs di server-side
export async function GET() {
  try {
    // Path ke file teks yang ingin dibaca
    const textFilePath = path.join(
      process.cwd(),
      'src/data',
      'example_cleaned.txt'
    )

    // Membaca file teks
    const text = await fs.readFile(textFilePath, 'utf-8')

    // Mengembalikan hasil pembacaan sebagai respons JSON
    return NextResponse.json({ text })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membaca file' }, { status: 500 })
  }
}
