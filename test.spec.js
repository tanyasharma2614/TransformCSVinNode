const {readAndPrintCSV, fileExists} = require('./main');
const fs=require('fs');

describe('Main Function',()=>{

  it('should handle an empty CSV file',(done)=>{
    fs.writeFileSync('empty.csv','');
    const consoleErrorSpy=spyOn(console,'error').and.callThrough();
    readAndPrintCSV('empty.csv');
    setTimeout(()=>{
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: The CSV file is empty.');
      fs.unlinkSync('empty.csv');
      done();
    },1000);
  });

  it('should handle a non-existent CSV file',(done)=>{
    const invalidFilePath='doesnotexist.csv';
    const exists=fileExists(invalidFilePath);
    setTimeout(()=>{
      expect(exists).toBe(false);
      done();
    },1000);
});

it('should handle CSV files with mismatched columns(invalid CSV)',(done)=>{
  fs.writeFileSync('invalid.csv','Header1,Header2\nValue1\n');
  const consoleErrorSpy=spyOn(console,'error').and.callThrough();
  readAndPrintCSV('invalid.csv');
  setTimeout(()=>{
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Mismatched columns in the CSV file.');
    fs.unlinkSync('invalid.csv');
    done();
  },1000);
});

});