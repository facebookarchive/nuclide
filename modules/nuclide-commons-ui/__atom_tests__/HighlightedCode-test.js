"use strict";

function _dedent() {
  const data = _interopRequireDefault(require("dedent"));

  _dedent = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _HighlightedCode() {
  const data = require("../HighlightedCode");

  _HighlightedCode = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
describe('highlightCode', () => {
  let grammar;
  beforeEach(async () => {
    await atom.packages.activatePackage('language-gfm');
    grammar = (0, _nullthrows().default)(atom.grammars.grammarForScopeName('source.gfm'));
  });
  it('is able to tokenize lines using a grammar', () => {
    const tokens = (0, _HighlightedCode().highlightCode)(grammar, _dedent().default`
        #Heading
        __bold__
        *italic*
      `); // Desperately needs Jest snapshots!

    expect(tokens).toEqual([[{
      type: 'start',
      className: 'syntax--source syntax--gfm'
    }, {
      type: 'start',
      className: 'syntax--markup syntax--heading syntax--heading-1 syntax--gfm'
    }, {
      type: 'start',
      className: 'syntax--markup syntax--heading syntax--marker syntax--gfm'
    }, {
      type: 'value',
      value: '#'
    }, {
      type: 'end'
    }, {
      type: 'value',
      value: 'Heading'
    }, {
      type: 'end'
    }, {
      type: 'end'
    }], [{
      type: 'start',
      className: 'syntax--source syntax--gfm'
    }, {
      type: 'start',
      className: 'syntax--markup syntax--bold syntax--gfm'
    }, {
      type: 'value',
      value: '__'
    }, {
      type: 'value',
      value: 'bold'
    }, {
      type: 'value',
      value: '__'
    }, {
      type: 'end'
    }, {
      type: 'end'
    }], [{
      type: 'start',
      className: 'syntax--source syntax--gfm'
    }, {
      type: 'start',
      className: 'syntax--markup syntax--italic syntax--gfm'
    }, {
      type: 'value',
      value: '*'
    }, {
      type: 'value',
      value: 'italic'
    }, {
      type: 'value',
      value: '*'
    }, {
      type: 'end'
    }, {
      type: 'end'
    }]]);
  });
  it('becomes HTML using highlightCodeHtml', () => {
    const EXPECTED = `
      <span class="syntax--source syntax--gfm">
        <span class="syntax--markup syntax--heading syntax--heading-1 syntax--gfm">
          <span class="syntax--markup syntax--heading syntax--marker syntax--gfm">
            #
          </span>
          Heading
        </span>
      </span>
    `.replace(/\s+/g, '');
    const html = (0, _HighlightedCode().highlightCodeHtml)(grammar, '#Heading');
    expect(html.replace(/\s+/g, '')).toBe(EXPECTED);
    const node = document.createElement('div');

    _reactDom.default.render(React.createElement(_HighlightedCode().HighlightedCode, {
      grammar: grammar,
      code: "#Heading"
    }), node);

    expect(node.innerHTML.replace(/\s+/g, '')).toContain(EXPECTED);
  });
  it('escapes HTML in HTML', () => {
    const EXPECTED = `
      <span class="syntax--source syntax--gfm">
        &lt;&gt;
      </span>
    `.replace(/\s+/g, '');
    const html = (0, _HighlightedCode().highlightCodeHtml)(grammar, '<>');
    expect(html.replace(/\s+/g, '')).toBe(EXPECTED);
  });
});