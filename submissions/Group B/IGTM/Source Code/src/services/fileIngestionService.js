import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const MAX_CHARS = 12000

const normalizeText = (text) =>
  text.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim()

const truncateText = (text) => (text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}...` : text)

const extractTextFromPdf = async (file) => {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
  }
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pages = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const lines = content.items.map((item) => item.str).join(' ')
    if (lines.trim()) {
      pages.push(lines)
    }
  }
  return pages.join('\n\n')
}

const extractTextFromDocx = async (file) => {
  const mammoth = await import('mammoth/mammoth.browser')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

const extractTextFromTextLike = async (file) => file.text()

const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() || ''

class FileIngestionService {
  async parse(file) {
    if (!file) {
      throw new Error('No file selected')
    }
    const extension = getExtension(file.name)
    const mimeType = file.type.toLowerCase()
    let rawText = ''

    if (mimeType.includes('pdf') || extension === 'pdf') {
      rawText = await extractTextFromPdf(file)
    } else if (
      mimeType.includes('wordprocessingml') ||
      extension === 'docx'
    ) {
      rawText = await extractTextFromDocx(file)
    } else if (mimeType.includes('msword') || extension === 'doc') {
      throw new Error('Legacy .doc files are not supported. Please upload .docx, .pdf, or .txt.')
    } else {
      rawText = await extractTextFromTextLike(file)
    }

    const normalized = normalizeText(rawText)
    if (!normalized) {
      throw new Error('Could not extract readable text from this file')
    }

    return truncateText(normalized)
  }
}

export default new FileIngestionService()
