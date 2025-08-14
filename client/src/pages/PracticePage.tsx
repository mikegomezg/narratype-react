import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Settings as SettingsIcon, Move, Eye, EyeOff } from 'lucide-react'
import { useSettings } from '@/utils/settings'
import { SettingsPanel } from '@/components/SettingsPanel'

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
    const { settings, updateSettings } = useSettings()

    const [text, setText] = useState<TextContent | null>(null)
    const [userInput, setUserInput] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [errors, setErrors] = useState(0)
    const [session, setSession] = useState<SessionData | null>(null)
    const [isComplete, setIsComplete] = useState(false)
    const [searchParams] = useSearchParams()

    const [editMode, setEditMode] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [tempPosition, setTempPosition] = useState(settings.typingAreaBottom)

    const contentString = useMemo(() => (text?.content ?? ''), [text])
    const typedText = useMemo(() => contentString.slice(0, currentIndex), [contentString, currentIndex])
    const currentChar = useMemo(() => contentString[currentIndex] ?? '', [contentString, currentIndex])
    const remainingText = useMemo(() => contentString.slice(Math.min(currentIndex + 1, contentString.length)), [contentString, currentIndex])

    const fontSizeClass = {
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-xl',
        xl: 'text-2xl'
    }[settings.fontSize]

    // Load text content
    useEffect(() => {
        const demoFilename = searchParams.get('demo')
        if (demoFilename) {
            import('@/demo/demoData').then(({ getDemoTextByFilename }) => {
                const d = getDemoTextByFilename(demoFilename)
                if (d) setText({ id: 0, title: d.title, content: d.content, word_count: d.word_count })
            })
            return
        }
        if (textId) {
            fetch(`http://localhost:8000/api/texts/${textId}/content`)
                .then(r => r.json())
                .then(setText)
                .catch(() => {
                    setText({
                        id: 0,
                        title: 'Quick Practice',
                        content: 'The quick brown fox jumps over the lazy dog. Practice typing this sentence to improve your speed and accuracy.',
                        word_count: 15
                    })
                })
        } else {
            setText({
                id: 0,
                title: 'Quick Practice',
                content: 'The quick brown fox jumps over the lazy dog. Practice typing this sentence to improve your speed and accuracy.',
                word_count: 15
            })
        }
    }, [textId, searchParams])

    // Start session when text loads
    useEffect(() => {
        if (text && text.id !== undefined && !session) {
            // For demo texts (id=0), don't call server
            if (text.id === 0) {
                setSession({
                    sessionId: 0,
                    textId: 0,
                    startTime: Date.now(),
                    charactersTyped: 0,
                    errors: 0,
                    wpm: 0,
                    accuracy: 100,
                })
                return
            }
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
        if (!text || isComplete || editMode) return

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
            } else if (settings.highlightErrors) {
                setErrors(prev => prev + 1)
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
    }, [text, currentIndex, userInput, errors, session, isComplete, editMode, settings.highlightErrors])

    const completeSession = async () => {
        if (!session || !session.sessionId) return

        setIsComplete(true)
        const finalStats = {
            wpm: session.wpm,
            accuracy: session.accuracy,
            characters_typed: session.charactersTyped,
            errors: session.errors
        }

        if (session.sessionId && session.sessionId > 0) {
            await fetch(`http://localhost:8000/api/sessions/${session.sessionId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalStats)
            })
        }
    }

    const restart = () => {
        setUserInput('')
        setCurrentIndex(0)
        setErrors(0)
        setSession(null)
        setIsComplete(false)
    }

    // Drag to reposition typing area
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!editMode) return
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return
        const deltaY = dragStart.y - e.clientY
        const newBottom = Math.max(20, Math.min(400, tempPosition + deltaY))
        setTempPosition(newBottom)
    }, [isDragging, dragStart, tempPosition])

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false)
            updateSettings({ typingAreaBottom: tempPosition })
        }
    }, [isDragging, tempPosition, updateSettings])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    // Keyboard shortcuts: Esc to restart, Shift+Tab to library (disabled while in edit mode)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !editMode) {
                restart()
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault()
                navigate('/texts')
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [navigate, editMode])

    if (!text) return <div>Loading...</div>

    return (
        <div
            className="relative mx-auto space-y-6"
            style={{
                maxWidth: `${settings.practiceAreaWidth}%`,
                paddingBottom: `${settings.typingAreaBottom + settings.typingAreaHeight + 50}px`
            }}
        >
            <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
                <Button
                    variant={editMode ? "default" : "outline"}
                    size="icon"
                    onClick={() => setEditMode(!editMode)}
                    title="Edit Layout"
                >
                    <Move className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                >
                    <SettingsIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateSettings({ showStats: !settings.showStats })}
                    title={settings.showStats ? "Hide Stats" : "Show Stats"}
                >
                    {settings.showStats ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>

            <Card className={`card ${editMode ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                    {settings.showTitle && <CardTitle>{text.title}</CardTitle>}
                    {settings.showStats && (
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
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.showProgress && (
                        <Progress value={(contentString.length > 0 ? (currentIndex / contentString.length) * 100 : 0)} />
                    )}

                    <div className={`practice-text p-4 bg-muted rounded-lg font-mono ${fontSizeClass} leading-relaxed whitespace-pre-wrap`}>
                        <span className="text-green-600">{typedText}</span>
                        <span className="bg-primary text-primary-foreground">{currentChar || ' '}</span>
                        <span>{remainingText}</span>
                    </div>

                    {!isComplete ? (
                        <div
                            className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all ${editMode ? 'ring-2 ring-blue-500' : ''}`}
                            style={{
                                bottom: `${isDragging ? tempPosition : settings.typingAreaBottom}px`,
                                width: `min(100%, ${settings.practiceAreaWidth}rem)`,
                                cursor: editMode ? 'move' : 'default'
                            }}
                            onMouseDown={handleMouseDown}
                        >
                            {editMode && (
                                <div className="text-center text-xs text-blue-500 mb-1">
                                    Drag to reposition • Height: {settings.typingAreaHeight}px
                                </div>
                            )}
                            <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 backdrop-blur shadow-lg">
                                <textarea
                                    ref={inputRef}
                                    value={userInput}
                                    onChange={handleInput}
                                    className={`w-full p-4 font-mono ${fontSizeClass} focus:outline-none bg-transparent text-neutral-100`}
                                    placeholder="Start typing..."
                                    style={{ height: `${settings.typingAreaHeight}px` }}
                                    autoFocus={settings.autoFocusInput && !editMode}
                                    disabled={editMode}
                                    aria-label="Typing input"
                                    autoCorrect="off"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
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

            <SettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                editMode={editMode}
            />
        </div>
    )
}

