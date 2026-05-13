'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // [ĐÃ THÊM]

export default function CreateQuizPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(false)
    const router = useRouter() // [ĐÃ THÊM] Khởi tạo router

    const handleCreateQuiz = async () => {
        const token = localStorage.getItem('access_token')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

        const response = await fetch(`${apiUrl}/api/v1/quizzes`, {
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
            alert('Tạo quiz thành công!')
            router.push('/quizzes') // [ĐÃ THÊM] Chuyển hướng về danh sách
        } else {
            alert('Có lỗi xảy ra khi tạo!')
        }
    }

    return (
        <div className="p-10 max-w-xl mx-auto pt-24">
            <h1 className="text-3xl font-bold mb-5">Tạo Quiz Mới</h1>

            <input
                className="border p-3 w-full mb-4 rounded"
                placeholder="Tiêu đề (Ví dụ: Lịch sử Việt Nam)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                className="border p-3 w-full mb-4 rounded min-h-[100px]"
                placeholder="Mô tả bộ câu hỏi..."
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
                <span className="font-medium">Công khai (Public Quiz)</span>
            </label>

            <button
                onClick={handleCreateQuiz}
                className="bg-black hover:bg-gray-800 text-white px-5 py-3 rounded font-bold w-full transition-all"
            >
                LƯU BỘ CÂU HỎI
            </button>
        </div>
    )
}