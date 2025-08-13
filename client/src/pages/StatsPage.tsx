import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Statistics</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Detailed statistics and progress tracking will be available here.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

