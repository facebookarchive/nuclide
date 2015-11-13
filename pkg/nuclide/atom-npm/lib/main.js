'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const fs = require('fs-plus');
const path = require('path');
const {fsPromise} = require('nuclide-commons');

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

/**
 * Load all of the grammars synchronously because the top-level load() function should be
 * synchronous so that it works as expected with require().
 */
function loadGrammarsSync(packagePath: string) {
  const grammarsDir = path.join(packagePath, 'grammars');
  if (!fs.isDirectorySync(grammarsDir)) {
    return;
  }

  fs.traverseTreeSync(
    grammarsDir,
    file => atom.grammars.loadGrammarSync(file),
    directory => null
  );
}

module.exports = {
  load(libPath: string, mainFilename: string): any {
    // $FlowFixMe Non-Atom expando property 'nuclide' for our own private purposes.
    let nuclide = atom.nuclide;
    if (!nuclide) {
      // $FlowFixMe atom.nuclide expando-property.
      atom.nuclide = nuclide = {};
    }

    if (!nuclide[mainFilename]) {
      nuclide[mainFilename] = require(path.join(libPath, mainFilename));

      const packagePath = path.dirname(libPath);
      loadStyles(path.join(packagePath, 'styles'));

      loadGrammarsSync(packagePath);
    }
    return nuclide[mainFilename];
  },
};
