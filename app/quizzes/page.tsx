'use client'

import { useEffect, useState } from 'react'

export default function QuizzesPage() {

    const [quizzes, setQuizzes] = useState([])

    useEffect(() => {

        const fetchQuizzes = async () => {

            const token = localStorage.getItem(
                'access_token'
            )

            const response = await fetch(
                'http://127.0.0.1:8000/api/v1/quizzes',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const data = await response.json()

            setQuizzes(data)
        }

        fetchQuizzes()

    }, [])

    return (

        <div className="p-10">

            <h1 className="text-3xl font-bold mb-5">
                Danh sách Quiz
            </h1>

            <div className="grid gap-5">

                {
                    quizzes.map((quiz: any) => (

                        <div
                            key={quiz.id}
                            className="border p-5 rounded"
                        >

                            <h2 className="text-xl font-bold">
                                {quiz.title}
                            </h2>

                            <p>
                                {quiz.description}
                            </p>

                        </div>
                    ))
                }

            </div>

        </div>
    )
}