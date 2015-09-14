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

var subscriptions: ?CompositeDisposable = null;

module.exports = {

  activate(): void {
    if (subscriptions) {
      return;
    }

    var {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
    subscriptions = new CompositeDisposable();
    subscriptions.add(registerGrammarForFileExtension('source.json', '.arcconfig'));
  },

  dactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  provideLinter() {
    return require('./ArcanistLinter');
  },

};
