'use babel';
/* @flow */

var {TextEditor} = require('atom');

describe('PHP grammar', () => {
  var grammar = null;

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('nuclide-language-hack'));
    runs(() => grammar = atom.grammars.grammarForScopeName('text.html.hack'));
  });

  it('parses the grammar', () => {
    expect(grammar).toBeTruthy();
    expect(grammar.scopeName).toBe('text.html.hack');
  });

  describe('operators', () => {
    it('should tokenize = correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n$test = 2;");
      expect(tokens[1][0]).toEqual({
        value: '$',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
      });
      expect(tokens[1][2]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][3]).toEqual({
        value: '=',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
      });
      expect(tokens[1][4]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][5]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][6]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    it('should tokenize + correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n1 + 2;");
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][2]).toEqual({
        value: '+',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.arithmetic.php']
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    it('should tokenize - correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n1 - 2;");
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][2]).toEqual({
        value: '-',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.arithmetic.php']
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    it('should tokenize * correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n1 * 2;");
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][2]).toEqual({
        value: '*',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.arithmetic.php']
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    it('should tokenize / correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n1 / 2;");
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][2]).toEqual({
        value: '/',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.arithmetic.php']
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    it('should tokenize % correctly', () => {
      var tokens = grammar.tokenizeLines("<?hh\n1 % 2;");
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][2]).toEqual({
        value: '%',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.arithmetic.php']
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
      });
    });

    describe('combined operators', () => {
      it('should tokenize += correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test += 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '+=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize -= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test -= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '-=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize *= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test *= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '*=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize /= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test /= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '/=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize %= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test %= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '%=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize .= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test .= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '.=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.string.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize &= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test &= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '&=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize |= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test |= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '|=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize ^= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test ^= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '^=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize <<= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test <<= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '<<=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize >>= correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\n$test >>= 2;");
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'variable.other.php']
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][3]).toEqual({
          value: '>>=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'constant.numeric.php']
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      xit('should tokenize namespace at the same line as <?hh', () => {
        var tokens = grammar.tokenizeLines("<?hh namespace Test;");
        expect(tokens[0][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php']
        });
        expect(tokens[0][2]).toEqual({
          value: 'namespace',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php', 'keyword.other.namespace.php']
        });
        expect(tokens[0][3]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php']
        });
        expect(tokens[0][4]).toEqual({
          value: 'Test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php', 'entity.name.type.namespace.php']
        });
        expect(tokens[0][5]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize namespace correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\nnamespace Test;");
        expect(tokens[1][0]).toEqual({
          value: 'namespace',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php', 'keyword.other.namespace.php']
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php']
        });
        expect(tokens[1][2]).toEqual({
          value: 'Test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.namespace.php', 'entity.name.type.namespace.php']
        });
        expect(tokens[1][3]).toEqual({
          value: ';',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.terminator.expression.php']
        });
      });

      it('should tokenize default array type with old array value correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\nfunction array_test(array $value = array()) {}");
        expect(tokens[1][0]).toEqual({
          value: 'function',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'storage.type.function.php']
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php']
        });
        expect(tokens[1][2]).toEqual({
          value: 'array_test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'entity.name.function.php']
        });
        expect(tokens[1][3]).toEqual({
          value: '(',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'punctuation.definition.parameters.begin.php']
        });
        expect(tokens[1][4]).toEqual({
          value: 'array',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'storage.type.php']
        });
        expect(tokens[1][5]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php']
        });
        expect(tokens[1][6]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][7]).toEqual({
          value: 'value',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'variable.other.php']
        });
        expect(tokens[1][8]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php']
        });
        expect(tokens[1][9]).toEqual({
          value: '=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'keyword.operator.assignment.php']
        });
        expect(tokens[1][10]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php']
        });
        expect(tokens[1][11]).toEqual({
          value: 'array',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'support.function.construct.php']
        });
        expect(tokens[1][12]).toEqual({
          value: '(',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'punctuation.definition.array.begin.php']
        });
        expect(tokens[1][13]).toEqual({
          value: ')',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.array.php', 'punctuation.definition.array.end.php']
        });
        expect(tokens[1][14]).toEqual({
          value: ')',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'punctuation.definition.parameters.end.php']
        });
        expect(tokens[1][15]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][16]).toEqual({
          value: '{',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.section.scope.begin.php']
        });
        expect(tokens[1][17]).toEqual({
          value: '}',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.section.scope.end.php']
        });
      });

      it('should tokenize default array type with short array value correctly', () => {
        var tokens = grammar.tokenizeLines("<?hh\nfunction array_test(array $value = []) {}");
        expect(tokens[1][0]).toEqual({
          value: 'function',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'storage.type.function.php']
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php']
        });
        expect(tokens[1][2]).toEqual({
          value: 'array_test',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'entity.name.function.php']
        });
        expect(tokens[1][3]).toEqual({
          value: '(',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'punctuation.definition.parameters.begin.php']
        });
        expect(tokens[1][4]).toEqual({
          value: 'array',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php', 'storage.type.php']
        });
        expect(tokens[1][5]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php']
        });
        expect(tokens[1][6]).toEqual({
          value: '$',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php', 'variable.other.php', 'punctuation.definition.variable.php']
        });
        expect(tokens[1][7]).toEqual({
          value: 'value',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php', 'variable.other.php']
        });
        expect(tokens[1][8]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php']
        });
        expect(tokens[1][9]).toEqual({
          value: '=',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php']
        });
        expect(tokens[1][10]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php']
        });
        expect(tokens[1][11]).toEqual({
          value: '[',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php', 'punctuation.definition.short.array.begin.php']
        });
        expect(tokens[1][12]).toEqual({
          value: ']',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'meta.function.arguments.php', 'meta.function.argument.short.array.php', 'punctuation.definition.short.array.end.php']
        });
        expect(tokens[1][13]).toEqual({
          value: ')',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php', 'punctuation.definition.parameters.end.php']
        });
        expect(tokens[1][14]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack']
        });
        expect(tokens[1][15]).toEqual({
          value: '{',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.section.scope.begin.php']
        });
        expect(tokens[1][16]).toEqual({
          value: '}',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'punctuation.section.scope.end.php']
        });
      });
    });
  });
});
