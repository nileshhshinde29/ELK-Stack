import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { notes, resolveImage } from './notes.js'

const currentId = () => window.location.hash.slice(1) || notes[0]?.id

export default function App() {
  const [activeId, setActiveId] = useState(currentId)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onHash = () => {
      setActiveId(currentId())
      setMenuOpen(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  }, [query])

  const groups = useMemo(() => {
    const map = new Map()
    for (const n of filtered) {
      if (!map.has(n.folder)) map.set(n.folder, [])
      map.get(n.folder).push(n)
    }
    return [...map]
  }, [filtered])

  const index = notes.findIndex((n) => n.id === activeId)
  const note = notes[index]
  const prev = notes[index - 1]
  const next = notes[index + 1]

  useEffect(() => {
    document.title = note ? `${note.title} · ELK Notes` : 'ELK Stack Notes'
  }, [note])

  return (
    <div className="layout">
      <header className="topbar">
        <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">☰</button>
        <span className="brand">ELK Stack Notes</span>
      </header>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand desktop-only">ELK Stack Notes</div>
        <input
          className="search"
          type="search"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav>
          {groups.map(([folder, items]) => (
            <div key={folder} className="group">
              <div className="group-title">{folder}</div>
              {items.map((n) => (
                <a key={n.id} href={`#${n.id}`} className={n.id === activeId ? 'active' : ''}>
                  {n.title}
                </a>
              ))}
            </div>
          ))}
          {groups.length === 0 && <p className="empty">No notes match "{query}".</p>}
        </nav>
      </aside>

      <main className="content">
        {note ? (
          <>
            <div className="crumb">{note.folder} / {note.fileName}</div>
            <article className="markdown">
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true }]]}
                components={{
                  img: ({ src, alt }) => <img src={resolveImage(src)} alt={alt} loading="lazy" />,
                  a: ({ href = '', children }) =>
                    href.startsWith('#') ? (
                      // In-page heading links: scroll instead of changing the note hash
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        {children}
                      </a>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer">{children}</a>
                    ),
                }}
              >
                {note.content}
              </Markdown>
            </article>
            <div className="pager">
              {prev ? <a href={`#${prev.id}`}>← {prev.title}</a> : <span />}
              {next ? <a href={`#${next.id}`}>{next.title} →</a> : <span />}
            </div>
          </>
        ) : (
          <p>Note not found. <a href={`#${notes[0]?.id}`}>Go to first note</a></p>
        )}
      </main>
    </div>
  )
}
