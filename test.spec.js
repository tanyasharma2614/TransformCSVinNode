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

it('should print a valid CSV file', (done) => {
  fs.writeFileSync('validcsv.csv','Header1,Header2\nValue1,Value2\nValue3,Value4\n');
  const consoleLogSpy=spyOn(console,'log').and.callThrough();
  readAndPrintCSV('validcsv.csv');
  setTimeout(()=>{
    expect(consoleLogSpy.calls.allArgs()).toEqual([
      ['Header1 | Header2'],
      ['------- | -------'],
      ['Value1  | Value2 '],
      ['Value3  | Value4 '],
    ]);
    fs.unlinkSync('validcsv.csv');
    done()
  },1000);
});

it('should handle CSV file with empty fields',(done)=>{
  fs.writeFileSync('empty_fields.csv','Header1,Header2,Header3\nValue1,,Value3\n');
  const consoleLogSpy=spyOn(console,'log').and.callThrough();
  readAndPrintCSV('empty_fields.csv');
  setTimeout(()=>{
    expect(consoleLogSpy.calls.allArgs()).toEqual([
      ['Header1 | Header2 | Header3'],
      ['------- | ------- | -------'],
      ['Value1  |         | Value3 '],
    ]);
    fs.unlinkSync('empty_fields.csv');
    done();
  },1000);
});

it('should handle large files efficiently',(done)=>{
  const numRows=1000;
  const numColumns=10;
  const header=Array.from({length:numColumns},(_,i)=>`Header${i+1}`).join(',');
  const rowData=Array.from({length:numRows},(_,i)=>Array.from({length:numColumns},(_,j)=>`Value${i+1}-${j+1}`).join(','));
  fs.writeFileSync('large.csv',`${header}\n${rowData.join('\n')}\n`);
  const startTime=Date.now();
  readAndPrintCSV('large.csv');
  setTimeout(()=>{
    const endTime=Date.now();
    const elapsedTime=endTime-startTime;
    expect(elapsedTime).toBeLessThan(5000);
    fs.unlinkSync('large.csv');
    done();
  },1000);
});


});