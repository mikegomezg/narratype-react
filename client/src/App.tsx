import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components'

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

export default function App() {
    const [texts, setTexts] = useState<TextItem[]>([])

    useEffect(() => {
        fetch('http://localhost:8000/api/texts/')
            .then(r => r.json())
            .then(setTexts)
            .catch(() => setTexts([]))
    }, [])

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Narratype</h1>
            <Tabs defaultValue="texts">
                <TabsList>
                    <TabsTrigger value="texts">Texts</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="texts">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {texts.map((t) => (
                            <Card key={t.filename}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">{t.display_path}</div>
                                    <div className="text-sm">Words: {t.word_count}</div>
                                    <div className="pt-3">
                                        <Button size="sm">Practice</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="stats">
                    <div className="text-muted-foreground">Coming soon</div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

