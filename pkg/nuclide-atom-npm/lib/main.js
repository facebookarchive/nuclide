var loadStyles = _asyncToGenerator(function* (stylesPath) {
  // TODO(jjiaa): If possible, check that `stylesPath` is also a directory.
  if (!(yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.exists(stylesPath))) {
    return;
  }

  // TODO(jjiaa): Find a way to remove the stylesheets when they're unneeded.
  // Note: Disposing the values of the statement below removes the stylesheets.
  //
  // The stylesheets will be loaded asynchronously, so there might be a slight
  // visual glitch if the widget is drawn before the stylesheets are loaded.
  (yield (_nuclideCommons2 || _nuclideCommons()).fsPromise.readdir(stylesPath)).filter(function (filePath) {
    return filePath.endsWith('.less') || filePath.endsWith('.css');
  })
  // Styles should be loaded in alphabetical order according to
  // https://atom.io/docs/v0.186.0/creating-a-package
  .sort().map(function (filePath) {
    return atom.themes.requireStylesheet((_path2 || _path()).default.join(stylesPath, filePath));
  });
}

/**
 * Load all of the grammars synchronously because the top-level load() function should be
 * synchronous so that it works as expected with require().
 */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fsPlus2;

function _fsPlus() {
  return _fsPlus2 = _interopRequireDefault(require('fs-plus'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

function loadGrammarsSync(packagePath) {
  var grammarsDir = (_path2 || _path()).default.join(packagePath, 'grammars');
  if (!(_fsPlus2 || _fsPlus()).default.isDirectorySync(grammarsDir)) {
    return;
  }

  (_fsPlus2 || _fsPlus()).default.traverseTreeSync(grammarsDir, function (file) {
    return atom.grammars.loadGrammarSync(file);
  }, function (directory) {
    return null;
  });
}

module.exports = {
  load: function load(libPath, mainFilename) {
    // $FlowFixMe Non-Atom expando property 'nuclide' for our own private purposes.
    var nuclide = atom.nuclide;
    if (!nuclide) {
      // $FlowFixMe atom.nuclide expando-property.
      atom.nuclide = nuclide = {};
    }

    if (!nuclide[mainFilename]) {
      // $FlowIgnore
      nuclide[mainFilename] = require((_path2 || _path()).default.join(libPath, mainFilename));

      var packagePath = (_path2 || _path()).default.dirname(libPath);
      loadStyles((_path2 || _path()).default.join(packagePath, 'styles'));

      loadGrammarsSync(packagePath);
    }
    return nuclide[mainFilename];
  }
};