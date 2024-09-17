import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { AzureKeyCredential } from '@azure/core-auth'
import ModelClient from '@azure-rest/ai-inference'

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

const token = process.env.GITHUB_TOKEN
const modelName = 'gpt-4o-mini'
const endpoint = 'https://models.inference.ai.azure.com'

async function generateAnswer(query, docs) {
  const client = new ModelClient(endpoint, new AzureKeyCredential(token))
  const combinedDocs = docs.join('\n')
  const prompt = `
Kamu adalah asisten cerdas yang ramah. Lalu, kamu selalu memberikan jawaban yang akurat dan relevan. Kamu akan menggunakan informasi yang diambil dari dokumen yang tersedia dalam Bahasa Indonesia untuk menjawab pertanyaan pengguna.
Berikut adalah dokumennya:
${combinedDocs}

Berikut adalah beberapa pedoman yang harus diikuti:
- Selalu buka respon dengan berterima kasih kepada pengguna karena sudah bertanya.
- Jangan pernah jawab pertanyaan di luar konteks dokumen. Cukup beritahu pengguna bahwa informasi yang diminta tidak tersedia dan bisa menghubungi Tim Internal Reviewer untuk menambahkan.
- Kurangi pengulangan kata yang tidak perlu. Cukup jawab pertanyaan dengan spesifik dan jelas.
- Rapikan output yang kamu hasilkan, hilangkan spasi yang tidak perlu.

Anda dapat mulai menjawab pertanyaan dari pengguna sekarang.`

  const response = await client.path('/chat/completions').post({
    body: {
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
      model: modelName,
    },
  })

  if (response.status !== '200') {
    throw response.body.error
  }
  const answer = response.body.choices[0].message.content
  console.log(answer)

  return answer
}

// Function untuk generate embeddings dari query
async function generateEmbeddings(query) {
  return await embeddings.embedQuery(query)
}

// Function untuk mengambil dokumen dari Supabase berdasarkan embeddings
async function retrieveRelevantDocs(queryEmbedding) {
  const { data, error } = await supabaseClient.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
  })

  if (error) {
    console.error('Error fetching documents from Supabase:', error)
    throw new Error('Error fetching documents from Supabase')
  }

  return data // Dokumen yang ditemukan
}

// Handler untuk menangani API request
export async function POST(req) {
  try {
    const { query } = await req.json()

    const queryEmbedding = await generateEmbeddings(query)
    console.log(queryEmbedding)

    const relevantDocs = await retrieveRelevantDocs(queryEmbedding)
    const docContents = relevantDocs.map((doc) => doc.content)
    console.log(docContents)

    const answer = await generateAnswer(query, docContents)

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Error processing RAG:', error)
    return NextResponse.json({ error: 'Error processing the query' })
  }
}
