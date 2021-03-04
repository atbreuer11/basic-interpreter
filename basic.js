/**
 * An error for an illegal character
 * @extends Error
 */
class IllegalCharError extends Error {
  /**
   * Construct an error
   * @param {String} char - The illegal character
   * @param {String} fileName - The file name
   * @param {Number} lineNumber - The line number
   */
  constructor(char, fileName, lineNumber) {
    super(`'${char}' is an illegal character`, fileName, lineNumber);
  }
}

/**
 * An error for invalid syntax
 */
class InvalidSyntaxError extends Error {
  /**
   * Construct an error.
   * @param {String} syntax - The illegal syntax
   * @param {String} fileName - The file name
   * @param {Number} lineNumber - The line number
   */
  constructor(syntax, fileName, lineNumber) {
    super(`'${syntax}' invalid syntax`, fileName, lineNumber);
  }
}

/**
 * A position in the input storing the index, line number and column.
 */
class Position {
  /**
   * Construct a position
   * @param {Number} index - An index relative to the start position
   * @param {Number} lineNumber - An index of the current line number
   * @param {Number} column - An index of the current column in the line
   */
  constructor(index = 0, lineNumber = 0, column = 0) {
    this.index = index;
    this.lineNumber = lineNumber;
    this.column = column;
  }

  /**
   * Advance through the input storing the current index, column, and line number.
   * @param {String} currentChar - The current character to check for newlines
   */
  advance(currentChar = null) {
    this.index++;
    this.column++;

    if (currentChar == '\n') {
      this.lineNumber++;
      this.column = 0;
    }

    return this;
  }
}

// Token types
const TT_INT = 'INT';
const TT_FLOAT = 'FLOAT';
const TT_ADD = 'ADD';
const TT_SUBTRACT = 'SUBTRACT';
const TT_MULTIPLY = 'MULTIPLY';
const TT_DIVIDE = 'DIVIDE';
const TT_LPAREN = 'LPARAEN';
const TT_RPAREN = 'RPARAEN';
const TT_EOF = 'TT_EOF';

/**
 * A token with a type an a potential value.
 */
class Token {
  /**
   * Construct a token
   * @param {String} type - A type of token prefixed by TT_
   * @param {Number|null} value - A potential value for the token
   * @param {Position} position - The position of the token
   */
  constructor(type, value = null, position = null) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
}

/**
 * A lexer that can output a list of tokens for a given input.
 */
class Lexer {
  static digits = '0123456789'.split('');

  /**
   * Construct a lexer
   * @param {String} fileName - A filename for the input
   * @param {String} input - The input to be lexed
   */
  constructor(fileName, input) {
    this.fileName = fileName;
    this.input = input;
    this.position = new Position();
    this.currentChar = input[0];
  }

  /**
   * Advance the position, setting the current char to null when the end of
   * the input is reached
   */
  advance() {
    this.position.advance(this.currentChar);
    if (this.position.index < this.input.length)
      this.currentChar = this.input[this.position.index];
    else this.currentChar = null;
  }

  /**
   * Make the list of tokens from the input, returns an array that can be
   * destructured
   * @throws
   * @return {Token[]} - The list of tokens
   */
  makeTokens() {
    let tokens = [];

    while (this.currentChar != null) {
      if ([' ', '\t'].includes(this.currentChar)) this.advance();
      else if (Lexer.digits.includes(this.currentChar)) {
        tokens.push(this.makeNumber());
      } else if (this.currentChar == '+') {
        tokens.push(new Token(TT_ADD, null, this.position));
        this.advance();
      } else if (this.currentChar == '-') {
        tokens.push(new Token(TT_SUBTRACT, null, this.position));
        this.advance();
      } else if (this.currentChar == '*') {
        tokens.push(new Token(TT_MULTIPLY, null, this.position));
        this.advance();
      } else if (this.currentChar == '/') {
        tokens.push(new Token(TT_DIVIDE, null, this.position));
        this.advance();
      } else if (this.currentChar == '(') {
        tokens.push(new Token(TT_LPAREN, null, this.position));
        this.advance();
      } else if (this.currentChar == ')') {
        tokens.push(new Token(TT_RPAREN, null, this.position));
        this.advance();
      } else {
        throw new IllegalCharError(
          this.currentChar,
          this.fileName,
          this.position.lineNumber
        );
      }
    }

    tokens.push(new Token(TT_EOF, null, this.position));

    return tokens;
  }

  /**
   * Make and return an int or a float depending on if a dot is detected
   * @return {Token} - A token of type TT_FLOAT or TT_INT
   */
  makeNumber() {
    let numberString = '';
    let hasDot = false;

    while (
      this.currentChar != null &&
      (Lexer.digits.includes(this.currentChar) || this.currentChar == '.')
    ) {
      if (this.currentChar == '.') {
        if (hasDot) break;
        hasDot = true;
      }
      numberString += this.currentChar;
      this.advance();
    }

    if (hasDot) {
      return new Token(TT_FLOAT, parseFloat(numberString), this.position);
    } else {
      return new Token(TT_INT, parseInt(numberString), this.position);
    }
  }
}

/**
 * A generic node
 */
class Node {}

/**
 * A node representing a number token
 * @extends Node
 */
class NumberNode extends Node {
  /**
   * Construct a number node
   * @param {Token} token - The token of type TT_INT or TT_FLOAT
   */
  constructor(token) {
    super();
    this.token = token;
  }
}

/**
 * A node representing a binary operation
 * @extends Node
 */
class BinaryOperationNode extends Node {
  /**
   * Construct a binary operation node
   * @param {Node} leftNode - The left node
   * @param {Node} rightNode - The right node
   * @param {Token} operatorToken - A binary operator token of type TT_ADD,
   *    TT_SUBTRACT, TT_MULTIPLY, or TT_DIVIDE
   */
  constructor(leftNode, rightNode, operatorToken) {
    super();
    this.leftNode = leftNode;
    this.rightNode = rightNode;
    this.operatorToken = operatorToken;
  }
}

/**
 * A node representing a unary operation
 * @extends Node
 */
class UnaryOperationNode extends Node {
  /**
   * Construct a unary operation node
   * @param {Token} operatorToken
   * @param {Node} node
   */
  constructor(operatorToken, node) {
    super();
    this.operatorToken = operatorToken;
    this.node = node;
  }
}

/**
 * A parse result that can contain a node and/or an error
 */
class ParseResult {
  /**
   * Construct a parse result
   */
  constructor() {
    this.node = null;
  }

  /**
   * Register a result
   * @param {ParseResult|Node} result A result
   */
  register(result) {
    if (result instanceof ParseResult) {
      return result.node;
    }
    return result;
  }

  /**
   * Call to register a successful parse result
   * @param {Node} node
   */
  success(node) {
    this.node = node;
    return this;
  }
}

/**
 * A parser that can generate an abstract syntax tree from a list of tokens
 */
class Parser {
  /**
   * Construct a parser
   * @param {fileName} fileName A file name
   * @param {Token[]} tokens A list of tokens
   */
  constructor(fileName, tokens) {
    this.fileName = fileName;
    this.tokens = tokens;
    this.tokenIndex = 0;
    this.currentToken = tokens[0];
  }

  /**
   * Advance the position, setting the current char to null when the end of
   * the input is reached
   */
  advance() {
    this.tokenIndex++;
    if (this.tokenIndex < this.tokens.length)
      this.currentToken = this.tokens[this.tokenIndex];
    return this.currentToken;
  }

  /**
   * Parse the expression
   */
  parse() {
    const parseResult = this.expression();
    if (this.currentToken.type != TT_EOF)
      throw new InvalidSyntaxError(
        "Expected '+', '-', '*', or '/'",
        this.fileName,
        this.currentToken.position.lineNumber
      );
    return parseResult;
  }

  /**
   * If the current token is a number, advance and return a number node
   * @returns {NumberNode|null} - The number node or null
   */
  factor() {
    const parseResult = new ParseResult();
    const token = this.currentToken;

    if ([TT_ADD, TT_SUBTRACT].includes(token.type)) {
      parseResult.register(this.advance());
      const factor = parseResult.register(this.factor());
      return parseResult.success(new UnaryOperationNode(token, factor));
    } else if ([TT_INT, TT_FLOAT].includes(token.type)) {
      parseResult.register(this.advance());
      return parseResult.success(new NumberNode(token));
    } else if (token.type == TT_LPAREN) {
      parseResult.register(this.advance());
      const expression = parseResult.register(this.expression());
      if (this.currentToken.type == TT_RPAREN) {
        parseResult.register(this.advance());
        return parseResult.success(expression);
      } else
        throw new InvalidSyntaxError(
          "Expected ')'",
          this.fileName,
          token.position.lineNumber
        );
    }

    throw new InvalidSyntaxError(
      'Expected int or float',
      this.fileName,
      token.position.lineNumber
    );
  }

  /**
   * Generate a term
   * @returns {NumberNode|BinaryOperationNode} - The term
   */
  term() {
    return this.binaryOperation(true, [TT_MULTIPLY, TT_DIVIDE]);
  }

  /**
   * Generate an expression
   * @returns {NumberNode|BinaryOperationNode} - The expression
   */
  expression() {
    return this.binaryOperation(false, [TT_ADD, TT_SUBTRACT]);
  }

  /**
   * Recursively build expression from terms and factors
   * @param {Boolean} shouldFactor - Whether to use factor or term for left node
   * @param {String[]} operatorTypes - Allowed operator types for the operation
   */
  binaryOperation(shouldFactor, operatorTypes) {
    const parseResult = new ParseResult();
    let left = shouldFactor
      ? parseResult.register(this.factor())
      : parseResult.register(this.term());

    while (operatorTypes.includes(this.currentToken.type)) {
      const operatorNode = this.currentToken;
      parseResult.register(this.advance());
      const right = shouldFactor
        ? parseResult.register(this.factor())
        : parseResult.register(this.term());
      left = new BinaryOperationNode(left, right, operatorNode);
    }

    return parseResult.success(left);
  }
}

class NumberValue {
  constructor(value) {
    this.value = value;
    this.setPosition();
  }

  setPosition(position) {
    this.position = position;
    return this;
  }

  addedTo(other) {
    if (other instanceof NumberValue)
      return new NumberValue(this.value + other.value);
  }

  subractedBy(other) {
    if (other instanceof NumberValue)
      return new NumberValue(this.value - other.value);
  }

  multipliedBy(other) {
    if (other instanceof NumberValue)
      return new NumberValue(this.value * other.value);
  }

  dividedBy(other) {
    if (other instanceof NumberValue)
      return new NumberValue(this.value / other.value);
  }
}

/**
 * An interpreter to traverse the AST and determine how to
 * execute it
 */
class Interpreter {
  /**
   * The starting point for the traversal of the AST
   * @param {Node} node
   */
  visit(node) {
    const visitMethodString = `visit${node.constructor.name}`;
    const visitNode = this[visitMethodString].bind(this);
    return visitNode(node);
  }

  /**
   * Visit a number node
   * @param {NumberNode} node
   */
  visitNumberNode(node) {
    const number = new NumberValue(node.token.value);
    return number.setPosition(node.token.position);
  }

  /**
   * Visit a binary operation node
   * @param {BinaryOperationNode} node
   */
  visitBinaryOperationNode(node) {
    const left = this.visit(node.leftNode);
    const right = this.visit(node.rightNode);
    let result = null;

    switch (node.operatorToken.type) {
      case TT_ADD:
        result = left.addedTo(right);
        break;
      case TT_SUBTRACT:
        result = left.subractedBy(right);
        break;
      case TT_MULTIPLY:
        result = left.multipliedBy(right);
        break;
      case TT_DIVIDE:
        result = left.dividedBy(right);
        break;
    }

    return result.setPosition(node.operatorToken.position);
  }

  /**
   * Visit a unary operation node
   * @param {UnaryOperationNode} node
   */
  visitUnaryOperationNode(node) {
    let number = this.visit(node.node);

    if (node.operatorToken.type == TT_SUBTRACT) {
      number = number.multipliedBy(new NumberValue(-1));
    }

    return number.setPosition(node.operatorToken.position);
  }
}

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
