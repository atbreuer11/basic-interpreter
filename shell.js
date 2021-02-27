const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const run = () => {
  rl.question('> ', (input) => {
    console.log(input);
    run();
  });
};

run();
