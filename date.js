let date = new Date();
let optionsDefault = {
	year: "numeric",
	month: "numeric",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
};
let optionsForFileName = {
	year: "numeric",
	month: "numeric",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
};
module.exports.dateNow = date.toLocaleString("ru", optionsDefault);

let year = date.getFullYear();
let month = zeroForMonth(date.getMonth());
let dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

function zeroForMonth(date) {
	if (date + 1 < 10) {
		return `0${date + 1}`;
	} else {
		date + 1;
	}
}

module.exports.dateNowForFileName = `${year}-${month}-${dateOfMonth}`;
