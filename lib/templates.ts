export function getTemplateIdSuffix(id: string) {
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? `${id}-dev` : id
}

export function getTemplateId(id: string) {
  return id.replace(/-dev$/, '')
}

const templates = {
  'nlhz8vlwyupq845jsdg9': {
    name: 'Python data analyst',
    lib: [
      'python',
      'jupyter',
      'numpy',
      'pandas',
      'matplotlib',
      'seaborn',
      'plotly',
    ],
    file: 'script.py',
    instructions:
      'Runs code as a Jupyter notebook cell. Strong data analysis angle. Can use complex visualisation to explain results.',
    port: null,
  },
  'rezjpxscgrqpw9oz0wfk': {
    name: 'AMP Developer',
    lib: [],
    file: 'index.html',
    instructions: 'Accelerated Mobile Pages developer environment.',
    port: 80,
  },
  '77gbcsv20q8kxklidjhe': {
    name: 'OpenCode',
    lib: [],
    file: 'main.py',
    instructions: 'General purpose Eburon coding environment.',
    port: null,
  },
  'u2bzpic9lzyttv5jh36g': {
    name: 'OpenClaw',
    lib: [],
    file: 'index.html',
    instructions: 'OpenClaw optimized environment for rich UI.',
    port: 80,
  },
  'u1yrkaokyjzef8qchho5': {
    name: 'Codex',
    lib: [],
    file: 'index.html',
    instructions: 'Codex developer environment.',
    port: 80,
  },
  'wunszvjeuyrdgrt0z6o9': {
    name: 'Claude Env',
    lib: [],
    file: 'index.html',
    instructions: 'Specialized environment for Claude-based completions.',
    port: 80,
  },
  'k0wmnzir0zuzye6dndlw': {
    name: 'Eburon Desktop',
    lib: [],
    file: 'readme.md',
    instructions: 'Full desktop environment with UI access.',
    port: 8080,
  },
  'rki5dems9wqfm4r03t7g': {
    name: 'Eburon Base',
    lib: [],
    file: 'index.html',
    instructions: 'Base Eburon AI environment.',
    port: 80,
  },
  [getTemplateIdSuffix('nextjs-developer')]: {
    name: 'Next.js developer',
    lib: [
      'nextjs@14.2.5',
      'typescript',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'postcss',
      'tailwindcss',
      'shadcn',
    ],
    file: 'pages/index.tsx',
    instructions:
      'A Next.js 13+ app that reloads automatically. Using the pages router.',
    port: 3000,
  },
  [getTemplateIdSuffix('vue-developer')]: {
    name: 'Vue.js developer',
    lib: ['vue@latest', 'nuxt@3.13.0', 'tailwindcss'],
    file: 'app/app.vue',
    instructions:
      'A Vue.js 3+ app that reloads automatically. Only when asked specifically for a Vue app.',
    port: 3000,
  },
  [getTemplateIdSuffix('streamlit-developer')]: {
    name: 'Streamlit developer',
    lib: [
      'streamlit',
      'pandas',
      'numpy',
      'matplotlib',
      'requests',
      'seaborn',
      'plotly',
    ],
    file: 'app.py',
    instructions: 'A streamlit app that reloads automatically.',
    port: 8501,
  },
  [getTemplateIdSuffix('gradio-developer')]: {
    name: 'Gradio developer',
    lib: [
      'gradio',
      'pandas',
      'numpy',
      'matplotlib',
      'requests',
      'seaborn',
      'plotly',
    ],
    file: 'app.py',
    instructions:
      'A gradio app. Gradio Blocks/Interface should be called demo.',
    port: 7860,
  },
}

export type Templates = typeof templates
export default templates

export function templatesToPrompt(templates: Templates) {
  return `${Object.entries(templates)
    .map(
      ([id, t], index) =>
        `${index + 1}. ${id}: "${t.instructions}". File: ${t.file || 'none'}. Dependencies installed: ${t.lib.join(', ') || 'none'}. Port: ${t.port || 'none'}.`,
    )
    .join('\n')}`
}
