import { google } from 'googleapis'
import sharp from 'sharp'
import { Readable } from 'stream'

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
  return google.drive({ version: 'v3', auth })
}

export async function uploadImageToDrive(imageBuffer: Buffer, filename: string): Promise<string> {
  const resized = await sharp(imageBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  const drive = getDriveClient()
  const stream = Readable.from(resized)

  const res = await drive.files.create({
    requestBody: { name: filename, parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!] },
    media: { mimeType: 'image/jpeg', body: stream },
    fields: 'id, webViewLink',
  })

  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  return `https://drive.google.com/uc?id=${res.data.id}`
}
