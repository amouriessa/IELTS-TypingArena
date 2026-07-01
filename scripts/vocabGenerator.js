/**
 * Dual-Source IELTS Vocabulary Harvester
 * 
 * Run this script using Node.js: 'node scripts/vocabGenerator.js'
 * 
 * What this script does:
 * 1. Fetches B2 level words from the CEFR-J profile.
 * 2. Fetches C1/C2 level words from the Octanove profile.
 * 3. Integrates both sources, filters out clean words, and groups them:
 *    - B2 -> IELTS Band 6.0
 *    - C1 -> IELTS Band 7.0
 *    - C2 -> IELTS Band 8.0+
 * 4. Samples a manageable amount from each (e.g. 15 words per band) to prevent API blocks.
 * 5. Queries Dictionary API for definitions, IPA, and sentences.
 * 6. Saves the compiled list to 'src/data/ieltsVocabularyExpanded.json'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Two separate sources on GitHub
const CEFR_J_URL = 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv';
const OCTANOVE_C1C2_URL = 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/octanove-vocabulary-profile-c1c2-1.0.csv';

const cefrToBand = { 'B2': '6.0', 'C1': '7.0', 'C2': '8.0+' };
const categories = { 'B2': 'General Academic', 'C1': 'Advanced Writing', 'C2': 'Lexical Mastery' };

async function fetchCSV(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download from ${url}. Status: ${response.status}`);
  }
  return await response.text();
}

function parseCEFRJ(csvText) {
  const lines = csvText.split('\n');
  const words = [];
  // Columns: headword,pos,CEFR,...
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length >= 3) {
      const word = cols[0].trim().toLowerCase();
      const pos = cols[1].trim().toLowerCase();
      const cefr = cols[2].trim().toUpperCase();

      if (cefr === 'B2' && /^[a-zA-Z]+$/.test(word) && word.length > 3) {
        words.push({ word, pos, cefr: 'B2' });
      }
    }
  }
  return words;
}

function parseOctanove(csvText) {
  const lines = csvText.split('\n');
  const words = [];
  // Columns: headword,pos,CEFR,notes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length >= 3) {
      const word = cols[0].trim().toLowerCase();
      const pos = cols[1].trim().toLowerCase();
      const cefr = cols[2].trim().toUpperCase();

      if ((cefr === 'C1' || cefr === 'C2') && /^[a-zA-Z]+$/.test(word) && word.length > 3) {
        words.push({ word, pos, cefr });
      }
    }
  }
  return words;
}

function getRandomSample(array, sampleSize) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}

async function fetchWordDetails(wordObj) {
  const { word, pos, cefr } = wordObj;
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const entry = data[0];
    if (!entry) return null;

    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || `/${word}/`;
    let meaning = entry.meanings.find(m => m.partOfSpeech.toLowerCase() === pos) || entry.meanings[0];
    if (!meaning) return null;

    const definition = meaning.definitions[0]?.definition || "Definition not available.";
    let example = meaning.definitions[0]?.example;
    if (!example) {
      example = `The correct implementation and understanding of "${word}" is highly valued in IELTS writing tasks.`;
    }

    return {
      word: word,
      ipa: phonetic,
      type: meaning.partOfSpeech,
      definition: definition,
      example: example,
      band: cefrToBand[cefr],
      category: categories[cefr]
    };
  } catch (error) {
    return null;
  }
}

async function run() {
  try {
    // 1. Download datasets
    const cefrjText = await fetchCSV(CEFR_J_URL);
    const octanoveText = await fetchCSV(OCTANOVE_C1C2_URL);

    // 2. Parse & group words
    const b2Words = parseCEFRJ(cefrjText);
    const c1c2Words = parseOctanove(octanoveText);

    const c1Words = c1c2Words.filter(w => w.cefr === 'C1');
    const c2Words = c1c2Words.filter(w => w.cefr === 'C2');

    console.log(`\nSuccessfully downloaded and parsed candidates:`);
    console.log(`- B2 (Band 6.0): ${b2Words.length} words`);
    console.log(`- C1 (Band 7.0): ${c1Words.length} words`);
    console.log(`- C2 (Band 8.0+): ${c2Words.length} words`);

    // 3. Take random samples (15 per level)
    const sampleSize = 15;
    const selectedList = [
      ...getRandomSample(b2Words, sampleSize),
      ...getRandomSample(c1Words, sampleSize),
      ...getRandomSample(c2Words, sampleSize)
    ];

    console.log(`\nSelected ${selectedList.length} random sample words for dictionary validation.`);
    console.log("Querying Dictionary API (running sequential checks to prevent rate limits)...");

    const resultList = [];

    for (const item of selectedList) {
      console.log(`-> Fetching details for: "${item.word}" (POS: ${item.pos}, Level: ${item.cefr})...`);
      const details = await fetchWordDetails(item);
      if (details) {
        resultList.push(details);
      }
      // Wait 800ms between calls
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const outputPath = path.join(__dirname, '../src/data/ieltsVocabularyExpanded.json');
    fs.writeFileSync(outputPath, JSON.stringify(resultList, null, 2));

    console.log(`\n🎉 Pipeline completed successfully! Harvested ${resultList.length} words.`);
    console.log(`Expanded dataset stored at: ${outputPath}`);
  } catch (error) {
    console.error("Pipeline failed with error:", error.message);
  }
}

run();
