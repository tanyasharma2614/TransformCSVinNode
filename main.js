const fs = require("fs");
const readline = require("readline");

//Function to check if file exists 
function fileExists(filePath){
  try{
    fs.accessSync(filePath,fs.constants.F_OK);
    return true;
  }catch(err){
    return false;
  }
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

      // Wait for user input to enter a formula
      const input = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      input.question("Enter a formula: ", (formula) => {
        console.log(`You entered: ${formula}`);

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
  fileExists
};
