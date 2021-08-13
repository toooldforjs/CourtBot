const { jsPDF } = require("jspdf");
const pdfTemplate = require("./template-pdf");
const date = require("./date");

let userName = "Иван Петров";
let fileName = `${date.dateNowForFileName} заявление ${userName}.pdf`;

function getPdf() {
	pdfTemplate.doc.save(`./pdf/${fileName}`);
	console.log(`Документ ${fileName} сохранен.`);
}

module.exports.getPdf = getPdf;
module.exports.fileName = fileName;
