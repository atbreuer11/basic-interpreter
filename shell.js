const basic = require('./basic.js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const run = () => {
  rl.question('> ', (input) => {
    try {
      const result = basic.run(input, 'stdin');
      console.log(result);
    } catch (error) {
      console.log(error);
    }

    run();
  });
};

run();
