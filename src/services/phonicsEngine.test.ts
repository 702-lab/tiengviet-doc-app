import { describe, it, expect } from 'vitest';
import { parseWord, generateSpellingSteps, tokenizeText } from './phonicsEngine';

describe('Vietnamese Phonics Syllable Parser', () => {
  it('should parse simple syllables with onset, rhyme, and tone', () => {
    const p1 = parseWord('bàn');
    expect(p1.onset).toBe('b');
    expect(p1.onsetSpeech).toBe('bờ');
    expect(p1.rhyme).toBe('an');
    expect(p1.tone).toBe('huyền');

    const p2 = parseWord('bán');
    expect(p2.onset).toBe('b');
    expect(p2.rhyme).toBe('an');
    expect(p2.tone).toBe('sắc');
  });

  it('should parse syllables without onset', () => {
    const p = parseWord('uống');
    expect(p.onset).toBe('');
    expect(p.rhyme).toBe('uông');
    expect(p.tone).toBe('sắc');
  });

  it('should handle special onset "gi" correctly', () => {
    // "gió" -> onset: "gi", rhyme: "o", tone: "sắc"
    const p1 = parseWord('gió');
    expect(p1.onset).toBe('gi');
    expect(p1.rhyme).toBe('o');
    expect(p1.tone).toBe('sắc');

    // "gìn" -> onset: "gi", rhyme: "in", tone: "huyền"
    const p2 = parseWord('gìn');
    expect(p2.onset).toBe('gi');
    expect(p2.rhyme).toBe('in');
    expect(p2.tone).toBe('huyền');

    // "giếng" -> onset: "gi", rhyme: "iêng", tone: "sắc"
    const p3 = parseWord('giếng');
    expect(p3.onset).toBe('gi');
    expect(p3.rhyme).toBe('iêng');
    expect(p3.tone).toBe('sắc');
  });

  it('should handle special onset "qu" correctly', () => {
    const p1 = parseWord('quả');
    expect(p1.onset).toBe('qu');
    expect(p1.rhyme).toBe('a');
    expect(p1.tone).toBe('hỏi');

    const p2 = parseWord('quanh');
    expect(p2.onset).toBe('qu');
    expect(p2.rhyme).toBe('anh');
    expect(p2.tone).toBe('ngang');
  });

  it('should handle edge cases from textbooks (ooang, uynh, uât, uya)', () => {
    // xoong (rhyme: oong, onset: x)
    const p1 = parseWord('xoong');
    expect(p1.onset).toBe('x');
    expect(p1.rhyme).toBe('oong');
    expect(p1.tone).toBe('ngang');

    // khuỳnh (rhyme: uynh, onset: kh)
    const p2 = parseWord('khuỳnh');
    expect(p2.onset).toBe('kh');
    expect(p2.rhyme).toBe('uynh');
    expect(p2.tone).toBe('huyền');

    // xuất (rhyme: uât, onset: x, tone: sắc)
    const p3 = parseWord('xuất');
    expect(p3.onset).toBe('x');
    expect(p3.rhyme).toBe('uât');
    expect(p3.tone).toBe('sắc');

    // khuya (rhyme: uya, onset: kh, tone: ngang)
    const p4 = parseWord('khuya');
    expect(p4.onset).toBe('kh');
    expect(p4.rhyme).toBe('uya');
    expect(p4.tone).toBe('ngang');
  });
});

describe('Vietnamese Phonics Spelling Script Generator', () => {
  it('should generate spelling steps for simple words', () => {
    const s1 = generateSpellingSteps('bàn');
    expect(s1.spellingText).toBe('bờ - an - ban - huyền - bàn');
    expect(s1.steps).toHaveLength(5);
    expect(s1.steps[0]).toEqual({ text: 'b', speech: 'bờ', type: 'onset' });
    expect(s1.steps[1]).toEqual({ text: 'an', speech: 'an', type: 'rhyme' });
    expect(s1.steps[2]).toEqual({ text: 'ban', speech: 'ban', type: 'combined_no_tone' });
    expect(s1.steps[3]).toEqual({ text: 'huyền', speech: 'huyền', type: 'tone' });
    expect(s1.steps[4]).toEqual({ text: 'bàn', speech: 'bàn', type: 'final' });
  });

  it('should generate spelling steps for words without onset', () => {
    const s = generateSpellingSteps('uống');
    expect(s.spellingText).toBe('uông - sắc - uống');
    expect(s.steps).toHaveLength(3);
    expect(s.steps[0]).toEqual({ text: 'uông', speech: 'uông', type: 'rhyme' });
    expect(s.steps[1]).toEqual({ text: 'sắc', speech: 'sắc', type: 'tone' });
    expect(s.steps[2]).toEqual({ text: 'uống', speech: 'uống', type: 'final' });
  });

  it('should generate spelling steps for words with special onset "gi"', () => {
    const s1 = generateSpellingSteps('gió');
    expect(s1.spellingText).toBe('giờ - o - gio - sắc - gió');
    
    const s2 = generateSpellingSteps('gìn');
    expect(s2.spellingText).toBe('giờ - in - gin - huyền - gìn');
  });

  it('should generate spelling steps for words with special onset "qu"', () => {
    const s = generateSpellingSteps('quả');
    expect(s.spellingText).toBe('quờ - a - qua - hỏi - quả');
  });

  it('should generate spelling steps for complex textbook words', () => {
    const s1 = generateSpellingSteps('xoong');
    expect(s1.spellingText).toBe('xờ - oong - xoong');

    const s2 = generateSpellingSteps('xuất');
    expect(s2.spellingText).toBe('xờ - uât - xuât - sắc - xuất');

    const s3 = generateSpellingSteps('khuỳnh');
    expect(s3.spellingText).toBe('khờ - uynh - khuynh - huyền - khuỳnh');

    const s4 = generateSpellingSteps('khuya');
    expect(s4.spellingText).toBe('khờ - uya - khuya');
  });
});

describe('Vietnamese Text Tokenizer', () => {
  it('should split text into words and punctuation tokens', () => {
    const tokens = tokenizeText('Bé vẽ con mèo, rất đáng yêu!');
    const words = tokens.filter(t => t.isWord).map(t => t.text);
    expect(words).toEqual(['Bé', 'vẽ', 'con', 'mèo', 'rất', 'đáng', 'yêu']);
    expect(tokens[7].text).toBe(', ');
    expect(tokens[7].isWord).toBe(false);
  });
});
