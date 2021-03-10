const TokenType = require('./token_types.js');

/**
 * An interpreter to traverse the AST and determine how to
 * execute it
 */
module.exports = class Interpreter {
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
      case TokenType.TT_ADD:
        result = left.addedTo(right);
        break;
      case TokenType.TT_SUBTRACT:
        result = left.subractedBy(right);
        break;
      case TokenType.TT_MULTIPLY:
        result = left.multipliedBy(right);
        break;
      case TokenType.TT_DIVIDE:
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

    if (node.operatorToken.type == TokenType.TT_SUBTRACT) {
      number = number.multipliedBy(new NumberValue(-1));
    }

    return number.setPosition(node.operatorToken.position);
  }
};

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
