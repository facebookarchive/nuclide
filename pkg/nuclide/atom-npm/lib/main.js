'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {fsPromise} = require('nuclide-commons');

async function loadStyles(stylesPath: string): Promise {
  // TODO(jjiaa): If possible, check that `stylesPath` is also a directory.
  if (!(await fsPromise.exists(stylesPath))) {
    return;
  }

  // TODO(jjiaa): Find a way to remove the stylesheets when they're unneeded.
  // Note: Disposing the values of the statement below removes the stylesheets.
  //
  // The stylesheets will be loaded asynchronously, so there might be a slight
  // visual glitch if the widget is drawn before the stylesheets are loaded.
  (await fsPromise.readdir(stylesPath))
      .filter(filePath => (filePath.endsWith('.less') || filePath.endsWith('.css')))
      // Styles should be loaded in alphabetical order according to
      // https://atom.io/docs/v0.186.0/creating-a-package
      .sort()
      .map(filePath => atom.themes.requireStylesheet(path.join(stylesPath, filePath)));
}

module.exports = {
  load(libPath: string, mainFilename: string): any {
    if (!atom.nuclide) {
      atom.nuclide = {};
    }

    if (!atom.nuclide[mainFilename]) {
      atom.nuclide[mainFilename] = require(path.join(libPath, mainFilename));

      var packagePath = path.dirname(libPath);
      loadStyles(path.join(packagePath, 'styles'));
    }
    return atom.nuclide[mainFilename];
  },
};
