'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateQuizPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(false)

    const handleCreateQuiz = async () => {
        const token = localStorage.getItem('access_token')

        const response = await fetch('http://127.0.0.1:8000/api/v1/quizzes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                is_public: isPublic
            })
        })

        if (response.ok) {
            alert('Tạo quiz thành công')
            // THÊM DÒNG NÀY ĐỂ TỰ ĐỘNG CHUYỂN HƯỚNG VỀ DANH SÁCH
            router.push('/quizzes')
        } else {
            alert('Lỗi khi tạo quiz')
        }
    }

    return (
        <div className="p-10 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-5">Tạo Quiz</h1>
            <input
                className="border p-3 w-full mb-4 rounded"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="border p-3 w-full mb-4 rounded"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <label className="flex items-center gap-2 mb-5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                />
                Public Quiz
            </label>
            <button
                onClick={handleCreateQuiz}
                className="bg-black text-white px-5 py-3 rounded hover:bg-gray-800 transition"
            >
                Tạo Quiz
            </button>
        </div>
    )
}