# 📚 Vietnamese Phonics & Reading Assistant (tiengviet-doc-app)

> A cross-platform (iOS & Android) mobile application built with React Native and Expo, designed to help 1st-grade children master Vietnamese spelling, syllables, and pronunciation. Features regional dialect options (Northern & Southern accents) and interactive visual aids for children with special education needs (hearing-impaired or language-delayed).

---

## 🌟 Core Features

1. **Vietnamese Phonics Engine:**
   * Automatically parses any Vietnamese word into its constituent linguistic components: **Onset (Âm đầu)**, **Rhyme (Phần vần)**, and **Tone (Thanh điệu)**.
   * Generates step-by-step spelling cues matching primary school teaching pedagogy (e.g., `bàn` $\rightarrow$ *bờ - an - ban - huyền - bàn*).
2. **Karaoke-Style Text Syncing:**
   * Highlights specific syllables and letters in real-time as they are being read out loud.
3. **AI Pronunciation Assessment (STT):**
   * Uses local microphone recording to evaluate user speech.
   * Implements a **Longest Common Subsequence (LCS)** word alignment algorithm to highlight correctly read words in green and mispronounced or skipped words in red.
   * Includes a high-fidelity parent simulator popup for dry-run testing (100% correct, minor mistakes, major mistakes) without requiring live speaking.
4. **Regional Dialect Toggle:**
   * Supports accent-specific spelling rules for Northern and Southern dialects (e.g., the letter `v` is spelled as "vờ" in the North but pronounced as "dờ" in the South; the letter `r` is spelled as "rờ" in the North but pronounced as "gờ" in the South).
   * Automatically routes TTS to native Northern or Southern system voices.
5. **Special Education Visual Aids:**
   * **VisualPhonics:** Displays 3 color-coded cards indicating Onset (Red), Rhyme (Green), and Tone (Blue) to break down syllables visually.
   * **Mouth & Hand Sign SVGs:** Programmatically renders lip positions (closed, wide open, semi-open, smiling, rounded) and VSL (Vietnamese Sign Language) finger-spelling outlines for all 29 Vietnamese letters.
6. **Polished Neumorphic Theme Customization:**
   * Features clean, rounded neumorphic cards with soft drop shadows.
   * Supports a system-wide Dark Mode toggle in the header of all screens to reduce eye strain during evening study sessions.

---

## 🛠️ Technology Stack

* **Core Framework:** React Native with **Expo SDK 54** (TypeScript).
* **Audio & Speech:** `expo-speech` (Text-to-Speech) and `expo-av` (Microphone recording).
* **Vector Graphics:** `react-native-svg` (used for rendering hand signs and mouth configurations).
* **Testing:** **Vitest** (Unit, Integration, and E2E simulation testing).

---

## 📂 Project Structure

```text
tiengviet-doc-app/
├── App.tsx                  # Application entry point & screen router
├── CLAUDE.md                # Agent developer guide (commands & workflow)
├── README.md                # This user guide & technical documentation
├── package.json             # NPM dependencies list
├── src/
│   ├── components/          # Reusable UI Components
│   │   ├── ControlPanel.tsx # Speed, playback mode, and dialect controls
│   │   ├── HandSignSvg.tsx  # Renders VSL sign language vector hands
│   │   ├── KaraokeText.tsx  # Handles karaoke highlighting and red/green results
│   │   ├── MouthSvg.tsx     # Renders mouth position vector drawings
│   │   ├── PracticePanel.tsx# Microphone recorder and AI STT interface
│   │   ├── SignLanguage.tsx # Main wrapper for visual assistive aids
│   │   └── VisualPhonics.tsx# Color-coded syllable breakdown component
│   ├── context/
│   │   └── ReaderContext.tsx# Core React context managing audio & playback loops
│   ├── screens/
│   │   ├── HomeScreen.tsx   # Text input screen with sample readings
│   │   └── ReaderScreen.tsx # Interactive room screen for practice
│   ├── services/
│   │   ├── audioManager.ts  # Promise wrapper for expo-speech TTS
│   │   └── phonicsEngine.ts # Primary linguistic parser & syllable tokenizer
│   └── theme/
│       └── colors.ts        # Pastel light/dark mode color palettes
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Requires Node.js $\ge$ 18. Execute the following command in the project root directory:
```bash
npm install
```

### 2. Run the Application

#### Option A: Run on a Physical Device (Recommended)
1. Start the Expo development server:
   ```bash
   npx expo start --tunnel
   ```
   *Note: The `--tunnel` flag enables connecting your physical mobile device over the internet, bypassing local network/Wi-Fi restrictions.*
2. Download the free **Expo Go** app from the App Store (iOS) or Google Play Store (Android).
3. Scan the QR code displayed in your terminal using your phone camera to load and run the app.

#### Option B: Run in a Web Browser
1. Start the web development server:
   ```bash
   npx expo start --web
   ```
2. The browser will automatically open to `http://localhost:8081`.

---

## 🧪 Testing Guide

We use **Vitest** for unit, integration, and end-to-end (E2E) simulation testing.

* **Execute the entire test suite:**
  ```bash
  npm run test
  ```
* **Run static TypeScript compilation check:**
  ```bash
  npx tsc --noEmit
  ```
