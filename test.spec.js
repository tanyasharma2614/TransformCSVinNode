const { assert } = require('console');
const {readAndPrintCSV, fileExists, evaluateFormula} = require('./main');
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

  it('should correctly calculate the sum of numeric values',(done)=>{
    const formula='=SUM(A1:A3)';
    const spreadsheet=new Map([
      ['A1', '5'],
      ['A2', '10'],
      ['A3', '15'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(30);
    done();
  });

  it('should correctly calculate the average of numeric values',(done)=>{
    const formula='=AVERAGE(B1:B2)';
    const spreadsheet=new Map([
      ['B1', '10'],
      ['B2', '20'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(15);
    done();
  });

  it('should correctly count the number of cells correctly',(done)=>{
    const formula='=COUNT(A1:A3)';
    const spreadsheet=new Map([
      ['A1', '5'],
      ['A2', '10'],
      ['A3', '15'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(3);
    done();
  });

  it('should correctly calculate the max of numeric values',(done)=>{
    const formula='=MAX(A1:A3)';
    const spreadsheet=new Map([
      ['A1', '5'],
      ['A2', '10'],
      ['A3', '15'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(15);
    done();
  });

  it('should correctly calculate the min of numeric values',(done)=>{
    const formula='=MIN(A1:A3)';
    const spreadsheet=new Map([
      ['A1', '5'],
      ['A2', '10'],
      ['A3', '15'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(5);
    done();
  })

  it('should correctly calculate the sum ignoring non-numeric values',(done)=>{
    const formula='=SUM(A1:A3)';
    const spreadsheet=new Map([
      ['A1', '5'],
      ['A2', 'Alice'],
      ['A3', '10'],
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(15);
    done();
  });

  it('should correctly calculate the average ignoring non-numeric values',(done)=>{
    const formula='=AVERAGE(B1:B3)';
    const spreadsheet=new Map([
      ['B1', '32'],
      ['B2', 'Bob'],
      ['B3', '24'], 
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(28);
    done();
  });

  it('should correctly calculate the max ignoring non-numeric values',(done)=>{
    const formula='=MAX(B1:B3)';
    const spreadsheet=new Map([
      ['B1', '32'],
      ['B2', 'Bob'],
      ['B3', '24'], 
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(32);
    done();
  });

  it('should correctly calculate the min ignoring non-numeric values',(done)=>{
    const formula='=MIN(B1:B3)';
    const spreadsheet=new Map([
      ['B1', '32'],
      ['B2', 'Bob'],
      ['B3', '24'], 
    ]);
    const result=evaluateFormula(formula,spreadsheet);
    expect(result).toBe(24);
    done();
  })

it('should correctly calculate the sum of single cell',(done)=>{
  const formula='=SUM(A1:A1)';
  const spreadsheet=new Map([
    ['A1', '42'],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(42);
  done();
});

it('should correctly calculate the average of a single cell',(done)=>{
  const formula='=AVERAGE(A2:A2)';
  const spreadsheet=new Map([
    ['A2', '25'],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(25);
  done();
});

it('should correctly calculate sum of empty cells as 0',(done)=>{
  const formula='=SUM(A1:A3)';
  const spreadsheet=new Map([
    ['A1', ''],
    ['A2', ''],
    ['A3', ''], 
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(0);
  done();
});

it('should correctly calculate the average of empty cells as 0',(done)=>{
  const formula='=AVERAGE(B1:B3)';
  const spreadsheet=new Map([
    ['B1', ''],
    ['B2', ''],
    ['B3', ''],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(0);
  done();
});

it('should correctly ignore non-numeric cells and return 0 as sum',(done)=>{
  const formula='=SUM(C1:C3)';
  const spreadsheet=new Map([
    ['C1', 'Apple'],
    ['C2', 'Banana'],
    ['C3', 'Cherry'], 
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(0);
  done();
});

it('should correctly ignore non-numeric cells and return 0 as average',(done)=>{
  const formula='=AVERAGE(C1:C3)';
  const spreadsheet=new Map([
    ['C1', 'Apple'],
    ['C2', 'Banana'],
    ['C3', 'Cherry'],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(0);
  done();
});

it('should detect and report unsupported formulas',(done)=>{
  const formula='=INVALID(A1:A3)';
  const spreadsheet=new Map([
    ['A1', '10'],
    ['A2', '15'],
    ['A3', '20'],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe('Formula not supported');
  done();
});

it('should handle sum with references outside the defined range',(done)=>{
  const formula='=SUM(A1:A4)';
  const spreadsheet=new Map([
    ['A1', 5],
    ['A2', 10],
    ['A3', 15], 
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(30);
  done();
});

it('should handle average with references outside the defined range',(done)=>{
  const formula='=AVERAGE(A1:A4)';
  const spreadsheet=new Map([
    ['A1', 5],
    ['A2', 10],
    ['A3', 15], 
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(10);
  done();
});

it('should correctly calculate the sum of decimal values',(done)=>{
  const formula='=SUM(D1:D3)';
  const spreadsheet=new Map([
    ['D1', 1.5],
    ['D2', 2.5],
    ['D3', 3.5],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(7.5);
  done();
});

it('should correctly calculate the average of decimal values',(done)=>{
  const formula='=AVERAGE(D1:D3)';
  const spreadsheet=new Map([
    ['D1', 1.5],
    ['D2', 2.5],
    ['D3', 3.5],
  ]);
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(2.5);
  done();
});

it('should handle large range of cells efficiently in calculating sum',(done)=>{
  const formula='=SUM(A1:A100)';
  const spreadsheet=new Map();
  for (let i = 1; i <= 100; i++) {
    spreadsheet.set(`A${i}`, i);
  }
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(5050);
  done();
});

it('should handle a large range of cells efficiently in calculating average',(done)=>{
  const formula='=AVERAGE(A1:A100)';
  const spreadsheet=new Map();
  for (let i = 1; i <= 100; i++) {
    spreadsheet.set(`A${i}`, i);
  }
  const result=evaluateFormula(formula,spreadsheet);
  expect(result).toBe(50.5);
  done();
});

});