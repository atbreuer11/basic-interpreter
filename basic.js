const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const Interpreter = require('./interpreter.js');

/**
 * Run the lexer on the input. Returns an array that can be destructured
 * @throws
 * @param {String} input - An input
 * @param {String} fileName - A file name
 * @returns {Token[]} - A list of tokens
 * @returns {Error} - An error
 */
exports.run = (input, fileName) => {
  // Generate the tokens
  const lexer = new Lexer(fileName, input);
  const tokens = lexer.makeTokens();

  // Parse the lexed tokens the AST
  const parser = new Parser(fileName, tokens);
  const ast = parser.parse();

  // Interpret the AST
  const interpreter = new Interpreter();
  const result = interpreter.visit(ast.node);

  return result;
};
