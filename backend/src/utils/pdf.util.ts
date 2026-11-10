import PDFDocument from "pdfkit";
import katex from "katex";
import SVGtoPDF from "svg-to-pdfkit";

interface GeneratePdfInput {
  title?: string;
  content: string;
}

type PdfLineType =
  | "title"
  | "heading"
  | "subheading"
  | "paragraph"
  | "bullet"
  | "numbered"
  | "formula"
  | "code"
  | "spacer";

interface PdfLine {
  type: PdfLineType;
  text: string;
  level?: number;
  number?: number;
}

const parseMarkdown = (content: string): PdfLine[] => {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const parsed: PdfLine[] = [];

  let insideCodeBlock = false;
  let insideFormulaBlock = false;
  let formulaDelimiter: "\\[" | "$$" | null = null;
  let formulaLines: string[] = [];

  for (const rawLine of lines) {
    const originalLine = rawLine.replace(/\t/g, "    ");
    const trimmedLine = originalLine.trim();

    if (!insideCodeBlock && !insideFormulaBlock) {
      if (trimmedLine === "\\[" || trimmedLine === "$$") {
        insideFormulaBlock = true;
        formulaDelimiter = trimmedLine as "\\[" | "$$";
        formulaLines = [];

        continue;
      }
    }

    if (insideFormulaBlock) {
      const closingDelimiter = formulaDelimiter === "\\[" ? "\\]" : "$$";

      if (trimmedLine === closingDelimiter) {
        parsed.push({
          type: "formula",
          text: formulaLines.join(" ").trim(),
        });

        insideFormulaBlock = false;
        formulaDelimiter = null;
        formulaLines = [];

        continue;
      }

      formulaLines.push(trimmedLine);

      continue;
    }

    if (/^```/.test(trimmedLine)) {
      insideCodeBlock = !insideCodeBlock;

      if (insideCodeBlock) {
        parsed.push({
          type: "spacer",
          text: "",
        });
      }

      continue;
    }

    if (insideCodeBlock) {
      parsed.push({
        type: "code",
        text: originalLine,
      });

      continue;
    }

    if (!trimmedLine) {
      parsed.push({
        type: "spacer",
        text: "",
      });

      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1]!.length;

      if (level === 1) {
        parsed.push({
          type: "title",
          text: headingMatch[2]!.trim(),
        });
      } else if (level === 2) {
        parsed.push({
          type: "heading",
          text: headingMatch[2]!.trim(),
        });
      } else {
        parsed.push({
          type: "subheading",
          text: headingMatch[2]!.trim(),
          level,
        });
      }

      continue;
    }

    const bulletMatch = originalLine.match(/^(\s*)[-*+]\s+(.+)$/);

    if (bulletMatch) {
      const indentation = bulletMatch[1]!.length;

      parsed.push({
        type: "bullet",
        text: bulletMatch[2]!.trim(),
        level: Math.floor(indentation / 2),
      });

      continue;
    }

    const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);

    if (numberedMatch) {
      parsed.push({
        type: "numbered",
        number: Number(numberedMatch[1]),
        text: numberedMatch[2]!.trim(),
      });

      continue;
    }

    if (isFormula(trimmedLine)) {
      parsed.push({
        type: "formula",
        text: cleanFormula(trimmedLine),
      });

      continue;
    }

    parsed.push({
      type: "paragraph",
      text: trimmedLine,
    });
  }

  return parsed;
};

const isFormula = (text: string): boolean => {
  if (/^\\\[/.test(text) && /\\\]$/.test(text)) {
    return true;
  }

  if (/^\$\$/.test(text) && /\$\$$/.test(text)) {
    return true;
  }

  if (/^\$/.test(text) && /\$$/.test(text)) {
    return true;
  }

  if (/[Δ∑∫√∞≈≤≥∂∇±×÷≠]/.test(text)) {
    return true;
  }

  if (
    /\\(mathrm|frac|sum|int|sqrt|mu|Delta|partial|nabla|alpha|beta|gamma)\b/.test(
      text,
    ) &&
    /[=+\-*/^_{}]/.test(text)
  ) {
    return true;
  }

  if (/\b[A-Za-zΔ]+\s*[=<>]\s*.+/.test(text) && /[0-9]/.test(text)) {
    return true;
  }

  return false;
};

const cleanFormula = (text: string): string => {
  return text
    .replace(/^\\\[/, "")
    .replace(/\\\]$/, "")
    .replace(/^\$\$/, "")
    .replace(/\$\$$/, "")
    .replace(/^\$/, "")
    .replace(/\$$/, "")
    .trim();
};

const stripMarkdownFormatting = (text: string): string => {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")

    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")

    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")

    .replace(/`([^`]+)`/g, "$1")

    .trim();
};

const addPageNumber = (document: PDFKit.PDFDocument, pageNumber: number) => {
  const pageWidth =
    document.page.width -
    document.page.margins.left -
    document.page.margins.right;

  document
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text(
      `NoteGenius • Page ${pageNumber}`,
      document.page.margins.left,
      document.page.height - 35,
      {
        align: "center",
        width: pageWidth,
      },
    );

  document.fillColor("#000000");
};

const addTitle = (document: PDFKit.PDFDocument, text: string) => {
  document
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#111111")
    .text(stripMarkdownFormatting(text), {
      align: "center",
      lineGap: 4,
    });

  document.moveDown(1);
};

const addHeading = (document: PDFKit.PDFDocument, text: string) => {
  document.moveDown(0.65);

  document
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#111111")
    .text(stripMarkdownFormatting(text));

  document.moveDown(0.3);
};

const addSubheading = (document: PDFKit.PDFDocument, text: string) => {
  document.moveDown(0.4);

  document
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#222222")
    .text(stripMarkdownFormatting(text));

  document.moveDown(0.2);
};

const addParagraph = (document: PDFKit.PDFDocument, text: string) => {
  document
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#222222")
    .text(stripMarkdownFormatting(text), {
      align: "left",
      lineGap: 3,
    });

  document.moveDown(0.3);
};

const addBullet = (document: PDFKit.PDFDocument, text: string, level = 0) => {
  const indentation = 12 + level * 16;

  document
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#222222")
    .text(`• ${stripMarkdownFormatting(text)}`, {
      indent: indentation,
      lineGap: 3,
    });

  document.moveDown(0.1);
};

const addNumbered = (
  document: PDFKit.PDFDocument,
  number: number,
  text: string,
) => {
  document
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#222222")
    .text(`${number}. ${stripMarkdownFormatting(text)}`, {
      indent: 12,
      lineGap: 3,
    });

  document.moveDown(0.1);
};

const addFormula = (document: PDFKit.PDFDocument, text: string) => {
  document.moveDown(0.35);

  const latex = cleanFormula(text);

  const rendered = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  });

  const svgMatch = rendered.match(/<svg[\s\S]*<\/svg>/);

  if (!svgMatch) {
    document.font("Courier").fontSize(10.5).fillColor("#222222").text(latex, {
      align: "center",
      lineGap: 3,
    });

    document.moveDown(0.35);

    return;
  }

  const svg = svgMatch[0];

  const availableWidth =
    document.page.width -
    document.page.margins.left -
    document.page.margins.right;

  const formulaWidth = Math.min(availableWidth, 480);

  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/i);

  let formulaHeight = 30;

  if (viewBoxMatch) {
    const viewBox = viewBoxMatch[1]!.split(/\s+/).map(Number);

    const viewBoxWidth = viewBox[2];
    const viewBoxHeight = viewBox[3];

    if (
      Number.isFinite(viewBoxWidth) &&
      Number.isFinite(viewBoxHeight) &&
      viewBoxWidth! > 0 &&
      viewBoxHeight! > 0
    ) {
      formulaHeight = formulaWidth * (viewBoxHeight! / viewBoxWidth!);
    }
  }

  SVGtoPDF(document, svg, document.page.margins.left, document.y, {
    width: formulaWidth,
  });

  document.y += formulaHeight + 8;

  document.moveDown(0.2);
};

const addCode = (document: PDFKit.PDFDocument, text: string) => {
  document.font("Courier").fontSize(9).fillColor("#222222").text(text, {
    lineGap: 2,
  });
};

const addSpacer = (document: PDFKit.PDFDocument) => {
  document.moveDown(0.2);
};

export function generateNotePdf({
  title,
  content,
}: GeneratePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const document = new PDFDocument({
        size: "A4",

        bufferPages: true,

        margins: {
          top: 55,
          bottom: 55,
          left: 55,
          right: 55,
        },

        info: {
          Title: title || "NoteGenius Notes",
          Author: "NoteGenius",
          Subject: "Generated Study Notes",
        },
      });

      const chunks: Buffer[] = [];

      document.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      document.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      document.on("error", reject);

      const parsedContent = parseMarkdown(content);

      const markdownTitle = parsedContent.find((line) => line.type === "title");

      if (markdownTitle) {
        addTitle(document, markdownTitle.text);
      } else if (title) {
        addTitle(document, title);
      }

      for (const line of parsedContent) {
        if (line.type === "title" && line === markdownTitle) {
          continue;
        }

        switch (line.type) {
          case "heading":
            addHeading(document, line.text);
            break;

          case "subheading":
            addSubheading(document, line.text);
            break;

          case "paragraph":
            addParagraph(document, line.text);
            break;

          case "bullet":
            addBullet(document, line.text, line.level ?? 0);
            break;

          case "numbered":
            addNumbered(document, line.number ?? 1, line.text);
            break;

          case "formula":
            addFormula(document, line.text);
            break;

          case "code":
            addCode(document, line.text);
            break;

          case "spacer":
            addSpacer(document);
            break;
        }
      }

      const pageRange = document.bufferedPageRange();

      for (
        let index = pageRange.start;
        index < pageRange.start + pageRange.count;
        index++
      ) {
        document.switchToPage(index);

        addPageNumber(document, index - pageRange.start + 1);
      }

      document.end();
    } catch (error) {
      reject(error);
    }
  });
}
