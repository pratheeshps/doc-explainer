// Split each page into overlapping chunks, keeping the page number for citations.
export function chunkPages(pages, size = 1200, overlap = 200) {
  const out = [];

  pages.forEach((raw, i) => {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) return;

    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + size, text.length);
      if (end < text.length) {
        // Prefer to cut at a sentence boundary.
        const cut = text.lastIndexOf('. ', end);
        if (cut > start + size * 0.5) end = cut + 1;
      }
      out.push({ page: i + 1, text: text.slice(start, end).trim() });
      if (end >= text.length) break;
      start = end - overlap;
    }
  });

  return out;
}
