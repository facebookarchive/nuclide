'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function activate() {
  const {registerGrammarForFileExtension} = require('../../nuclide-atom-helpers');
  registerGrammarForFileExtension('source.python', 'BUCK');
  registerGrammarForFileExtension('source.json', 'BUCK.autodeps');
  registerGrammarForFileExtension('source.ini', '.buckconfig');
}

export function deactivate() {
}

export function getHyperclickProvider() {
  return require('./HyperclickProvider');
}
