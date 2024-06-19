import puppeteer from "puppeteer";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

// Função para obter a taxa de conversão
const getConversionRate = async (browser, baseCurrency, targetCurrency) => {
  const page = await browser.newPage();
  const url = `https://www.google.com/search?q=${baseCurrency}+para+${targetCurrency}`;
  await page.goto(url);

  const result = await page.evaluate(() => {
    return document.querySelector(".a61j6")?.value;
  });

  await page.close();
  return result;
};

// Função principal
const generatePDF = async () => {
  const browser = await puppeteer.launch();

  const currencies = [
    "dolar",
    "euro",
    "libra",
    "iene",
    "dolar australiano",
    "franco suiço",
    "dolar canadense",
    "peso",
    "lira turca",
  ];
  const targetCurrency = "real";
  const conversionRates = [];

  for (const baseCurrency of currencies) {
    const rate = await getConversionRate(browser, baseCurrency, targetCurrency);
    conversionRates.push({ baseCurrency, rate });
  }

  await browser.close();

  // Criar PDF
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  let yPosition = height - fontSize * 2;

  page.drawText("Taxas de conversão para Real", {
    x: 50,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= fontSize * 2;

  conversionRates.forEach((conversion, index) => {
    page.drawText(
      `1 ${conversion.baseCurrency} custa ${conversion.rate} reais`,
      {
        x: 50,
        y: yPosition - index * (fontSize * 1.5),
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      }
    );
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("conversion.pdf", pdfBytes);
};

generatePDF()
  .then(() => {
    console.log("PDF gerado com sucesso!");
  })
  .catch((error) => {
    console.error("Erro ao gerar o PDF", error);
  });
