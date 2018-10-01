"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _registerGrammar() {
  const data = _interopRequireDefault(require("../register-grammar"));

  _registerGrammar = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('registerGrammar', () => {
  it('works', async () => {
    atom.grammars.loadGrammarSync(_nuclideUri().default.join(__dirname, '../__mocks__/grammars/javascript.cson'));
    (0, _registerGrammar().default)('source.js', ['cats']);
    const textEditor = await atom.workspace.open(`${await _fsPromise().default.tempfile()}.cats`);
    expect(textEditor.getGrammar().scopeName).toBe('source.js');
    textEditor.destroy();
  });
});