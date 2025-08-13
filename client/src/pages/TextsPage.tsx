import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, StarOff, Search } from 'lucide-react'

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

export default function TextsPage() {
    const [texts, setTexts] = useState<TextItem[]>([])
    const [filteredTexts, setFilteredTexts] = useState<TextItem[]>([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [difficultyFilter, setDifficultyFilter] = useState('all')
    const [categories, setCategories] = useState<string[]>([])

    useEffect(() => {
        fetchTexts()
    }, [])

    const fetchTexts = async () => {
        const response = await fetch('http://localhost:8000/api/texts/')
        const data = await response.json()
        setTexts(data)
        setFilteredTexts(data)

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((t: TextItem) => t.category).filter(Boolean))]
        setCategories(uniqueCategories as string[])
    }

    useEffect(() => {
        let filtered = texts

        // Search filter
        if (search) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.author?.toLowerCase().includes(search.toLowerCase())
            )
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(t => t.category === categoryFilter)
        }

        // Difficulty filter
        if (difficultyFilter !== 'all') {
            filtered = filtered.filter(t => t.difficulty === difficultyFilter)
        }

        setFilteredTexts(filtered)
    }, [search, categoryFilter, difficultyFilter, texts])

    const toggleFavorite = async (text: TextItem) => {
        if (!text.id) {
            // Register text first
            const response = await fetch('http://localhost:8000/api/texts/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: text.filename })
            })
            const data = await response.json()
            text.id = data.id
        }

        await fetch(`http://localhost:8000/api/texts/${text.id}/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_favorite: !text.is_favorite })
        })

        fetchTexts()
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600'
            case 'medium': return 'text-yellow-600'
            case 'hard': return 'text-red-600'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Text Library</h1>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Search texts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Text Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTexts.map((text) => (
                    <Card key={text.filename} className="relative">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg pr-2">{text.title}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleFavorite(text)}
                                    className="shrink-0"
                                >
                                    {text.is_favorite ? (
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ) : (
                                        <StarOff className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm space-y-1">
                                {text.author && (
                                    <p className="text-muted-foreground">by {text.author}</p>
                                )}
                                <p className="text-muted-foreground">{text.category}</p>
                                <p className={getDifficultyColor(text.difficulty)}>
                                    {text.difficulty || 'Unknown'} • {text.word_count} words
                                </p>
                            </div>

                            {text.last_practiced && (
                                <p className="text-xs text-muted-foreground">
                                    Practiced {text.times_practiced} times
                                </p>
                            )}

                            <Link to={text.id ? `/practice/${text.id}` : '#'}>
                                <Button
                                    className="w-full"
                                    onClick={async () => {
                                        if (!text.id) {
                                            // Register text when first practiced
                                            const response = await fetch('http://localhost:8000/api/texts/register', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ filename: text.filename })
                                            })
                                            const data = await response.json()
                                            window.location.href = `/practice/${data.id}`
                                        }
                                    }}
                                >
                                    Practice
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTexts.length === 0 && (
                <Card>
                    <CardContent className="text-center py-10">
                        <p className="text-muted-foreground">No texts found matching your filters.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

