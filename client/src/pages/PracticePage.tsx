import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type TextContent = {
    id?: number
    title: string
    content: string
    word_count: number
}

type SessionData = {
    sessionId?: number
    textId: number
    startTime: number
    endTime?: number
    charactersTyped: number
    errors: number
    wpm: number
    accuracy: number
}

export default function PracticePage() {
    const { textId } = useParams()
    const navigate = useNavigate()
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const [text, setText] = useState<TextContent | null>(null)
    const [userInput, setUserInput] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [errors, setErrors] = useState(0)
    const [session, setSession] = useState<SessionData | null>(null)
    const [isComplete, setIsComplete] = useState(false)

    // Load text content
    useEffect(() => {
        if (textId) {
            fetch(`http://localhost:8000/api/texts/${textId}/content`)
                .then(r => r.json())
                .then(setText)
                .catch(() => {
                    // If no textId or error, load a default text
                    setText({
                        id: 0,
                        title: 'Quick Practice',
                        content: 'The quick brown fox jumps over the lazy dog. Practice typing this sentence to improve your speed and accuracy.',
                        word_count: 15
                    })
                })
        } else {
            // Load default practice text
            setText({
                id: 0,
                title: 'Quick Practice',
                content: 'The quick brown fox jumps over the lazy dog. Practice typing this sentence to improve your speed and accuracy.',
                word_count: 15
            })
        }
    }, [textId])

    // Start session when text loads
    useEffect(() => {
        if (text && text.id !== undefined && !session) {
            fetch('http://localhost:8000/api/sessions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text_id: text.id })
            })
                .then(r => r.json())
                .then(data => {
                    setSession({
                        sessionId: data.id,
                        textId: text.id!,
                        startTime: Date.now(),
                        charactersTyped: 0,
                        errors: 0,
                        wpm: 0,
                        accuracy: 100
                    })
                })
        }
    }, [text, session])

    // Handle typing
    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!text || isComplete) return

        const input = e.target.value
        const lastChar = input[input.length - 1]
        const expectedChar = text.content[currentIndex]

        if (input.length > userInput.length) {
            // User typed a character
            if (lastChar === expectedChar) {
                setCurrentIndex(prev => prev + 1)
                setUserInput(input)

                // Check if complete
                if (currentIndex + 1 >= text.content.length) {
                    completeSession()
                }
            } else {
                setErrors(prev => prev + 1)
                // Don't update input on error (force correct typing)
                e.target.value = userInput
            }

            // Update session stats
            if (session) {
                const timeElapsed = (Date.now() - session.startTime) / 1000 / 60 // minutes
                const wordsTyped = currentIndex / 5 // rough estimate
                const wpm = Math.round(wordsTyped / Math.max(timeElapsed, 0.1))
                const accuracy = Math.round(((currentIndex - errors) / Math.max(currentIndex, 1)) * 100)

                setSession(prev => prev ? {
                    ...prev,
                    charactersTyped: currentIndex,
                    errors,
                    wpm,
                    accuracy
                } : null)
            }
        } else {
            // Backspace - allow going back
            if (input.length < userInput.length && currentIndex > 0) {
                setCurrentIndex(prev => prev - 1)
                setUserInput(input)
            }
        }
    }, [text, currentIndex, userInput, errors, session, isComplete])

    const completeSession = async () => {
        if (!session || !session.sessionId) return

        setIsComplete(true)
        const finalStats = {
            wpm: session.wpm,
            accuracy: session.accuracy,
            characters_typed: session.charactersTyped,
            errors: session.errors
        }

        await fetch(`http://localhost:8000/api/sessions/${session.sessionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalStats)
        })
    }

    const restart = () => {
        setUserInput('')
        setCurrentIndex(0)
        setErrors(0)
        setSession(null)
        setIsComplete(false)
    }

    if (!text) return <div>Loading...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{text.title}</CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Words: {text.word_count}</span>
                        {session && (
                            <>
                                <span>WPM: {session.wpm}</span>
                                <span>Accuracy: {session.accuracy}%</span>
                                <span>Errors: {session.errors}</span>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress bar */}
                    <Progress value={(currentIndex / text.content.length) * 100} />

                    {/* Text display */}
                    <div className="p-4 bg-muted rounded-lg font-mono text-lg leading-relaxed">
                        {text.content.split('').map((char, idx) => {
                            let className = ''
                            if (idx < currentIndex) {
                                className = 'text-green-600'
                            } else if (idx === currentIndex) {
                                className = 'bg-primary text-primary-foreground'
                            }
                            return (
                                <span key={idx} className={className}>
                                    {char}
                                </span>
                            )
                        })}
                    </div>

                    {/* Input area */}
                    {!isComplete ? (
                        <textarea
                            ref={inputRef}
                            value={userInput}
                            onChange={handleInput}
                            className="w-full p-4 font-mono text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Start typing..."
                            rows={4}
                            autoFocus
                        />
                    ) : (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="p-6 text-center">
                                <h3 className="text-xl font-semibold mb-2">Practice Complete!</h3>
                                <div className="space-y-2 mb-4">
                                    <p>Final WPM: {session?.wpm}</p>
                                    <p>Accuracy: {session?.accuracy}%</p>
                                    <p>Total Errors: {session?.errors}</p>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={restart}>Try Again</Button>
                                    <Button variant="outline" onClick={() => navigate('/texts')}>
                                        Choose Another Text
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

