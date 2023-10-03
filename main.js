const fs = require("fs");
const readline = require("readline");

const spreadsheet=new Map();

//Function to check if file exists 
function fileExists(filePath){
  try{
    fs.accessSync(filePath,fs.constants.F_OK);
    return true;
  }catch(err){
    return false;
  }
}

function updateSpreadsheet(header,rows){
  for(let i=0;i<header.length;i++){
    for(let j=0;j<rows.length;j++){
      const cellReference=String.fromCharCode(65+i)+(j+2);
      spreadsheet.set(cellReference,rows[j][i]);
    }
  }
}

function evaluateFormula(formula,spreadsheet){
  if(formula.startsWith('=')){
    const [,calc,rangeStr]=formula.match(/^=([A-Z]+)\(([^)]+)\)$/);
    const [startCellRef,endCellRef]=rangeStr.split(':');

    const startColIndex=startCellRef.charCodeAt(0)-'A'.charCodeAt(0);
    const startRowIndex=parseInt(startCellRef.slice(1))-1;
    const endColIndex=endCellRef.charCodeAt(0)-'A'.charCodeAt(0);
    const endRowIndex=(endCellRef.slice(1))-1;
    switch(calc){
      case 'SUM':
        return evaluateSum(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet);
      case 'AVERAGE':
        return evaluateAverage(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet);
      case 'COUNT':
        return evaluateCount(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet);
      case 'MAX':
        return evaluateMax(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet);
      case 'MIN':
        return evaluateMin(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet);
      default:
        return 'Formula not supported';
    }
  }
  return 'Invalid Formula';
}

function evaluateSum(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet){
  let sum=0;
  for(let colIndex=startColIndex;colIndex<=endColIndex;colIndex++){
    for(let rowIndex=startRowIndex;rowIndex<=endRowIndex;rowIndex++){
      const cellReference=String.fromCharCode('A'.charCodeAt(0)+colIndex)+(rowIndex+1);
      const cellValue=spreadsheet.get(cellReference);
      if(cellValue!==undefined && !isNaN(parseFloat(cellValue))){
        sum+=parseFloat(cellValue);
      }
    }
  }
  return sum;
}

function evaluateAverage(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet){
  let sum=0;
  let count=0;
  for(let colIndex=startColIndex;colIndex<=endColIndex;colIndex++){
    for(let rowIndex=startRowIndex;rowIndex<=endRowIndex;rowIndex++){
      const cellReference=String.fromCharCode('A'.charCodeAt(0)+colIndex)+(rowIndex+1);
      const cellValue=spreadsheet.get(cellReference);
      if(cellValue!==undefined && !isNaN(parseFloat(cellValue))){
        sum+=parseFloat(cellValue);
        count++;
      }
    }
  }
  if(count===0)
    return 0;
  return sum/count;
}

function evaluateCount(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet){
  let count=0;
  for(let colIndex=startColIndex;colIndex<=endColIndex;colIndex++){
    for(let rowIndex=startRowIndex;rowIndex<=endRowIndex;rowIndex++){
      const cellReference=String.fromCharCode('A'.charCodeAt(0)+colIndex)+(rowIndex+1);
      const cellValue=spreadsheet.get(cellReference);
      if(cellValue!=undefined)
        count++;
    }
  }
  return count;
}

function evaluateMax(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet){
  let max=-Infinity;
  for(let colIndex=startColIndex;colIndex<=endColIndex;colIndex++){
    for(let rowIndex=startRowIndex;rowIndex<=endRowIndex;rowIndex++){
      const cellReference=String.fromCharCode('A'.charCodeAt(0)+colIndex)+(rowIndex+1);
      const cellValue=spreadsheet.get(cellReference);
      if(cellValue!==undefined && !isNaN(parseFloat(cellValue))){
        max=Math.max(max,parseFloat(cellValue));
      }
    }
  }
  return max;
}

function evaluateMin(startColIndex,startRowIndex,endColIndex,endRowIndex,spreadsheet){
  let min=Infinity;
  for(let colIndex=startColIndex;colIndex<=endColIndex;colIndex++){
    for(let rowIndex=startRowIndex;rowIndex<=endRowIndex;rowIndex++){
      const cellReference=String.fromCharCode('A'.charCodeAt(0)+colIndex)+(rowIndex+1);
      const cellValue=spreadsheet.get(cellReference);
      if(cellValue!==undefined && !isNaN(parseFloat(cellValue))){
        min=Math.min(min,parseFloat(cellValue));
      }
    }
  }
  return min;
}

// Main Function to read and print the CSV file
function readAndPrintCSV(fileName) {
  // Handle case when file name does not exist
  if (!fileExists(fileName)) {
    console.error(`Error: The file does not exist.`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(fileName);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let header = null;
  let rows = [];

  rl.on("line", (line) => {
    const values = line.split(",");

    // Handle case when the CSV is invalid because it has invalid columns
    if (!header) {
      header = values;
    } else {
      if (values.length !== header.length) {
        console.error("Error: Mismatched columns in the CSV file.");
        rl.close();
        return;
      }

      rows.push(values);
      updateSpreadsheet(header,rows);
    }
  });

  rl.on("close", () => {
    // Handle an empty CSV
    if (!header) {
      console.error("Error: The CSV file is empty.");
    } else {
      // Calculate column widths based on header and data rows
      const columnWidths = header.map((col, index) => {
        return Math.max(col.length, ...rows.map((row) => row[index].length));
      });

      // Print the header
      console.log(
        header.map((col, index) => pad(col, columnWidths[index])).join(" | "),
      );

      // Print separator line
      console.log(
        columnWidths.map((width) => "-".repeat(width)).join(" | "),
      );

      // Print the data rows
      for (const row of rows) {
        console.log(
          row.map((col, index) => pad(col, columnWidths[index])).join(" | "),
        );
      }

      // // Print the spreadsheet data for debugging
      // console.log("Spreadsheet Data:");
      // for (const [cellReference, value] of spreadsheet.entries()) {
      //   console.log(`${cellReference}: ${value}`);
      // }
      // Wait for user input to enter a formula
      const input = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      input.question("Enter a formula: ", (formula) => {
        const result=evaluateFormula(formula,spreadsheet);
        console.log(`You entered: ${formula}`);
        console.log(`Result:${result}`);

        input.close();
      });
    }
  });
}

// Function to pad a string to a specified width with spaces
function pad(str, width) {
  const diff = width - str.length;
  return str + " ".repeat(diff > 0 ? diff : 0);
}

function main() {
  const fileName = "data.csv"; 
  readAndPrintCSV(fileName);
}

main();

module.exports = {
  readAndPrintCSV,
  fileExists,
  evaluateFormula
};
