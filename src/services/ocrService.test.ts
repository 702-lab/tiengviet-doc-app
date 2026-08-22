import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanOcrText, containsVietnameseText, recognizeTextFromImage, SAMPLE_TEXTBOOK_PAGES } from './ocrService';

describe('OCR Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('cleanOcrText', () => {
    it('should handle empty or whitespace inputs gracefully', () => {
      expect(cleanOcrText('')).toBe('');
      expect(cleanOcrText('   \n  \t ')).toBe('');
    });

    it('should preserve standard Vietnamese diacritics and tones', () => {
      const input = 'Bé Na đi học chữ. Trường em có nhiều bạn tốt!';
      expect(cleanOcrText(input)).toBe(input);
    });

    it('should strip noisy artifact characters from textbook margins', () => {
      const input = '~~~| Bé đi học |_^^ 123...';
      const output = cleanOcrText(input);
      expect(output).toBe('Bé đi học 123...');
    });

    it('should collapse multiple line breaks and excess spaces into clean text', () => {
      const input = `  Bé   Na   đi   học.  
      
      Cả  nhà  đều   vui.  `;
      const output = cleanOcrText(input);
      expect(output).toBe('Bé Na đi học. Cả nhà đều vui.');
    });
  });

  describe('containsVietnameseText', () => {
    it('should detect Vietnamese text correctly', () => {
      expect(containsVietnameseText('Bé đi học')).toBe(true);
      expect(containsVietnameseText('Cây bàng')).toBe(true);
      expect(containsVietnameseText('Hello world')).toBe(false);
      expect(containsVietnameseText('')).toBe(false);
    });
  });

  describe('recognizeTextFromImage', () => {
    it('should throw an error if image URI is missing', async () => {
      await expect(recognizeTextFromImage('')).rejects.toThrow('Image URI is required');
    });

    it('should return simulated OCR result with confidence and word count when offline', async () => {
      const result = await recognizeTextFromImage('file:///dummy/path/textbook_page_1.jpg');
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(SAMPLE_TEXTBOOK_PAGES).toContain(result.text);
    });

    it('should call remote OCR API if environment variables are configured', async () => {
      process.env.EXPO_PUBLIC_OCR_API_URL = 'https://api.testocr.com/extract';
      process.env.EXPO_PUBLIC_OCR_API_KEY = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          text: 'Mẹ dắt bé đến trường.',
          confidence: 0.98
        })
      } as any);

      const result = await recognizeTextFromImage('file:///test.jpg', 'data:image/jpeg;base64,...');
      expect(global.fetch).toHaveBeenCalled();
      expect(result.text).toBe('Mẹ dắt bé đến trường.');
      expect(result.confidence).toBe(0.98);
      expect(result.wordCount).toBe(5);

      delete process.env.EXPO_PUBLIC_OCR_API_URL;
      delete process.env.EXPO_PUBLIC_OCR_API_KEY;
    });
  });
});
