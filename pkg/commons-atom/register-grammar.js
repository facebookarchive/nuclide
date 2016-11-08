'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerGrammar;


/**
 * Utility to make it easier to register a file extension with a grammar,
 * overwriting existing registrations or adding duplicates. The
 * "core.customFileTypes" config was added in Atom v1.0.8.
 * https://github.com/atom/atom/releases/tag/v1.0.8
 *
 * Note on periods: Using the extension "cats" will match the files "file.cats"
 *   and "cats". The extension ".cats" will match a file named ".cats".
 *
 * @param scopeName for the grammar, such as "source.js" or "source.python"
 * @param extension when a file is opened that ends with this extension, its
 *   grammar will be updated to match that of the specified scopeName, if
 *   the grammar is available.
 * @return whether the extension was registered or not.
 */
function registerGrammar(scopeName, extension) {
  let customFileTypes = atom.config.get('core.customFileTypes');
  if (!customFileTypes || typeof customFileTypes !== 'object') {
    customFileTypes = {};
  }

  if (!customFileTypes) {
    throw new Error('Invariant violation: "customFileTypes"');
  }

  let customFileType = customFileTypes[scopeName];
  if (!Array.isArray(customFileType)) {
    customFileType = [];
  }
  if (customFileType.indexOf(extension) === -1) {
    customFileTypes[scopeName] = customFileType.concat(extension);
    atom.config.set('core.customFileTypes', customFileTypes);
    return true;
  }
  return false;
}module.exports = exports['default'];