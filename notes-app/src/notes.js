// Every .md file in the notes folders is bundled at build time.
// Add a new note to "ELK Notes" or "ELK Notes All" and it shows up automatically.
const mdFiles = import.meta.glob(
  ['../../ELK Notes/**/*.md', '../../ELK Notes All/**/*.md'],
  { query: '?raw', import: 'default', eager: true }
)

const imageFiles = import.meta.glob(
  '../../ELK Notes/**/*.{png,jpg,jpeg,gif,svg,webp}',
  { query: '?url', import: 'default', eager: true }
)

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function titleFrom(fileName, content) {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading ? heading[1].trim() : fileName.replace(/\.md$/, '')
}

export const notes = Object.entries(mdFiles)
  .map(([path, content]) => {
    const rel = path.replace('../../', '')
    const parts = rel.split('/')
    const fileName = parts.pop()
    return {
      id: encodeURIComponent(rel.replace(/\.md$/, '')),
      folder: parts.join(' / '),
      fileName,
      title: titleFrom(fileName, content),
      content,
    }
  })
  .sort((a, b) => collator.compare(a.folder, b.folder) || collator.compare(a.fileName, b.fileName))

// Map "image/<sub>/<file>" -> bundled URL, so both relative and repo-absolute links resolve.
const images = Object.fromEntries(
  Object.entries(imageFiles).map(([path, url]) => [path.slice(path.indexOf('image/')), url])
)

export function resolveImage(src = '') {
  const decoded = decodeURI(src)
  const i = decoded.indexOf('image/')
  return (i >= 0 && images[decoded.slice(i)]) || src
}
