'use client'

import { useState } from 'react'

export default function CreateQuizPage() {

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(false)

    const handleCreateQuiz = async () => {

        const token = localStorage.getItem(
            'access_token'
        )

        const response = await fetch(
            'http://127.0.0.1:8000/api/v1/quizzes',
            {
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
            }
        )

        if (response.ok) {

            alert('Tạo quiz thành công')

            setTitle('')
            setDescription('')
        }
    }

    return (

        <div className="p-10 max-w-xl">

            <h1 className="text-3xl font-bold mb-5">
                Tạo Quiz
            </h1>

            <input
                className="border p-3 w-full mb-4"
                placeholder="Title"
                value={title}
                onChange={(e) =>
                    setTitle(e.target.value)
                }
            />

            <textarea
                className="border p-3 w-full mb-4"
                placeholder="Description"
                value={description}
                onChange={(e) =>
                    setDescription(e.target.value)
                }
            />

            <label className="flex items-center gap-2 mb-5">

                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) =>
                        setIsPublic(e.target.checked)
                    }
                />

                Public Quiz

            </label>

            <button
                onClick={handleCreateQuiz}
                className="bg-black text-white px-5 py-3 rounded"
            >
                Tạo Quiz
            </button>

        </div>
    )
}