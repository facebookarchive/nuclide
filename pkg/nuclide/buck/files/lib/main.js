'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  activate() {
    const {registerGrammarForFileExtension} = require('../../../atom-helpers');
    registerGrammarForFileExtension('source.python', 'BUCK');
    registerGrammarForFileExtension('source.ini', '.buckconfig');
  },

  deactivate() {
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },
};
