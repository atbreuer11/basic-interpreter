/**
 * An error representing an illegal character.
 * @extends Error
 */
class IllegalCharError extends Error {
  /**
   * Construct an error.
   * @param {String} char - The illegal character
   * @param {String} fileName - The file name
   * @param {Number} lineNumber - The line number
   */
  constructor(char, fileName, lineNumber) {
    super(`'${char}' is an illegal character`, fileName, lineNumber);
  }
}

/**
 * A position in the input storing the index, line number and column.
 */
class Position {
  /**
   * Construct a position.
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
  advance(currentChar) {
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

/**
 * A token with a type an a potential value.
 */
class Token {
  /**
   * Construct a token.
   * @param {String} type - A type of token prefixed by TT_
   * @param {Number|null} value - A potential value for the token
   */
  constructor(type, value = null) {
    this.type = type;
    this.value = value;
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
   * the input is reached.
   */
  advance() {
    this.position.advance(this.currentChar);
    if (this.position.index < this.input.length)
      this.currentChar = this.input[this.position.index];
    else this.currentChar = null;
  }

  /**
   * Make the list of tokens from the input, returns an array that can be
   * destructured.
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
        tokens.push(new Token(TT_ADD));
        this.advance();
      } else if (this.currentChar == '-') {
        tokens.push(new Token(TT_SUBTRACT));
        this.advance();
      } else if (this.currentChar == '*') {
        tokens.push(new Token(TT_MULTIPLY));
        this.advance();
      } else if (this.currentChar == '/') {
        tokens.push(new Token(TT_DIVIDE));
        this.advance();
      } else if (this.currentChar == '(') {
        tokens.push(new Token(TT_LPAREN));
        this.advance();
      } else if (this.currentChar == '+)') {
        tokens.push(new Token(TT_RPAREN));
        this.advance();
      } else {
        throw new IllegalCharError(
          this.currentChar,
          this.fileName,
          this.position.lineNumber
        );
      }
    }

    return tokens;
  }

  /**
   * Make and return an int or a float depending on if a dot is detected.
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
      return new Token(TT_FLOAT, parseFloat(numberString));
    } else {
      return new Token(TT_INT, parseInt(numberString));
    }
  }
}

/**
 * A node representing a number token
 */
class NumberNode {
  /**
   * Construct a number node.
   * @param {Token} token - The token of type TT_INT or TT_FLOAT
   */
  constructor(token) {
    this.token = token;
  }
}

/**
 * Run the lexer on the input. Returns an array that can be destructured.
 * @throws
 * @param {String} input - An input
 * @param {String} fileName - A file name
 * @returns {Token[]} - A list of tokens
 * @returns {Error} - An error
 */
exports.run = (input, fileName) => {
  const lexer = new Lexer(fileName, input);
  const tokens = lexer.makeTokens();
  return tokens;
};
