"use strict";

function _CommandExecutor() {
  const data = require("../src/CommandExecutor");

  _CommandExecutor = function () {
    return data;
  };

  return data;
}

function _AutoImportsManager() {
  const data = require("../src/lib/AutoImportsManager");

  _AutoImportsManager = function () {
    return data;
  };

  return data;
}

function _ImportFormatter() {
  const data = require("../src/lib/ImportFormatter");

  _ImportFormatter = function () {
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
function getProgramBody(src) {
  const ast = (0, _AutoImportsManager().parseFile)(src);

  if (!(ast != null)) {
    throw new Error("Invariant violation: \"ast != null\"");
  }

  return ast.program.body;
}

describe('CommandExecutor', () => {
  it('can create new imports', () => {
    const importFormatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'test',
      uri: '/a/test2.js',
      line: 1,
      isTypeExport: false,
      isDefault: true
    }, getProgramBody('function f() {}'))).toEqual([{
      range: {
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 0
        }
      },
      newText: "import test from './test2';\n\n"
    }]);
  });
  it('can create new requires', () => {
    const importFormatter = new (_ImportFormatter().ImportFormatter)([], true);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'test',
      uri: '/a/test2.js',
      line: 1,
      hasteName: 'test2',
      isTypeExport: false,
      isDefault: true
    }, getProgramBody('function f() {}'))).toEqual([{
      range: {
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 0
        }
      },
      newText: "const test = require('test2');\n\n"
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'test',
      uri: '/a/test2.js',
      line: 1,
      hasteName: 'test2',
      isTypeExport: false,
      isDefault: false
    }, getProgramBody('function f() {}\nlet fake;'))).toEqual([{
      range: {
        start: {
          line: 0,
          character: 0
        },
        end: {
          line: 0,
          character: 0
        }
      },
      newText: "const {test} = require('test2');\n\n"
    }]);
  });
  it('preserves ordering of imports', () => {
    const sourceFile = `
import type {x} from 'def';

import {x} from 'abc';
import {y} from 'def';
import {z} from '../relative';
import {w} from './local';
`;
    const importFormatter = new (_ImportFormatter().ImportFormatter)(['node_modules'], false);

    function getExport(id, uri, isTypeExport = false, isDefault = false) {
      return {
        id,
        uri,
        line: 1,
        isTypeExport,
        isDefault
      };
    }

    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', 'node_modules/abc', true), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 1,
          character: 0
        },
        end: {
          line: 1,
          character: 0
        }
      },
      newText: "import type {test} from 'abc';\n"
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', 'node_modules/ghi', true), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 2,
          character: 0
        },
        end: {
          line: 2,
          character: 0
        }
      },
      newText: "import type {test} from 'ghi';\n"
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', '/abc.js'), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 5,
          character: 0
        },
        end: {
          line: 5,
          character: 0
        }
      },
      newText: "import {test} from '../abc';\n"
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', '/a/abc.js'), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 6,
          character: 0
        },
        end: {
          line: 6,
          character: 0
        }
      },
      newText: "import {test} from './abc';\n"
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', '/a/xyz.js'), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 7,
          character: 0
        },
        end: {
          line: 7,
          character: 0
        }
      },
      newText: "import {test} from './xyz';\n"
    }]);
  });
  it('can insert into existing imports', () => {
    const importFormatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'b',
      uri: '/a/test2.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    }, getProgramBody("import type {a} from './test2';\nimport {a} from './test2';"))).toEqual([{
      range: {
        start: {
          line: 1,
          character: 9
        },
        end: {
          line: 1,
          character: 9
        }
      },
      newText: ', b'
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'c',
      uri: '/a/test2.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    }, getProgramBody("const {a, b} = require('./test2');"))).toEqual([{
      range: {
        start: {
          line: 0,
          character: 11
        },
        end: {
          line: 0,
          character: 11
        }
      },
      newText: ', c'
    }]);
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', {
      id: 'newType',
      uri: '/a/test2.js',
      line: 1,
      isTypeExport: true,
      isDefault: false
    }, getProgramBody(['import type {', '  type1,', '  type2,', '  type3,', '  type4,', '} from "./test2"'].join('\n')))).toEqual([{
      range: {
        start: {
          line: 4,
          character: 7
        },
        end: {
          line: 4,
          character: 7
        }
      },
      newText: ',\n  newType'
    }]);
  });
  it('groups imports/requires with their own kind', () => {
    const sourceFile = `
import type {x} from 'def';

import {x} from 'abc';

const z = require('xyz');
`;
    const importFormatter = new (_ImportFormatter().ImportFormatter)(['node_modules'], true);

    function getExport(id, uri, isTypeExport = false, isDefault = false) {
      return {
        id,
        uri,
        line: 1,
        isTypeExport,
        isDefault
      };
    }

    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', 'node_modules/def', false), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 5,
          character: 0
        },
        end: {
          line: 5,
          character: 0
        }
      },
      newText: "const {test} = require('def');\n"
    }]);
    importFormatter.useRequire = false;
    expect((0, _CommandExecutor().getEditsForImport)(importFormatter, '/a/test.js', getExport('test', 'node_modules/def', false), getProgramBody(sourceFile))).toEqual([{
      range: {
        start: {
          line: 4,
          character: 0
        },
        end: {
          line: 4,
          character: 0
        }
      },
      newText: "import {test} from 'def';\n"
    }]);
  });
});