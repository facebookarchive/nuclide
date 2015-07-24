'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('atom');

var {uncachedRequire} = require('nuclide-test-helpers');

function newLinterAdapter(linter) {
  return new (uncachedRequire(require, '../lib/LinterAdapter'))(linter);
}

var grammar = 'testgrammar';

describe('LinterAdapter', () => {
  var eventCallback: any;
  var fakeLinter: any;
  var RealTextEventDispatcher: any;

  beforeEach(() => {
    fakeLinter = {
      grammarScopes: [grammar],
      scope: 'file',
      lintOnFly: true,
      lint: () => Promise.resolve([]),
    };
    spyOn(fakeLinter, 'lint').andCallThrough();
    class FakeEventDispatcher {
      onFileChange(grammars, callback) {
        eventCallback = callback;
        return new Disposable(() => {});
      }
    }
    RealTextEventDispatcher = require('../lib/TextEventDispatcher').TextEventDispatcher;
    require('../lib/TextEventDispatcher').TextEventDispatcher = (FakeEventDispatcher: any);
    newLinterAdapter(fakeLinter);
  });

  afterEach(() => {
    require('../lib/TextEventDispatcher').TextEventDispatcher = RealTextEventDispatcher;
  });

  it('should dispatch the linter on an event', () => {
    eventCallback({getPath() { return 'foo'; }});
    expect(fakeLinter.lint).toHaveBeenCalled();
  });
});
