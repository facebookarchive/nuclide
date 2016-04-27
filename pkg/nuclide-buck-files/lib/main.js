Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.getHyperclickProvider = getHyperclickProvider;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function activate() {
  var _require = require('../../nuclide-atom-helpers');

  var registerGrammarForFileExtension = _require.registerGrammarForFileExtension;

  registerGrammarForFileExtension('source.python', 'BUCK');
  registerGrammarForFileExtension('source.json', 'BUCK.autodeps');
  registerGrammarForFileExtension('source.ini', '.buckconfig');
}

function deactivate() {}

function getHyperclickProvider() {
  return require('./HyperclickProvider');
}