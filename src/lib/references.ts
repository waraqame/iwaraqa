export interface Reference {
  authors: string[];
  year: string;
  title: string;
  source: string;
  type: 'book' | 'article' | 'journal' | 'website';
}

// Regex to match Arabic citations like (الخالدي، 2023) or (العمري والسعيد، 2024)
const CITATION_REGEX = /\(([\u0600-\u06FF\s]+(?:\sو\s[\u0600-\u06FF\s]+)?،\s*\d{4})\)/g;

export function extractCitations(text: string): string[] {
  if (!text) return [];
  const matches = text.match(CITATION_REGEX);
  return matches ? [...new Set(matches.map(m => m.slice(1, -1)))] : [];
}

export function collectReferences(sections: Record<string, string>): string[] {
  if (!sections) return [];
  
  const citations = new Set<string>();

  Object.entries(sections).forEach(([section, content]) => {
    if (section !== 'references' && content) {
      extractCitations(content).forEach(citation => citations.add(citation));
    }
  });

  return Array.from(citations);
}

export function formatInTextCitation(authors: string[], year: string): string {
  if (!authors?.length) return '';
  
  if (authors.length === 1) {
    return `(${authors[0]}، ${year})`;
  } else if (authors.length === 2) {
    return `(${authors[0]} و${authors[1]}، ${year})`;
  } else {
    return `(${authors[0]} وآخرون، ${year})`;
  }
}

export function formatReferencesList(references: Reference[]): string {
  if (!references?.length) return '';

  const validReferences = references.filter(ref => 
    ref?.authors?.length && ref.year && ref.title && ref.source
  );

  if (!validReferences.length) return '';

  try {
    return validReferences
      .sort((a, b) => {
        if (!a.authors?.[0] || !b.authors?.[0]) return 0;
        return a.authors[0].localeCompare(b.authors[0], 'ar');
      })
      .map(ref => {
        const authors = ref.authors.length > 1 
          ? `${ref.authors[0]} و${ref.authors.slice(1).join(' و')}`
          : ref.authors[0];

        switch (ref.type) {
          case 'book':
            return `${authors}. (${ref.year}). ${ref.title}. ${ref.source}.`;
          case 'article':
          case 'journal':
            return `${authors}. (${ref.year}). ${ref.title}. ${ref.source}.`;
          case 'website':
            return `${authors}. (${ref.year}). ${ref.title}. تم الاسترجاع من ${ref.source}`;
          default:
            return `${authors}. (${ref.year}). ${ref.title}. ${ref.source}.`;
        }
      })
      .join('\n\n');
  } catch (error) {
    console.error('Error formatting references:', error);
    return '';
  }
}

export function parseReference(citation: string): Partial<Reference> {
  if (!citation) return {};

  try {
    const match = citation.match(/([\u0600-\u06FF\s]+)،\s*(\d{4})/);
    if (!match) return {};

    const [_, authorPart, year] = match;
    const authors = authorPart.split(/\s*و\s*/).map(a => a.trim());

    return {
      authors,
      year
    };
  } catch (error) {
    console.error('Error parsing reference:', error);
    return {};
  }
}