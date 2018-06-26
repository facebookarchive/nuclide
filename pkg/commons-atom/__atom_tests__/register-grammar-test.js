'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../register-grammar'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('registerGrammar', () => {
  it('works', async () => {
    atom.grammars.loadGrammarSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/grammars/javascript.cson'));
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.js', ['cats']);
    const textEditor = await atom.workspace.open(`${await (_fsPromise || _load_fsPromise()).default.tempfile()}.cats`);
    expect(textEditor.getGrammar().scopeName).toBe('source.js');
    textEditor.destroy();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */