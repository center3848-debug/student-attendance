import { describe, it, expect, vi } from 'vitest'
vi.mock('@/services/drive', () => ({
  uploadImageToDrive: vi.fn().mockResolvedValue('https://drive.google.com/uc?id=test123'),
}))
describe('drive service mock', () => {
  it('uploadImageToDrive returns Drive URL', async () => {
    const { uploadImageToDrive } = await import('@/services/drive')
    const result = await uploadImageToDrive(Buffer.from('test'), 'test.jpg')
    expect(result).toMatch(/^https:\/\/drive\.google\.com/)
  })
})
