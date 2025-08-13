import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Clock, TrendingUp } from 'lucide-react'
import { demoTexts } from '@/demo/demoData'
import { isFavorited } from '@/utils/favorites'

type TextItem = {
    id?: number
    filename: string
    display_path: string
    title: string
    author?: string
    category?: string
    difficulty?: string
    word_count: number
    is_favorite: boolean
    last_practiced?: string | null
    times_practiced: number
}

export default function HomePage() {
    const [favorites, setFavorites] = useState<TextItem[]>([])
    const [recent, setRecent] = useState<TextItem[]>([])
    const [stats, setStats] = useState({ totalSessions: 0, avgWpm: 0, avgAccuracy: 0 })

    useEffect(() => {
        // Fetch favorites
        fetch('http://localhost:8000/api/texts/')
            .then(r => (r.ok ? r.json() : Promise.resolve([])))
            .then((texts: TextItem[]) => {
                let data = texts
                if (!data || data.length === 0) {
                    data = demoTexts.map((d) => ({
                        id: undefined,
                        filename: d.filename,
                        display_path: d.display_path,
                        title: d.title,
                        author: d.author,
                        category: d.category,
                        difficulty: d.difficulty,
                        word_count: d.word_count,
                        is_favorite: isFavorited(d.filename),
                        last_practiced: undefined,
                        times_practiced: 0,
                    }))
                }
                setFavorites(data.filter(t => t.is_favorite).slice(0, 3))
                setRecent(data.filter(t => t.last_practiced).slice(0, 3))
            })

        // Fetch stats
        fetch('http://localhost:8000/api/sessions/')
            .then(r => r.json())
            .then(sessions => {
                const completed = sessions.filter((s: any) => s.completed)
                if (completed.length > 0) {
                    const avgWpm = completed.reduce((acc: number, s: any) => acc + (s.wpm || 0), 0) / completed.length
                    const avgAccuracy = completed.reduce((acc: number, s: any) => acc + (s.accuracy || 0), 0) / completed.length
                    setStats({
                        totalSessions: completed.length,
                        avgWpm: Math.round(avgWpm),
                        avgAccuracy: Math.round(avgAccuracy)
                    })
                }
            })
    }, [])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome to Narratype</h1>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgWpm}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgAccuracy}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-3">Favorites</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        {favorites.map(text => (
                            <Card key={text.filename}>
                                <CardContent className="p-4">
                                    <h3 className="font-medium">{text.title}</h3>
                                    <p className="text-sm text-muted-foreground">{text.author || 'Unknown'}</p>
                                    <Link to={`/practice/${text.id}`}>
                                        <Button size="sm" className="mt-2">Practice</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent */}
            {recent.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-3">Recent Practice</h2>
                    <div className="grid gap-3 md:grid-cols-3">
                        {recent.map(text => (
                            <Card key={text.filename}>
                                <CardContent className="p-4">
                                    <h3 className="font-medium">{text.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Practiced {text.times_practiced} times
                                    </p>
                                    <Link to={`/practice/${text.id}`}>
                                        <Button size="sm" variant="outline" className="mt-2">Continue</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Start */}
            <div className="flex gap-3">
                <Link to="/texts">
                    <Button>Browse Library</Button>
                </Link>
                <Link to="/practice">
                    <Button variant="outline">Quick Practice</Button>
                </Link>
            </div>
        </div>
    )
}

