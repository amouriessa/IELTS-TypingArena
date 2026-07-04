// Translation helper function
export const translateText = async (text) => {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`);
    if (!res.ok) return '';
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('').trim();
    }
    return '';
  } catch (e) {
    return '';
  }
};

// Fetch word details and translate them
export const fetchWordDetails = async (word, type) => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) {
      throw new Error('Word details not found in Dictionary API');
    }
    const data = await res.json();
    const entry = data[0];
    const ipaText = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || `/${word}/`;
    
    const meaning = entry.meanings.find(m => m.partOfSpeech.toLowerCase() === type.toLowerCase()) || entry.meanings[0];
    const def = meaning?.definitions[0]?.definition || "Definition not available.";
    const ex = meaning?.definitions[0]?.example || `Understanding the term "${word}" is highly beneficial for academic IELTS essays.`;

    const newDetails = { ipa: ipaText, definition: def, example: ex };

    // Fetch translations
    let definitionId = '';
    let exampleId = '';
    let wordId = '';
    try {
      // Translate word individually to prevent context leakage (e.g. devote -> mendedikasikan, not menahbiskan)
      wordId = await translateText(word);

      // Translate definition and example usage
      const qText = `${def} | ${ex}`;
      const translationRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(qText)}`);
      if (translationRes.ok) {
        const translationData = await translationRes.json();
        if (translationData && translationData[0]) {
          const fullTranslation = translationData[0].map(item => item[0]).join('');
          const parts = fullTranslation.split('|');
          definitionId = parts[0]?.trim() || '';
          exampleId = parts[1]?.trim() || '';
        }
      }

      // Individual fallback translates if combined split failed
      if (!definitionId) definitionId = await translateText(def);
      if (!exampleId) exampleId = await translateText(ex);
    } catch (transErr) {
      console.error("Translation error:", transErr);
    }

    return {
      ...newDetails,
      definitionId,
      exampleId,
      wordId
    };
  } catch (err) {
    // Fallback definitions if API fails or offline
    const fallbackDetails = {
      ipa: `/${word}/`,
      definition: `An academic vocabulary word commonly utilized in high-level contexts.`,
      example: `Developing a strong understanding of "${word}" is highly valued in formal writing tasks.`
    };

    // Try to translate fallbacks in background
    let definitionId = '';
    let exampleId = '';
    let wordId = '';
    try {
      wordId = await translateText(word);
      const fDef = fallbackDetails.definition;
      const fEx = fallbackDetails.example;
      const qText = `${fDef} | ${fEx}`;
      const translationRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(qText)}`);
      if (translationRes.ok) {
        const translationData = await translationRes.json();
        if (translationData && translationData[0]) {
          const fullTranslation = translationData[0].map(item => item[0]).join('');
          const parts = fullTranslation.split('|');
          definitionId = parts[0]?.trim() || '';
          exampleId = parts[1]?.trim() || '';
        }
      }

      if (!definitionId) definitionId = await translateText(fDef);
      if (!exampleId) exampleId = await translateText(fEx);
    } catch (transErr) {
      // ignore
    }

    return {
      ...fallbackDetails,
      definitionId,
      exampleId,
      wordId
    };
  }
};
