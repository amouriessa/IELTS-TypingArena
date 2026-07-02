# IELTS Typing Arena 🏆 Keyboard Prep & Vocabulary Booster

An interactive, premium web-based 10-finger touch typing application designed specifically for **computer-delivered IELTS** preparation. This application combines tactile typing speed/accuracy training with advanced academic vocabulary acquisition (Bands 6.0, 7.0, and 8.0+).

---

## 🎯 Project Objectives

In the computer-delivered IELTS exam, writing essays quickly and with high accuracy under strict time limits is crucial. 

This project aims to help candidates:
1. **Master Touch Typing:** Build tactile muscle memory for QWERTY layouts so writing essays becomes fluid, instinctive, and typo-free.
2. **Internalize Academic Vocabulary:** Actively type, read, and listen to high-frequency academic words, solidifying their spelling, phonetic structure, definitions, and usage context.
3. **Boost IELTS Writing Scores:** By training on specialized word lists, candidates naturally incorporate advanced grammar and precise vocabulary into their actual writing.

---

## 📊 Data Sourcing: CEFR-J & Octanove

The vocabulary lists used in this application are compiled from open-source academic language databases:
* **CEFR-J Vocabulary Profile (B2 Level):** Mapped to **IELTS Band 6.0**.
* **Octanove Vocabulary Profile (C1 Level):** Mapped to **IELTS Band 7.0**.
* **Octanove Vocabulary Profile (C2 Level):** Mapped to **IELTS Band 8.0+**.

### Data Generation Scripts
Inside the `scripts/` folder, you'll find the automation scripts:
* [generateRawWordList.js](file:///d:/Project/Typing-Web/scripts/generateRawWordList.js) & [vocabGenerator.js](file:///d:/Project/Typing-Web/scripts/vocabGenerator.js): These fetch the original CSV databases from the [openlanguageprofiles/olp-en-cefrj](https://github.com/openlanguageprofiles/olp-en-cefrj) GitHub repository, parse the entries, clean up raw symbols, categorize them by levels, and export them into JSON files under `src/data/`.

---

## ✨ Key Features

### 1. 🗂️ Targeted IELTS Bands Filtering
Filter training sessions based on vocabulary proficiency goals:
* **All Bands:** The complete set of academic words.
* **Band 6.0:** Upper-intermediate level vocabulary.
* **Band 7.0:** Advanced words to enrich essay arguments and cohesion.
* **Band 8.0+:** Mastery-level terminology for securing the highest bands.

### 2. 🎹 Visual QWERTY Keyboard Guide
* Features a color-coded virtual keyboard illustrating standard touch-typing zones.
* Highlights the next required key (*Target Key*) and coordinates it with a hands-visualizer panel showcasing the specific finger to use (*Active Finger*).
* Helps transition to pure touch typing without looking down at physical keys.

### 3. 🔊 Synthesized Mechanical Key Sounds (Web Audio API)
* Uses the browser's **Web Audio API** to synthesize realistic mechanical switch acoustics on-the-fly. No heavy audio assets or MP3 files to download.
* Selectable acoustic profiles:
  * **Tactile Brown Switches:** Classic tactile feedback clicks.
  * **Blue Mechanical Switches:** Clicky, loud, tactile mechanical profile.
  * **Bubble Pop Feedback:** Playful, rounded pop feedback.
* Features error buzzer audio feedback when a typo occurs.

### 4. 📖 On-The-Fly Dictionary & TTS Pronunciation Helper
* Fetches International Phonetic Alphabet (IPA) transcriptions, definitions, and contextual usage examples dynamically using the **Free Dictionary API**.
* **TTS (Text-to-Speech):** Reads out the current word as you type to train audio-visual recognition.
* Automatically switches to a localized offline cache mode if the network or API is offline.

### 5. ⚡ Real-Time Statistics & Review Dashboard
* Tracks Live WPM (Words Per Minute), time remaining, and progress live in the header.
* **Result Screen Analytics:** Provides speed metrics (Net WPM, Raw WPM), accuracy percentage, and mistake breakdowns.
* **Interactive Review List:** Shows correctly typed and mistyped words. Expand any word to view its definition, pronunciation spelling, and example context.
* Celebrates excellent attempts (WPM ≥ 30 and Accuracy ≥ 90%) with synthesized chime arpeggios and confetti animations.

### 6. 🔄 Smart Review Mode (Practice Missed Words)
* At the end of a session, if you made mistakes, you can enter a targeted training session focusing exclusively on the words you mistyped.

### 7. 🏆 Local Leaderboard
* Stores your top 5 personal best scores inside the browser's `localStorage`, logging WPM, Accuracy, Band level, duration, and date.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 & Vite
* **Styling:** Tailwind CSS v4 (responsive design, custom glassmorphism)
* **Icons:** Lucide React
* **Effects:** Canvas Confetti (particle celebration)
* **Audio Synthesis:** Web Audio API (real-time synthesized waves)
* **Data Sources:** CEFR-J & Octanove profiles via free Dictionary API

---

## 🚀 Live Demo

This project is deployed on Vercel. You can access the live application using the link below:

🔗 https://ssa-ielts-typing-arena.vercel.app/

---
