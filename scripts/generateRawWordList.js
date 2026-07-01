/**
 * Raw IELTS Words Harvester
 * 
 * Run this script: 'node scripts/generateRawWordList.js'
 * 
 * This script runs INSTANTLY because it doesn't query any dictionary APIs.
 * It simply downloads the open-source CEFR-J and Octanove databases, filters
 * them for B2, C1, and C2 words, and dumps all 4,600+ words into a clean, lightweight JSON.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length >= 3) {
      const word = cols[0].trim().toLowerCase();
      const pos = cols[1].trim().toLowerCase();
      const cefr = cols[2].trim().toUpperCase();

      if (cefr === 'B2' && /^[a-zA-Z]+$/.test(word) && word.length > 3) {
        words.push({
          word,
          type: pos,
          band: cefrToBand[cefr],
          category: categories[cefr]
        });
      }
    }
  }
  return words;
}

function parseOctanove(csvText) {
  const lines = csvText.split('\n');
  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',');
    if (cols.length >= 3) {
      const word = cols[0].trim().toLowerCase();
      const pos = cols[1].trim().toLowerCase();
      const cefr = cols[2].trim().toUpperCase();

      if ((cefr === 'C1' || cefr === 'C2') && /^[a-zA-Z]+$/.test(word) && word.length > 3) {
        words.push({
          word,
          type: pos,
          band: cefrToBand[cefr],
          category: categories[cefr]
        });
      }
    }
  }
  return words;
}

async function run() {
  try {
    console.log("Starting instant raw word harvest...");
    
    // Download raw CSV files
    const cefrjText = await fetchCSV(CEFR_J_URL);
    const octanoveText = await fetchCSV(OCTANOVE_C1C2_URL);

    // Parse files
    const b2Words = parseCEFRJ(cefrjText);
    const c1c2Words = parseOctanove(octanoveText);

    // Combine them
    const allWords = [...b2Words, ...c1c2Words];

    // Filter out duplicates (sometimes a word has multiple parts of speech, we take the first)
    const uniqueWordsMap = new Map();
    allWords.forEach(item => {
      if (!uniqueWordsMap.has(item.word)) {
        uniqueWordsMap.set(item.word, item);
      }
    });

    const uniqueWordsList = Array.from(uniqueWordsMap.values());
    const outputPath = path.join(__dirname, '../src/data/ieltsWordsRaw.json');
    
    fs.writeFileSync(outputPath, JSON.stringify(uniqueWordsList, null, 2));

    console.log(`\n🎉 Success! Harvested ${uniqueWordsList.length} unique IELTS vocabulary words.`);
    console.log(`- Band 6.0 (B2): ${b2Words.length} words`);
    console.log(`- Band 7.0 / 8.0+ (C1/C2): ${c1c2Words.length} words`);
    console.log(`Saved raw wordlist to: ${outputPath}`);
  } catch (error) {
    console.error("Harvesting failed:", error.message);
  }
}

run();
