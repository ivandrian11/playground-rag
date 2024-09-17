import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const { cleanedText } = await req.json()

    // Tentukan path tempat file akan disimpan
    const outputFilePath = path.join(
      process.cwd(),
      'src/data',
      'example_cleaned.txt'
    )

    // Simpan teks ke file
    await fs.writeFile(outputFilePath, cleanedText, 'utf-8')

    return NextResponse.json({ message: 'Teks berhasil disimpan!' })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan teks' }, { status: 500 })
  }
}
