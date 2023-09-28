const fs = require('fs');
const readline=require('readline');

//styling for console output 
const styledLog = (text) => {
    //setting font as Courier
    console.log('\x1b[11m' + text + '\x1b[0m'); 
  };

//read and display CSV
const readAndDisplayCSV = async(filename)=>{
    try{
        const rows=await new Promise((resolve,reject)=>{
            const rows=[];
            const r1=readline.createInterface({
                input:fs.createReadStream(filename),
                crlfDelay:Infinity,
            });
            r1.on('line',(line)=>{
                const columns=line.split(',');
                rows.push(columns);
            });
            r1.on('close',()=>{
                resolve(rows);
            });
            r1.on('error',(err)=>{
                reject(err)
            });
        });

        //print spreadsheet 
        for(const row of rows){
            const formattedRow=row.join('\t');
            styledLog(formattedRow);
        }
    }
    catch(error){
        console.error('An error occurred:',error);
    }
};

const handleFormulaInput=(r1)=>{
    r1.question('\x1b[11mEnter a formula:\x1b[0m', (formula) => {
        styledLog('Thank you for your input. We will get back to you in Homework2!');
        r1.close();
    });
};

const main = async () =>{
    try{
        const defaultFileName='data.csv';
        const r1=readline.createInterface({
            input:process.stdin,
            output:process.stdout,
        });

        //Ask user whether they want to use default file or input their own 
        r1.question('\x1b[11mDo you want to use the default file(data.csv)?(yes/no):\x1b[0m',async(answer)=>{
            if(answer.toLowerCase()==='yes'){
                styledLog('Using default file:'+defaultFileName);
                await readAndDisplayCSV(defaultFileName);
                handleFormulaInput(r1);
            }
            else if(answer.toLowerCase()==='no'){
                r1.question('\x1b[11mEnter the name of the file:\x1b[0m',async(customeFileName)=>{
                    styledLog('Using custom file:'+customeFileName);
                    await readAndDisplayCSV(customeFileName);
                    handleFormulaInput(r1);
                });
                
            }
            else{
                styledLog('Invalid input. Please enter "yes" or "no".');
                r1.close();
            }

        });
    }
    catch(error){
        styledLog('An error occurred:');
    }
};
module.exports=main;

main();