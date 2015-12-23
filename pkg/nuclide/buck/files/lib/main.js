'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

let subscriptions: ?CompositeDisposable = null;

module.exports = {
  activate() {
    if (subscriptions) {
      return;
    }

    subscriptions = new CompositeDisposable();

    const {registerGrammarForFileExtension} = require('../../../atom-helpers');
    subscriptions.add(registerGrammarForFileExtension('source.python', 'BUCK'));
    subscriptions.add(registerGrammarForFileExtension('source.ini', '.buckconfig'));
  },

  deactivate() {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  getHyperclickProvider() {
    return require('./HyperclickProvider');
  },
};
