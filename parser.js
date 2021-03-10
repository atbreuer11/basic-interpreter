const TokenType = require('./token_types.js');

/**
 * A parser that can generate an abstract syntax tree from a list of tokens
 */
module.exports = class Parser {
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
    if (this.currentToken.type != TokenType.TT_EOF)
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

    if ([TokenType.TT_ADD, TokenType.TT_SUBTRACT].includes(token.type)) {
      parseResult.register(this.advance());
      const factor = parseResult.register(this.factor());
      return parseResult.success(new UnaryOperationNode(token, factor));
    } else if ([TokenType.TT_INT, TokenType.TT_FLOAT].includes(token.type)) {
      parseResult.register(this.advance());
      return parseResult.success(new NumberNode(token));
    } else if (token.type == TokenType.TT_LPAREN) {
      parseResult.register(this.advance());
      const expression = parseResult.register(this.expression());
      if (this.currentToken.type == TokenType.TT_RPAREN) {
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
    return this.binaryOperation(true, [
      TokenType.TT_MULTIPLY,
      TokenType.TT_DIVIDE,
    ]);
  }

  /**
   * Generate an expression
   * @returns {NumberNode|BinaryOperationNode} - The expression
   */
  expression() {
    return this.binaryOperation(false, [
      TokenType.TT_ADD,
      TokenType.TT_SUBTRACT,
    ]);
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
};

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
