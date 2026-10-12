import * as mammoth from 'mammoth';

/**
 * Extracts raw plain text from an uploaded File (PDF, DOCX, TXT)
 * @param {File} file 
 * @param {Function} onProgress 
 * @returns {Promise<{ text: string, metadata: { pageCount?: number, wordCount: number, fileName: string, fileType: string } }>}
 */
export async function extractTextFromFile(file, onProgress = () => {}) {
  if (!file) {
    throw new Error('No file provided for text extraction.');
  }

  const fileName = file.name;
  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  if (file.size === 0) {
    throw new Error(`The file "${fileName}" is completely empty (0 bytes). Please upload a valid document.`);
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error(`The file "${fileName}" is ${fileSizeMB} MB, which exceeds the 25 MB limit.`);
  }

  onProgress({ stage: 'reading', percent: 15, message: `Reading "${fileName}" (${fileSizeMB} MB)...` });

  let extractedText = '';
  let pageCount = undefined;

  try {
    if (fileExt === '.txt') {
      extractedText = await extractFromTxt(file, onProgress);
    } else if (fileExt === '.docx') {
      extractedText = await extractFromDocx(file, onProgress);
    } else if (fileExt === '.pdf') {
      const pdfResult = await extractFromPdf(file, onProgress);
      extractedText = pdfResult.text;
      pageCount = pdfResult.pageCount;
    } else if (fileExt === '.doc') {
      throw new Error(`Older .doc format is not directly supported. Please save your document as a modern .docx or .pdf file and re-upload.`);
    } else {
      throw new Error(`Unsupported file format "${fileExt}". Please upload a .pdf, .docx, or .txt file.`);
    }
  } catch (err) {
    if (err.message.includes('Scanned') || err.message.includes('Unsupported') || err.message.includes('empty')) {
      throw err;
    }
    throw new Error(`Failed to read "${fileName}": ${err.message || 'File may be corrupted or password-protected.'}`);
  }

  const cleanedText = cleanText(extractedText);
  const wordCount = cleanedText.trim().split(/\s+/).filter(Boolean).length;

  onProgress({ stage: 'analyzing', percent: 90, message: `Extracted ${wordCount} words. Preparing cards...` });

  if (wordCount < 10) {
    if (fileExt === '.pdf') {
      throw new Error(
        `No readable text was found in this PDF (${wordCount} words detected). This usually happens with scanned or image-based PDFs without an embedded text layer. Please try an exported text-based PDF, DOCX, or TXT file!`
      );
    }
    throw new Error(`The document "${fileName}" contains too little text (${wordCount} words) to generate meaningful study flashcards.`);
  }

  onProgress({ stage: 'complete', percent: 100, message: `Successfully extracted ${wordCount} words!` });

  return {
    text: cleanedText,
    metadata: {
      fileName,
      fileType: fileExt.replace('.', '').toUpperCase(),
      fileSize: `${fileSizeMB} MB`,
      wordCount,
      pageCount,
    },
  };
}

/**
 * Extract text from plain text file
 */
function extractFromTxt(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      onProgress({ stage: 'extracting', percent: 70, message: 'Processing text content...' });
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('Unable to read text file. It may be corrupted or unreadable.'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Extract text from DOCX using mammoth
 */
async function extractFromDocx(file, onProgress) {
  onProgress({ stage: 'extracting', percent: 40, message: 'Parsing Microsoft Word document structures...' });
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await mammoth.extractRawText({ arrayBuffer });
  if (result.messages && result.messages.length > 0) {
    console.warn('Mammoth warnings:', result.messages);
  }
  return result.value || '';
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractFromPdf(file, onProgress) {
  onProgress({ stage: 'extracting', percent: 30, message: 'Loading PDF document...' });
  const arrayBuffer = await file.arrayBuffer();

  // Dynamically import pdfjs-dist and worker
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

  // Configure worker
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const currentPercent = Math.min(85, Math.round(30 + ((i / numPages) * 55)));
    onProgress({
      stage: 'extracting',
      percent: currentPercent,
      message: `Extracting page ${i} of ${numPages}...`,
    });

    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map((item) => item.str).join(' ');
      fullText += pageStrings + '\n\n';
    } catch (pageErr) {
      console.warn(`Error reading page ${i}:`, pageErr);
    }
  }

  return { text: fullText, pageCount: numPages };
}

/**
 * Clean up text by normalizing whitespace, tabs, and line endings
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
