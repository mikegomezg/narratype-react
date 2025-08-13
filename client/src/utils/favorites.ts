const FAVORITES_KEY = 'narratype:favorites'

export type FavoriteItem = {
  id?: number
  filename: string
}

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isFavorited(filename: string): boolean {
  return getFavorites().includes(filename)
}

export function toggleFavorite(filename: string): boolean {
  const set = new Set(getFavorites())
  if (set.has(filename)) set.delete(filename)
  else set.add(filename)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]))
  return set.has(filename)
}

