import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/utils/settings'
import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

export default function SettingsPage() {
    const { settings, updateSettings, resetSettings } = useSettings()
    const [localSettings, setLocalSettings] = useState(settings)
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        updateSettings(localSettings)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleReset = () => {
        const defaults = resetSettings()
        setLocalSettings(defaults)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Settings</h1>
                {saved && (
                    <span className="text-green-600 animate-fade-in">Settings saved!</span>
                )}
            </div>

            <Tabs defaultValue="practice" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="practice">Practice</TabsTrigger>
                    <TabsTrigger value="display">Display</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="practice">
                    <Card>
                        <CardHeader>
                            <CardTitle>Practice Layout</CardTitle>
                            <CardDescription>
                                Customize the typing practice interface layout
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="practiceWidth">Practice Area Width (%)</Label>
                                    <Input
                                        id="practiceWidth"
                                        type="number"
                                        min={50}
                                        max={100}
                                        value={localSettings.practiceAreaWidth}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            practiceAreaWidth: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="typingBottom">Typing Area Bottom (px)</Label>
                                    <Input
                                        id="typingBottom"
                                        type="number"
                                        min={20}
                                        max={400}
                                        value={localSettings.typingAreaBottom}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            typingAreaBottom: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="typingHeight">Typing Area Height (px)</Label>
                                    <Input
                                        id="typingHeight"
                                        type="number"
                                        min={80}
                                        max={200}
                                        value={localSettings.typingAreaHeight}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            typingAreaHeight: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="display">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Options</CardTitle>
                            <CardDescription>
                                Control what's visible during practice
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="showStats">Show Statistics</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display WPM, accuracy, and errors
                                        </p>
                                    </div>
                                    <Switch
                                        id="showStats"
                                        checked={localSettings.showStats}
                                        onCheckedChange={(v) => setLocalSettings({
                                            ...localSettings,
                                            showStats: v
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="showProgress">Show Progress Bar</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Visual indicator of text completion
                                        </p>
                                    </div>
                                    <Switch
                                        id="showProgress"
                                        checked={localSettings.showProgress}
                                        onCheckedChange={(v) => setLocalSettings({
                                            ...localSettings,
                                            showProgress: v
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="showTitle">Show Title</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display text title in header
                                        </p>
                                    </div>
                                    <Switch
                                        id="showTitle"
                                        checked={localSettings.showTitle}
                                        onCheckedChange={(v) => setLocalSettings({
                                            ...localSettings,
                                            showTitle: v
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="behavior">
                    <Card>
                        <CardHeader>
                            <CardTitle>Behavior Settings</CardTitle>
                            <CardDescription>
                                Configure typing practice behavior
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="autoFocus">Auto-focus Input</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically focus typing area on load
                                        </p>
                                    </div>
                                    <Switch
                                        id="autoFocus"
                                        checked={localSettings.autoFocusInput}
                                        onCheckedChange={(v) => setLocalSettings({
                                            ...localSettings,
                                            autoFocusInput: v
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="highlightErrors">Highlight Errors</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show visual feedback for typing errors
                                        </p>
                                    </div>
                                    <Switch
                                        id="highlightErrors"
                                        checked={localSettings.highlightErrors}
                                        onCheckedChange={(v) => setLocalSettings({
                                            ...localSettings,
                                            highlightErrors: v
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                            <CardDescription>
                                Raw settings editor for power users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 bg-muted rounded-lg overflow-auto">
                                {JSON.stringify(localSettings, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                </Button>
                <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                </Button>
            </div>
        </div>
    )
}


