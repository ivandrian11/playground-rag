'use client'

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className='flex justify-center mb-8 space-x-4'>
      <button
        onClick={() => onTabChange(0)}
        className={`p-2 ${
          activeTab === 0
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-500'
        }`}
      >
        Cleaning Preview
      </button>
      <button
        onClick={() => onTabChange(1)}
        className={`p-2 ${
          activeTab === 1
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-500'
        }`}
      >
        Chunks Preview
      </button>
      <button
        onClick={() => onTabChange(2)}
        className={`p-2 ${
          activeTab === 2
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-500'
        }`}
      >
        Chatbot
      </button>
    </div>
  )
}
