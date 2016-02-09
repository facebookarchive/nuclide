'use babel';
/* @flow */

/*eslint-disable nuclide-internal/fb-license-header*/

import invariant from 'assert';

describe('PHP grammar', () => {
  let grammar: atom$Grammar = (null: any);

  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('nuclide-language-hack'));
    runs(() => {
      const hackGrammar = atom.grammars.grammarForScopeName('text.html.hack');
      invariant(hackGrammar);
      grammar = hackGrammar;
    });
  });

  it('parses the grammar', () => {
    expect(grammar).toBeTruthy();
    grammar = grammar || {};
    expect(grammar.scopeName).toBe('text.html.hack');
  });

  describe('operators', () => {
    it('should tokenize = correctly', () => {
      expect(grammar).toBeTruthy();
      grammar = grammar || {};
      const tokens = grammar.tokenizeLines('<?hh\n$test = 2;');
      expect(tokens[1][0]).toEqual({
        value: '$',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack', 'variable.other.php',
          'punctuation.definition.variable.php',
        ],
      });
      expect(tokens[1][2]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][3]).toEqual({
        value: '=',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.assignment.php',
        ],
      });
      expect(tokens[1][4]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][5]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][6]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    it('should tokenize + correctly', () => {
      expect(grammar).toBeTruthy();
      grammar = grammar || {};
      const tokens = grammar.tokenizeLines('<?hh\n1 + 2;');
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
        ],
      });
      expect(tokens[1][2]).toEqual({
        value: '+',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.arithmetic.php',
        ],
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    it('should tokenize - correctly', () => {
      expect(grammar).toBeTruthy();
      grammar = grammar || {};
      const tokens = grammar.tokenizeLines('<?hh\n1 - 2;');
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][2]).toEqual({
        value: '-',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.arithmetic.php',
        ],
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    it('should tokenize * correctly', () => {
      expect(grammar).toBeTruthy();
      grammar = grammar || {};
      const tokens = grammar.tokenizeLines('<?hh\n1 * 2;');
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][2]).toEqual({
        value: '*',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.arithmetic.php',
        ],
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    it('should tokenize / correctly', () => {
      expect(grammar).toBeTruthy();
      if (!grammar) {
        return;
      }
      const tokens = grammar.tokenizeLines('<?hh\n1 / 2;');
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][2]).toEqual({
        value: '/',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.arithmetic.php',
        ],
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    it('should tokenize % correctly', () => {
      expect(grammar).toBeTruthy();
      grammar = grammar || {};
      const tokens = grammar.tokenizeLines('<?hh\n1 % 2;');
      expect(tokens[1][0]).toEqual({
        value: '1',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][1]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][2]).toEqual({
        value: '%',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'keyword.operator.arithmetic.php',
        ],
      });
      expect(tokens[1][3]).toEqual({
        value: ' ',
        scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
      });
      expect(tokens[1][4]).toEqual({
        value: '2',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'constant.numeric.php',
        ],
      });
      expect(tokens[1][5]).toEqual({
        value: ';',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.terminator.expression.php',
        ],
      });
    });

    describe('combined operators', () => {
      it('should tokenize += correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test += 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '+=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize -= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test -= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '-=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize *= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test *= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '*=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize /= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test /= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '/=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize %= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test %= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '%=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize .= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test .= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '.=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.string.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize &= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test &= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '&=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize |= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test |= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '|=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize ^= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test ^= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '^=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize <<= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test <<= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '<<=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize >>= correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\n$test >>= 2;');
        expect(tokens[1][0]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: 'test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'variable.other.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][3]).toEqual({
          value: '>>=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack'],
        });
        expect(tokens[1][5]).toEqual({
          value: '2',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'constant.numeric.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      xit('should tokenize namespace at the same line as <?hh', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh namespace Test;');
        expect(tokens[0][1]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
          ],
        });
        expect(tokens[0][2]).toEqual({
          value: 'namespace',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
            'keyword.other.namespace.php',
          ],
        });
        expect(tokens[0][3]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
          ],
        });
        expect(tokens[0][4]).toEqual({
          value: 'Test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
            'entity.name.type.namespace.php',
          ],
        });
        expect(tokens[0][5]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize namespace correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\nnamespace Test;');
        expect(tokens[1][0]).toEqual({
          value: 'namespace',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
            'keyword.other.namespace.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
          ],
        });
        expect(tokens[1][2]).toEqual({
          value: 'Test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.namespace.php',
            'entity.name.type.namespace.php',
          ],
        });
        expect(tokens[1][3]).toEqual({
          value: ';',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.terminator.expression.php',
          ],
        });
      });

      it('should tokenize default array type with old array value correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines(
          '<?hh\nfunction array_test(array $value = array()) {}'
        );
        expect(tokens[1][0]).toEqual({
          value: 'function',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'storage.type.function.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php'],
        });
        expect(tokens[1][2]).toEqual({
          value: 'array_test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'entity.name.function.php',
          ],
        });
        expect(tokens[1][3]).toEqual({
          value: '(',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'punctuation.definition.parameters.begin.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: 'array',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'storage.type.php',
          ],
        });
        expect(tokens[1][5]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][7]).toEqual({
          value: 'value',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'variable.other.php',
          ],
        });
        expect(tokens[1][8]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
          ],
        });
        expect(tokens[1][9]).toEqual({
          value: '=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'keyword.operator.assignment.php',
          ],
        });
        expect(tokens[1][10]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
          ],
        });
        expect(tokens[1][11]).toEqual({
          value: 'array',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'support.function.construct.php',
          ],
        });
        expect(tokens[1][12]).toEqual({
          value: '(',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'punctuation.definition.array.begin.php',
          ],
        });
        expect(tokens[1][13]).toEqual({
          value: ')',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.array.php',
            'punctuation.definition.array.end.php',
          ],
        });
        expect(tokens[1][14]).toEqual({
          value: ')',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'punctuation.definition.parameters.end.php',
          ],
        });
        expect(tokens[1][15]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
          ],
        });
        expect(tokens[1][16]).toEqual({
          value: '{',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.section.scope.begin.php',
          ],
        });
        expect(tokens[1][17]).toEqual({
          value: '}',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.section.scope.end.php',
          ],
        });
      });

      it('should tokenize default array type with short array value correctly', () => {
        expect(grammar).toBeTruthy();
        grammar = grammar || {};
        const tokens = grammar.tokenizeLines('<?hh\nfunction array_test(array $value = []) {}');
        expect(tokens[1][0]).toEqual({
          value: 'function',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'storage.type.function.php',
          ],
        });
        expect(tokens[1][1]).toEqual({
          value: ' ',
          scopes: ['text.html.hack', 'meta.embedded.block.php', 'source.hack', 'meta.function.php'],
        });
        expect(tokens[1][2]).toEqual({
          value: 'array_test',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'entity.name.function.php',
          ],
        });
        expect(tokens[1][3]).toEqual({
          value: '(',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'punctuation.definition.parameters.begin.php',
          ],
        });
        expect(tokens[1][4]).toEqual({
          value: 'array',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
            'storage.type.php',
          ],
        });
        expect(tokens[1][5]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
          ],
        });
        expect(tokens[1][6]).toEqual({
          value: '$',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
            'variable.other.php',
            'punctuation.definition.variable.php',
          ],
        });
        expect(tokens[1][7]).toEqual({
          value: 'value',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
            'variable.other.php',
          ],
        });
        expect(tokens[1][8]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
          ],
        });
        expect(tokens[1][9]).toEqual({
          value: '=',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
          ],
        });
        expect(tokens[1][10]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
          ],
        });
        expect(tokens[1][11]).toEqual({
          value: '[',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
            'punctuation.definition.short.array.begin.php',
          ],
        });
        expect(tokens[1][12]).toEqual({
          value: ']',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'meta.function.arguments.php',
            'meta.function.argument.short.array.php',
            'punctuation.definition.short.array.end.php',
          ],
        });
        expect(tokens[1][13]).toEqual({
          value: ')',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
            'punctuation.definition.parameters.end.php',
          ],
        });
        expect(tokens[1][14]).toEqual({
          value: ' ',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'meta.function.php',
          ],
        });
        expect(tokens[1][15]).toEqual({
          value: '{',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.section.scope.begin.php',
          ],
        });
        expect(tokens[1][16]).toEqual({
          value: '}',
          scopes: [
            'text.html.hack',
            'meta.embedded.block.php',
            'source.hack',
            'punctuation.section.scope.end.php',
          ],
        });
      });
    });
  });

  describe('Embedded XHP', () => {

    beforeEach(function() {
      this.addMatchers({

        toMatchToken: function(expected) {

          return this.actual.value === expected;
        },
      });
    });

    /**
     * embeds XHP string into the necessary context for parsing
     * @param  {string} xhp code to parse
     * @return {[object]}     the parsed xhp tokens
     */
    const embedXHP = xhp => {
      const tokens = grammar.tokenizeLines(
        `<?hh\nfunction render() { return ${xhp}}`
      );

      const flattened = [].concat.apply([], tokens);
      // Skips wrapper code
      return flattened.slice(12, -1);
    };

    const embedFBT = content => {
      return embedXHP(`<fbt>${content}</fbt>`);
    };

    const expectFBT = tokens => {
      const [
        begin_open_tag,
        open_tag_name,
        end_open_tag,
        ...rest
      ] = tokens;

      const contents = rest.slice(0, -3);
      const [
        begin_close_tag,
        close_tag_name,
        end_close_tag,
      ] = rest.slice(-3);

      // Open XHP Tag
      expect(begin_open_tag).toEqual({
        value: '<',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
        ],
      });
      expect(open_tag_name).toEqual({
        value: 'fbt',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'entity.name.tag.open.xhp',
        ],
      });
      expect(end_open_tag).toEqual({
        value: '>',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
          'XHPStartTagEnd',
        ],
      });

      // Close XHP Tag
      expect(begin_close_tag).toEqual({
        value: '</',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
          'XHPEndTagStart',
        ],
      });
      expect(close_tag_name).toEqual({
        value: 'fbt',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'entity.name.tag.close.xhp',
        ],
      });
      expect(end_close_tag).toEqual({
        value: '>',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
        ],
      });

      return contents;
    };

    it('should support attributes on the XHP tag', () => {
      const [
        begin_open_tag,
        open_tag_name,
        space,
        attribute_name,
        attribute_assign,
        begin_attribute_quote,
        attribute_value,
        end_attribute_quote,
        end_open_tag,

      ] = embedXHP(`<fbt myAttr="test"></fbt>`);


      // Open XHP Tag
      expect(begin_open_tag).toEqual({
        value: '<',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
        ],
      });
      expect(open_tag_name).toEqual({
        value: 'fbt',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'entity.name.tag.open.xhp',
        ],
      });
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(space).toMatchToken(' ');
      expect(attribute_name).toEqual({
        value: 'myAttr',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'entity.other.attribute-name.xhp',
        ],
      });
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(attribute_assign).toMatchToken('=');
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(begin_attribute_quote).toMatchToken('"');
      expect(attribute_value).toEqual({
        value: 'test',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'string.quoted.double.php',
        ],
      });
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(end_attribute_quote).toMatchToken('"');
      expect(end_open_tag).toEqual({
        value: '>',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'punctuation.definition.tag.xhp',
          'XHPStartTagEnd',
        ],
      });
    });

    it('should tokenize literal content', () => {

      const tokens = embedFBT(`Something`);
      const codeTokens = expectFBT(tokens);

      const [
        literal,
      ] = codeTokens;

      // Literal Content
      expect(literal).toEqual({
        value: 'Something',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
        ],
      });
    });

    it('should tokenize single quote code strings', () => {

      const tokens = embedFBT(`{'single'}`);
      const codeTokens = expectFBT(tokens);

      const [
        begin_single_code,
        begin_single,
        single_string,
        end_single,
        end_single_code,
      ] = codeTokens;

      // Code with Single Quote String
      expect(begin_single_code).toEqual({
        value: '{',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.begin.xhp',
        ],
      });
      expect(begin_single).toEqual({
        value: '\'',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.single.php',
          'punctuation.definition.string.begin.php',
        ],
      });
      expect(single_string).toEqual({
        value: 'single',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.single.php',
          'meta.string-contents.quoted.single.php',
        ],
      });
      expect(end_single).toEqual({
        value: '\'',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.single.php',
          'punctuation.definition.string.end.php',
        ],
      });
      expect(end_single_code).toEqual({
        value: '}',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.end.xhp',
        ],
      });
    });

    it('should tokenize double quote code strings', () => {

      const tokens = embedFBT(`{"double"}`);
      const codeTokens = expectFBT(tokens);

      const [
        begin_double_code,
        begin_double,
        double_string,
        end_double,
        end_double_code,
      ] = codeTokens;

      // Code with Double Quote String
      expect(begin_double_code).toEqual({
        value: '{',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.begin.xhp',
        ],
      });
      expect(begin_double).toEqual({
        value: '"',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.double.php',
          'punctuation.definition.string.begin.php',
        ],
      });
      expect(double_string).toEqual({
        value: 'double',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.double.php',
          'meta.string-contents.quoted.double.php',
        ],
      });
      expect(end_double).toEqual({
        value: '"',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'string.quoted.double.php',
          'punctuation.definition.string.end.php',
        ],
      });
      expect(end_double_code).toEqual({
        value: '}',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.end.xhp',
        ],
      });
    });

    it('should tokenize php var code strings', () => {

      const tokens = embedFBT(`{$phpVar}`);
      const codeTokens = expectFBT(tokens);

      const [
        begin_php_var_code,
        begin_php_var,
        php_var,
        end_php_var_code,
      ] = codeTokens;

      // Code with PHP Variable
      expect(begin_php_var_code).toEqual({
        value: '{',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.begin.xhp',
        ],
      });
      expect(begin_php_var).toEqual({
        value: '$',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'variable.other.php',
          'punctuation.definition.variable.php',
        ],
      });
      expect(php_var).toEqual({
        value: 'phpVar',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'source.php.xhp',
          'variable.other.php',
        ],
      });
      expect(end_php_var_code).toEqual({
        value: '}',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'meta.embedded.expression.php',
          'punctuation.section.embedded.end.xhp',
        ],
      });
    });

    it('should tokenize html comments strings (with new lines)', () => {

      const tokens = embedFBT(`<!--first\nsecond-->`);
      const codeTokens = expectFBT(tokens);

      const [
        begin_comment,
        first_comment,
        second_comment,
        end_comment,
      ] = codeTokens;

      // HTML Comment
      expect(begin_comment).toEqual({
        value: '<!--',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'comment.block.html',
          'punctuation.definition.comment.html',
        ],
      });
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(first_comment).toMatchToken('first');
      // $FlowIgnore: Flow doesn't like custom matchers
      expect(second_comment).toMatchToken('second');
      expect(end_comment).toEqual({
        value: '-->',
        scopes: [
          'text.html.hack',
          'meta.embedded.block.php',
          'source.hack',
          'comment.block.html',
          'punctuation.definition.comment.html',
        ],
      });
    });
  });
});
