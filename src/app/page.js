'use client'
import Tab3Chatbot from '@/components/tab-chatbot'
import TabNavigation from '@/components/tab-navigation'
import Tab2PreviewChunk from '@/components/tab-preview-chunk'
import Tab1PreviewText from '@/components/tab-preview-text'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)

  // Fungsi untuk mengubah tab
  const handleTabChange = (index) => {
    setActiveTab(index)
  }

  return (
    <main className='container p-8 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold text-center'>Playground RAG</h1>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className='p-4 bg-gray-100 rounded'>
        {activeTab === 0 && <Tab1PreviewText />}
        {activeTab === 1 && <Tab2PreviewChunk />}
        {activeTab === 2 && <Tab3Chatbot />}
      </div>
    </main>
  )
}
