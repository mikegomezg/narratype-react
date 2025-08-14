export interface PracticeSettings {
	// Layout settings
	practiceAreaWidth: number // percentage (50-100)
	typingAreaBottom: number // pixels from bottom (20-400)
	typingAreaHeight: number // pixels (80-200)

	// Display settings
	showStats: boolean
	showProgress: boolean
	showTitle: boolean
	fontSize: 'small' | 'medium' | 'large' | 'xl'
	theme: 'light' | 'dark' | 'auto'

	// Behavior settings
	soundEnabled: boolean
	autoFocusInput: boolean
	highlightErrors: boolean
}

const SETTINGS_KEY = 'narratype:settings'

const DEFAULT_SETTINGS: PracticeSettings = {
	practiceAreaWidth: 85,
	typingAreaBottom: 40,
	typingAreaHeight: 120,
	showStats: true,
	showProgress: true,
	showTitle: true,
	fontSize: 'large',
	theme: 'auto',
	soundEnabled: false,
	autoFocusInput: true,
	highlightErrors: true,
}

export function getSettings(): PracticeSettings {
	try {
		const stored = localStorage.getItem(SETTINGS_KEY)
		if (stored) {
			return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
		}
	} catch (e) {
		console.error('Failed to load settings:', e)
	}
	return DEFAULT_SETTINGS
}

export function saveSettings(settings: Partial<PracticeSettings>): PracticeSettings {
	const current = getSettings()
	const updated = { ...current, ...settings }
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))

	// Dispatch custom event for reactive updates
	window.dispatchEvent(new CustomEvent('settings-changed', { detail: updated }))

	return updated
}

export function resetSettings(): PracticeSettings {
	localStorage.removeItem(SETTINGS_KEY)
	window.dispatchEvent(new CustomEvent('settings-changed', { detail: DEFAULT_SETTINGS }))
	return DEFAULT_SETTINGS
}

// Hook for reactive settings
import { useState, useEffect } from 'react'

export function useSettings() {
	const [settings, setSettings] = useState(getSettings)

	useEffect(() => {
		const handleChange = (e: Event) => {
			const custom = e as CustomEvent<PracticeSettings>
			setSettings(custom.detail)
		}

		window.addEventListener('settings-changed' as any, handleChange as any)
		return () => window.removeEventListener('settings-changed' as any, handleChange as any)
	}, [])

	return {
		settings,
		updateSettings: saveSettings,
		resetSettings,
	}
}


