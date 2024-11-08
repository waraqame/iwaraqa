// APA citation format for Arabic references
export const CITATION_FORMAT = {
  book: {
    arabic: '{{authors}}. ({{year}}). {{title}}. {{publisher}}.',
    example: 'العمري، محمد. (2023). الذكاء الاصطناعي في التعليم العالي. دار المعرفة.'
  },
  journal: {
    arabic: '{{authors}}. ({{year}}). {{title}}. {{journal}}, {{volume}}({{issue}}), {{pages}}.',
    example: 'الخالدي، أحمد والسعيد، فاطمة. (2024). تطبيقات الذكاء الاصطناعي في التعليم عن بعد. المجلة العربية للتعليم الإلكتروني, 5(2), 45-67.'
  },
  conference: {
    arabic: '{{authors}}. ({{year}}, {{month}}). {{title}}. {{conference}}, {{location}}.',
    example: 'الحربي، سارة. (2023، مارس). تحديات دمج الذكاء الاصطناعي في التعليم العالي. المؤتمر الدولي للتعليم الرقمي، الرياض.'
  },
  website: {
    arabic: '{{authors}}. ({{year}}). {{title}}. {{website}}. {{url}}',
    example: 'وزارة التعليم السعودية. (2024). استراتيجية التحول الرقمي في التعليم العالي. https://example.com'
  }
};

export interface Reference {
  id: string;
  type: keyof typeof CITATION_FORMAT;
  authors: string[];
  year: number;
  title: string;
  source: string;
  url?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  location?: string;
  month?: string;
  conference?: string;
}

export function formatReference(ref: Reference): string {
  const format = CITATION_FORMAT[ref.type].arabic;
  const authors = ref.authors.length > 2 
    ? `${ref.authors[0]} وآخرون`
    : ref.authors.join(' و');

  let formatted = format
    .replace('{{authors}}', authors)
    .replace('{{year}}', ref.year.toString())
    .replace('{{title}}', ref.title);

  switch (ref.type) {
    case 'book':
      formatted = formatted.replace('{{publisher}}', ref.publisher || '');
      break;
    case 'journal':
      formatted = formatted
        .replace('{{journal}}', ref.source)
        .replace('{{volume}}', ref.volume || '')
        .replace('{{issue}}', ref.issue || '')
        .replace('{{pages}}', ref.pages || '');
      break;
    case 'conference':
      formatted = formatted
        .replace('{{month}}', ref.month || '')
        .replace('{{conference}}', ref.conference || '')
        .replace('{{location}}', ref.location || '');
      break;
    case 'website':
      formatted = formatted
        .replace('{{website}}', ref.source)
        .replace('{{url}}', ref.url || '');
      break;
  }

  return formatted;
}

export function formatInTextCitation(ref: Reference): string {
  const authors = ref.authors.length > 2 
    ? `${ref.authors[0]} وآخرون`
    : ref.authors.join(' و');
  
  return `(${authors}، ${ref.year})`;
}

export function sortReferences(refs: Reference[]): Reference[] {
  return [...refs].sort((a, b) => {
    // Sort by first author's last name
    const aName = a.authors[0].split(' ').pop() || '';
    const bName = b.authors[0].split(' ').pop() || '';
    return aName.localeCompare(bName, 'ar');
  });
}