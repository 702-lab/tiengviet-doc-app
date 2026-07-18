export const COLORS = {
  // Brand colors
  primary: '#FF7F50',      // Coral orange - energetic & friendly
  secondary: '#4ECDC4',    // Soft teal
  accent: '#FFD166',       // Pastel yellow
  background: '#FCFBF7',   // Cream white - easy on kids' eyes
  darkBackground: '#121214',
  cardBg: '#FFFFFF',
  cardBgDark: '#1E1E24',
  text: '#2F3E46',         // Deep charcoal instead of pure black
  textDark: '#F4F5F6',
  muted: '#8D99AE',
  border: '#E2E8F0',

  // Visual Phonics colors (highly contrasting for cognitive learning)
  onset: '#E63946',        // Vibrant Red/Coral for Âm đầu
  rhyme: '#2A9D8F',        // Forest Green/Teal for Vần
  tone: '#457B9D',         // Ocean Blue for Thanh điệu
  
  // Highlight states (Karaoke styling)
  highlightBg: '#FFE5B4',   // Warm light orange for active syllable
  highlightText: '#E76F51', // Accent text color when active
  
  // Feedback
  success: '#70E000',
  error: '#D90429',
};

export type ThemeColors = typeof COLORS;
