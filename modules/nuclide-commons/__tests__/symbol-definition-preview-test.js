'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclideUri'));
}

var _dedent;

function _load_dedent() {
  return _dedent = _interopRequireDefault(require('dedent'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _symbolDefinitionPreview;

function _load_symbolDefinitionPreview() {
  return _symbolDefinitionPreview = require('../symbol-definition-preview');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function javascriptFixtureDefinitionWithPoint(point) {
  return {
    path: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__', 'fixtures', 'symbol-definition-preview-sample.js'),
    language: 'javascript',
    position: point
  };
}

function pythonFixtureDefinitionWithPoint(point) {
  return {
    path: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__', 'fixtures', 'symbol-definition-preview-sample.py'),
    language: 'python',
    position: point
  };
}

describe('getDefinitionPreview', () => {
  describe('Constant symbols', () => {
    it('returns the only line of a one-line symbol', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(11, 6)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual('const A_CONSTANT = 42;');
      })();
    });

    it('returns the entire multi-line symbol', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(15, 6)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`const A_MULTILINE_CONST = \`
            hey look I span
              multiple
                lines
          \`;`);
      })();
    });
  });

  describe('Type symbols', () => {
    it('returns an entire multi-line type', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(21, 5)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`type Something = {
            name: string,
            age?: number,
          };`);
      })();
    });

    it('returns only the property from within a type', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(44, 4)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual('name: string,');
      })();
    });

    it('returns property and value of a complex type within a type', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(43, 2)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`properties: {
            name: string,
            age?: number,
          },`);
      })();
    });
  });

  describe('Function symbols', () => {
    it('returns just one line if parens are balanced on the first line', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(26, 16)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual('export function aSingleLineFunctionSignature() {');
      })();
    });

    it('works without parentheses as with python', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(pythonFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(7, 4)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual('def foo(bar=27):');
      })();
    });

    it('works without parentheses but with braces as with python', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(pythonFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(11, 4)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`def baz(test={
            'one': 'two'
          }):`);
      })();
    });

    it("doesn't dedent beyond the current lines indentation level", async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(36, 18)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`
              export function aPoorlyIndentedFunction(
            aReallyReallyLongArgumentNameThatWouldRequireThisToBreakAcrossMultipleLines: Something,
            ): number {
          `);
      })();
    });

    it('reads until the indentation returns to initial and parens are balanced', async () => {
      await (async () => {
        const preview = await (0, (_symbolDefinitionPreview || _load_symbolDefinitionPreview()).getDefinitionPreview)(javascriptFixtureDefinitionWithPoint(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(30, 16)));

        expect(preview).not.toBeNull();

        if (!(preview != null)) {
          throw new Error('Invariant violation: "preview != null"');
        }

        expect(preview.contents).toEqual((_dedent || _load_dedent()).default`
            export function aMultiLineFunctionSignature(
              aReallyReallyLongArgumentNameThatWouldRequireThisToBreakAcrossMultipleLines: Something,
            ): number {
          `);
      })();
    });
  });
});