export type DemoText = {
  id?: number
  filename: string // 'demo://...'
  display_path: string
  title: string
  author?: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  word_count: number
  content: string
}

export type DemoExercise = {
  id: string // 'demo-ex://...'
  type: 'touch_typing' | 'words' | 'phrases' | 'full_text'
  title: string
  content: string
  difficulty: number
}

const lorem = (
  n: number
) =>
  Array.from({ length: n })
    .map(
      () =>
        'the quick brown fox jumps over the lazy dog to practice typing accuracy speed and focus'
    )
    .join(' ')

export const demoTexts: DemoText[] = [
  {
    filename: 'demo://the_art_of_typing',
    display_path: 'demo/technical/the_art_of_typing.txt',
    title: 'The Art of Typing',
    author: 'John Doe',
    category: 'technical',
    difficulty: 'easy',
    content: lorem(120),
    word_count: 120,
  },
  {
    filename: 'demo://programming_basics',
    display_path: 'demo/technical/programming_basics.txt',
    title: 'Programming Basics',
    author: 'Jane Smith',
    category: 'technical',
    difficulty: 'medium',
    content: lorem(180),
    word_count: 180,
  },
  {
    filename: 'demo://classic_literature_excerpt',
    display_path: 'demo/classics/classic_literature_excerpt.txt',
    title: 'Classic Literature Excerpt',
    author: 'Anonymous',
    category: 'classics',
    difficulty: 'hard',
    content: lorem(220),
    word_count: 220,
  },
  {
    filename: 'demo://keyboard_mastery',
    display_path: 'demo/technical/keyboard_mastery.txt',
    title: 'Keyboard Mastery',
    author: 'Tech Writer',
    category: 'technical',
    difficulty: 'medium',
    content: lorem(160),
    word_count: 160,
  },
]

export const demoExercises: DemoExercise[] = [
  {
    id: 'demo-ex://touch-esc',
    type: 'touch_typing',
    title: 'Touch: esc row',
    content: 'asdf jkl; asdf jkl; asdf jkl; asdf jkl;',
    difficulty: 1,
  },
  {
    id: 'demo-ex://words-1',
    type: 'words',
    title: 'Common Words 1',
    content: 'time person year way day thing man world life hand part child eye woman place work week case point',
    difficulty: 2,
  },
  {
    id: 'demo-ex://phrase-1',
    type: 'phrases',
    title: 'Phrases: quick brown',
    content: 'The quick brown fox jumps over the lazy dog. Practice this line repeatedly until fluid.',
    difficulty: 1.5,
  },
  {
    id: 'demo-ex://full-1',
    type: 'full_text',
    title: 'Full Text: sample',
    content: lorem(100),
    difficulty: 2.5,
  },
]

export function getDemoTextByFilename(filename: string): DemoText | undefined {
  return demoTexts.find((t) => t.filename === filename)
}

export function getDemoExerciseById(id: string): DemoExercise | undefined {
  return demoExercises.find((e) => e.id === id)
}

