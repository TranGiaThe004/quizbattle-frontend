'use client'

import { useState } from 'react'

export default function MultipleChoiceForm(
    {
        quizId
    }: {
        quizId: number
    }
) {

    const [questionText, setQuestionText] = useState('')

    const [options, setOptions] = useState([
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
    ])

    const handleOptionChange = (
        index: number,
        value: string
    ) => {

        const updated = [...options]

        updated[index].option_text = value

        setOptions(updated)
    }

    const handleCorrectAnswer = (
        index: number
    ) => {

        const updated = options.map(
            (option, i) => ({
                ...option,
                is_correct: i === index
            })
        )

        setOptions(updated)
    }

    const handleSubmit = async () => {

        const token = localStorage.getItem(
            'access_token'
        )

        const response = await fetch(
            `http://127.0.0.1:8000/api/v1/quizzes/${quizId}/questions`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    question_text: questionText,
                    options
                })
            }
        )

        if (response.ok) {

            alert('Tạo câu hỏi thành công')

            setQuestionText('')
        }
    }

    return (

        <div className="border p-5 rounded mt-5">

            <h2 className="text-2xl font-bold mb-5">
                Tạo Multiple Choice
            </h2>

            <input
                className="border p-3 w-full mb-5"
                placeholder="Question"
                value={questionText}
                onChange={(e) =>
                    setQuestionText(e.target.value)
                }
            />

            {
                options.map((option, index) => (

                    <div
                        key={index}
                        className="flex items-center gap-3 mb-3"
                    >

                        <input
                            type="radio"
                            checked={option.is_correct}
                            onChange={() =>
                                handleCorrectAnswer(index)
                            }
                        />

                        <input
                            className="border p-2 flex-1"
                            placeholder={`Option ${index + 1}`}
                            value={option.option_text}
                            onChange={(e) =>
                                handleOptionChange(
                                    index,
                                    e.target.value
                                )
                            }
                        />

                    </div>
                ))
            }

            <button
                onClick={handleSubmit}
                className="bg-black text-white px-5 py-3 rounded mt-5"
            >
                Lưu câu hỏi
            </button>

        </div>
    )
}