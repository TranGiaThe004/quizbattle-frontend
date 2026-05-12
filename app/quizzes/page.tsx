'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useRouter } from 'next/navigation'

export default function QuizzesPage() {
    const router = useRouter()
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [quizToDelete, setQuizToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchQuizzes = async () => {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://127.0.0.1:8000/api/v1/quizzes', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (Array.isArray(data)) setQuizzes(data)
        else if (data && data.data) setQuizzes(data.data) // Đề phòng API bọc trong object data
    }

    useEffect(() => { fetchQuizzes() }, [])

    const handleDelete = async () => {
        if (!quizToDelete) return
        setIsDeleting(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`http://127.0.0.1:8000/api/v1/quizzes/${quizToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                setQuizzes(quizzes.filter(q => q.id !== quizToDelete))
                setQuizToDelete(null)
            } else {
                alert("Lỗi: Bạn không có quyền xóa!")
            }
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="p-10 max-w-4xl mx-auto pt-24">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-3xl font-bold">Danh sách Quiz</h1>
                <button onClick={() => router.push('/quizzes/create')} className="bg-black text-white px-4 py-2 rounded">+ Tạo Quiz mới</button>
            </div>
            <div className="grid gap-5">
                {quizzes.map((quiz: any) => (
                    <div key={quiz.id} className="border p-5 rounded flex justify-between items-center hover:border-gray-400 transition">
                        {/* THẺ LINK ĐỂ BẤM CHUYỂN SANG TRANG CHI TIẾT */}
                        <Link href={`/quizzes/${quiz.id}`} className="flex-1 cursor-pointer">
                            <h2 className="text-xl font-bold text-blue-600 hover:underline">{quiz.title}</h2>
                            <p className="text-gray-600">{quiz.description}</p>
                        </Link>
                        <div className="flex gap-2">
                            {/* NÚT GỌI MODAL XÓA */}
                            <button onClick={() => setQuizToDelete(quiz.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
            {/* NHÚNG MODAL CỦA LEADER */}
            <ConfirmModal 
                isOpen={quizToDelete !== null} title="Xóa bộ Quiz?" message="Bạn có chắc chắn muốn xóa bộ quiz này?"
                onConfirm={handleDelete} onCancel={() => setQuizToDelete(null)} isLoading={isDeleting}
            />
        </div>
    )
}