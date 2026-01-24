import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Quote className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QuoteMe</h1>
                <p className="text-gray-600 mb-8">
                    Get expert quotes for your project, deconstructed by AI.
                </p>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    Get Started
                </button>
            </motion.div>
        </div>
    )
}

export default App
