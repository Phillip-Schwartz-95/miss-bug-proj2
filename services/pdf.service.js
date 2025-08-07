import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { bugService } from './bugs.service.js'

export const pdfService = {
  createPdf
}

function createPdf(filterBy = {}) {
  return new Promise((resolve, reject) => {
    try {
      const bugs = bugService.query(filterBy)
      const doc = new PDFDocument()
      const filePath = path.join('data', 'MissBugReport.pdf')
      const stream = fs.createWriteStream(filePath)

      doc.pipe(stream)

      doc.fontSize(20).text('MissBug Report', { align: 'center' }).moveDown()

      bugs.forEach((bug, idx) => {
        doc.fontSize(14).text(`Bug #${idx + 1}`, { underline: true })
        doc.text(`Title: ${bug.title}`)
        doc.text(`Description: ${bug.description}`)
        doc.text(`Severity: ${bug.severity}`)
        doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)
        doc.text(`Labels: ${bug.labels?.join(', ') || 'None'}`)
        doc.moveDown()
      })

      doc.end()

      stream.on('finish', () => resolve(filePath))
      stream.on('error', reject)
      
      console.log('Generating PDF with bugs:', bugs)
    } catch (err) {
      reject(err)
    }
  })
}