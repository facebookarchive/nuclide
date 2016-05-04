Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.provideOutlines = provideOutlines;
exports.deactivate = deactivate;

var PYTHON_GRAMMARS = ['source.python'];

function activate() {}

function provideOutlines() {
  var _require = require('./PythonOutlineProvider');

  var PythonOutlineProvider = _require.PythonOutlineProvider;

  var provider = new PythonOutlineProvider();
  return {
    grammarScopes: PYTHON_GRAMMARS,
    priority: 1,
    name: 'Python',
    getOutline: provider.getOutline.bind(provider)
  };
}

function deactivate() {}