import { useState } from 'react';
import { saveAs } from 'file-saver';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  PageOrientation, 
  convertInchesToTwip, 
  AlignmentType,
  LevelFormat,
  NumberFormat,
  UnderlineType,
  IBulletOptions
} from 'docx';

interface Section {
  title: string;
  content: string;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processContent = (content: string) => {
    const paragraphs: Paragraph[] = [];
    const lines = content.split('\n\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if the line is a bullet point
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        const bulletText = trimmedLine.substring(1).trim();
        paragraphs.push(
          new Paragraph({
            text: bulletText,
            bullet: {
              level: 0
            },
            spacing: {
              before: 120,
              after: 120,
              line: 360
            },
            style: {
              paragraph: {
                spacing: { line: 360 },
                alignment: AlignmentType.RIGHT
              },
              run: {
                size: 24,
                font: "Traditional Arabic"
              }
            },
            bidirectional: true
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            text: trimmedLine,
            spacing: {
              before: 120,
              after: 120
            },
            style: {
              paragraph: {
                spacing: { line: 360 },
                alignment: AlignmentType.RIGHT
              },
              run: {
                size: 24,
                font: "Traditional Arabic"
              }
            },
            bidirectional: true
          })
        );
      }
    });

    return paragraphs;
  };

  const exportDocument = async (
    format: 'pdf' | 'docx',
    sections: Section[],
    title: string,
    author: string
  ) => {
    try {
      setIsExporting(true);
      setError(null);

      if (format === 'pdf') {
        throw new Error('صيغة PDF غير متاحة حالياً');
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT,
                width: convertInchesToTwip(8.27), // A4 width
                height: convertInchesToTwip(11.69), // A4 height
              },
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              }
            },
            rtl: true,
            bidi: true
          },
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  size: 32,
                  bold: true,
                  font: "Traditional Arabic"
                })
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 240,
                after: 240,
              },
              bidirectional: true
            }),

            // Author
            new Paragraph({
              children: [
                new TextRun({
                  text: `إعداد: ${author}`,
                  size: 24,
                  font: "Traditional Arabic"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 240,
                after: 480,
              },
              bidirectional: true
            }),

            // Page Break
            new Paragraph({
              text: '',
              pageBreakBefore: true,
            }),

            // Sections
            ...sections.flatMap((section) => [
              // Section Title
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.title,
                    size: 28,
                    bold: true,
                    font: "Traditional Arabic"
                  })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: {
                  before: 240,
                  after: 120,
                },
                alignment: AlignmentType.RIGHT,
                bidirectional: true
              }),

              // Section Content
              ...processContent(section.content),

              // Page break after each section except the last one
              ...(section !== sections[sections.length - 1] ? [
                new Paragraph({
                  text: '',
                  pageBreakBefore: true,
                })
              ] : [])
            ]),
          ],
        }],
        numbering: {
          config: [
            {
              reference: "bullet-points",
              levels: [
                {
                  level: 0,
                  format: LevelFormat.BULLET,
                  text: "•",
                  alignment: AlignmentType.RIGHT,
                  style: {
                    paragraph: {
                      indent: { left: 720, hanging: 360 }
                    }
                  }
                }
              ]
            }
          ]
        },
        styles: {
          default: {
            document: {
              run: {
                font: "Traditional Arabic",
              }
            }
          },
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Traditional Arabic",
                size: 24,
              },
              paragraph: {
                spacing: { line: 360 },
                alignment: AlignmentType.RIGHT,
                bidirectional: true
              }
            }
          ]
        }
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title}.${format}`);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'فشل في تصدير المستند');
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportDocument,
    isExporting,
    error
  };
}