import { useState } from 'react'
import { Settings as SettingsIcon, X, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings } from '@/utils/settings'

interface SettingsPanelProps {
    isOpen: boolean
    onClose: () => void
    editMode?: boolean
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { settings, updateSettings, resetSettings } = useSettings()
    const [localSettings, setLocalSettings] = useState(settings)

    if (!isOpen) return null

    const handleSave = () => {
        updateSettings(localSettings)
        onClose()
    }

    const handleReset = () => {
        const defaults = resetSettings()
        setLocalSettings(defaults)
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        Practice Settings
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Layout Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Layout</h3>
                        <div className="space-y-2">
                            <Label htmlFor="width">Practice Area Width: {localSettings.practiceAreaWidth}%</Label>
                            <Slider
                                id="width"
                                min={50}
                                max={100}
                                step={5}
                                value={[localSettings.practiceAreaWidth]}
                                onValueChange={([v]) => setLocalSettings({ ...localSettings, practiceAreaWidth: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bottom">Typing Area Position: {localSettings.typingAreaBottom}px from bottom</Label>
                            <Slider
                                id="bottom"
                                min={20}
                                max={400}
                                step={10}
                                value={[localSettings.typingAreaBottom]}
                                onValueChange={([v]) => setLocalSettings({ ...localSettings, typingAreaBottom: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Typing Area Height: {localSettings.typingAreaHeight}px</Label>
                            <Slider
                                id="height"
                                min={80}
                                max={200}
                                step={10}
                                value={[localSettings.typingAreaHeight]}
                                onValueChange={([v]) => setLocalSettings({ ...localSettings, typingAreaHeight: v })}
                            />
                        </div>
                    </div>

                    {/* Display Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Display</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="stats">Show Statistics</Label>
                            <Switch
                                id="stats"
                                checked={localSettings.showStats}
                                onCheckedChange={(v) => setLocalSettings({ ...localSettings, showStats: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="progress">Show Progress Bar</Label>
                            <Switch
                                id="progress"
                                checked={localSettings.showProgress}
                                onCheckedChange={(v) => setLocalSettings({ ...localSettings, showProgress: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="title">Show Title</Label>
                            <Switch
                                id="title"
                                checked={localSettings.showTitle}
                                onCheckedChange={(v) => setLocalSettings({ ...localSettings, showTitle: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fontSize">Font Size</Label>
                            <Select
                                value={localSettings.fontSize}
                                onValueChange={(v) => setLocalSettings({ ...localSettings, fontSize: v as any })}
                            >
                                <SelectTrigger id="fontSize">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                    <SelectItem value="xl">Extra Large</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


