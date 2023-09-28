const main = require('./ans')
const readline = require('readline');
const { Readable, Writable} = require('stream');

describe('Main function',()=>{
    let originaInput;
    let originalOutput;
    let mockInput;
    let mockOutput;

    beforeEach(()=>{
        originaInput=process.stdin;
        originalOutput=process.stdout;

        mockInput=new Readable();
        mockInput._read=()=>{};;
        mockOutput=new Writable();
        mockOutput._write=(chunk,encoding, callback)=>{
            callback();
        }
        process.stdin=mockInput;
        process.stdout=mockOutput;
    });

    afterEach(()=>{
        process.stdin=originaInput;
        process.stdout=originalOutput;
    });

    it('should handle user input when using default file',()=>{
        const input='yes\n';
        mockInput.push(input);
        mockInput.push(null);
        spyOn(console,'log');
        main();
        setTimeout(()=>{
            expect(console.log).toHaveBeenCalledWith('Using default file:data.csv');
            done();
        },100);
    });

    it('should handle user input when using custom file',()=>{
        const input='no\nmycustomfile.csv\n';
        mockInput.push(input);
        mockInput.push(null);
        spyOn(console,'log');
        main();
        setTimeout(()=>{
            expect(console.log).toHaveBeenCalledWith('Using custom file:mycustomefile.csv')
            done();
        },100);
    });

    it('should handle invalid user input',()=>{
        const input='invalid\n';
        mockInput.push(input);
        mockInput.push(null);
        spyOn(console,'log');
        main();
        setTimeout(()=>{
            expect(console.log).toHaveBeenCalledWith('Invalid input. Please enter "yes" or "no".');
            done();
        },100);
    });
})