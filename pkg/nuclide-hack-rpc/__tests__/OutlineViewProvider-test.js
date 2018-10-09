"use strict";

function _OutlineView() {
  const data = require("../lib/OutlineView");

  _OutlineView = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('outlineFromHackIdeOutline', () => {
  it('function', () => {
    const actualOutline = (0, _OutlineView().outlineFromHackIdeOutline)([{
      name: 'f',
      representativeName: 'f',
      modifiers: [],
      span: {
        line_start: 3,
        line_end: 4,
        char_start: 1,
        char_end: 1,
        filename: ''
      },
      kind: 'function',
      params: [{
        kind: 'param',
        position: {
          filename: '',
          char_end: 17,
          char_start: 16,
          line: 3
        },
        modifiers: [],
        span: {
          line_start: 3,
          line_end: 3,
          char_start: 12,
          char_end: 17,
          filename: ''
        },
        name: '$x'
      }, {
        kind: 'param',
        position: {
          filename: '',
          char_end: 21,
          char_start: 20,
          line: 3
        },
        modifiers: [],
        span: {
          line_start: 3,
          line_end: 3,
          char_start: 20,
          char_end: 21,
          filename: ''
        },
        name: '$y'
      }],
      position: {
        filename: '',
        char_end: 10,
        line: 3,
        char_start: 10
      }
    }]);
    expect(actualOutline).toMatchSnapshot();
  });
  it('class', () => {
    const actualOutline = (0, _OutlineView().outlineFromHackIdeOutline)([{
      name: 'D',
      children: [{
        position: {
          filename: '',
          char_end: 14,
          char_start: 14,
          line: 11
        },
        kind: 'typeconst',
        name: 'Y',
        modifiers: [],
        span: {
          char_end: 20,
          filename: '',
          line_end: 11,
          char_start: 3,
          line_start: 11
        }
      }, {
        kind: 'property',
        position: {
          char_start: 39,
          line: 12,
          char_end: 40,
          filename: ''
        },
        modifiers: ['private'],
        span: {
          line_end: 12,
          char_start: 39,
          char_end: 40,
          filename: '',
          line_start: 12
        },
        name: 'x'
      }, {
        name: '__construct',
        modifiers: ['public'],
        span: {
          char_end: 3,
          filename: '',
          line_end: 14,
          char_start: 3,
          line_start: 12
        },
        position: {
          char_start: 19,
          line: 12,
          filename: '',
          char_end: 29
        },
        kind: 'method',
        params: [{
          position: {
            filename: '',
            char_end: 40,
            char_start: 39,
            line: 12
          },
          kind: 'param',
          name: '$x',
          modifiers: ['private'],
          span: {
            line_start: 12,
            char_start: 39,
            line_end: 12,
            filename: '',
            char_end: 40
          }
        }]
      }, {
        modifiers: ['abstract'],
        span: {
          line_start: 15,
          char_end: 18,
          filename: '',
          line_end: 15,
          char_start: 18
        },
        name: 'Z',
        kind: 'const',
        position: {
          filename: '',
          char_end: 18,
          line: 15,
          char_start: 18
        }
      }, {
        kind: 'const',
        position: {
          char_end: 9,
          filename: '',
          char_start: 9,
          line: 16
        },
        name: 'X',
        modifiers: [],
        span: {
          char_start: 9,
          line_end: 16,
          filename: '',
          char_end: 14,
          line_start: 16
        }
      }],
      span: {
        filename: '',
        char_end: 1,
        char_start: 1,
        line_end: 17,
        line_start: 10
      },
      modifiers: ['abstract'],
      kind: 'class',
      position: {
        char_start: 16,
        line: 10,
        filename: '',
        char_end: 16
      }
    }]);
    expect(actualOutline).toMatchSnapshot();
  });
  it('trait', () => {
    const actualOutline = (0, _OutlineView().outlineFromHackIdeOutline)([{
      position: {
        filename: '',
        char_end: 7,
        char_start: 7,
        line: 19
      },
      kind: 'trait',
      children: [{
        name: 'f',
        span: {
          char_start: 3,
          line_end: 22,
          filename: '',
          char_end: 3,
          line_start: 20
        },
        modifiers: ['public'],
        position: {
          char_start: 19,
          line: 20,
          filename: '',
          char_end: 19
        },
        kind: 'method',
        params: []
      }],
      name: 'T',
      modifiers: [],
      span: {
        char_start: 1,
        line_end: 23,
        filename: '',
        char_end: 1,
        line_start: 19
      }
    }]);
    expect(actualOutline).toMatchSnapshot();
  });
  it('interface', () => {
    const actualOutline = (0, _OutlineView().outlineFromHackIdeOutline)([{
      kind: 'interface',
      position: {
        line: 25,
        char_start: 11,
        filename: '',
        char_end: 11
      },
      span: {
        filename: '',
        char_end: 14,
        char_start: 1,
        line_end: 25,
        line_start: 25
      },
      modifiers: [],
      name: 'I',
      children: []
    }]);
    expect(actualOutline).toMatchSnapshot();
  });
  it('enum', () => {
    const actualOutline = (0, _OutlineView().outlineFromHackIdeOutline)([{
      name: 'En',
      children: [{
        kind: 'const',
        position: {
          line: 28,
          char_start: 3,
          filename: '',
          char_end: 3
        },
        span: {
          filename: '',
          char_end: 7,
          char_start: 3,
          line_end: 28,
          line_start: 28
        },
        modifiers: [],
        name: 'C'
      }],
      span: {
        line_start: 27,
        line_end: 29,
        char_start: 1,
        char_end: 1,
        filename: ''
      },
      modifiers: [],
      position: {
        char_end: 7,
        filename: '',
        char_start: 6,
        line: 27
      },
      kind: 'enum'
    }]);
    expect(actualOutline).toMatchSnapshot();
  });
});