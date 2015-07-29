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

function makePromise(ret: mixed, timeout: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ret);
    }, timeout);
  });
}

describe('LinterAdapter', () => {
  var eventCallback: any;
  var fakeLinter: any;
  var RealTextEventDispatcher: any;
  var linterAdapter: any;
  var linterReturn: any;

  beforeEach(() => {
    linterReturn = Promise.resolve([]);
    fakeLinter = {
      grammarScopes: [grammar],
      scope: 'file',
      lintOnFly: true,
      lint: () => linterReturn,
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
    linterAdapter = newLinterAdapter(fakeLinter);

  });

  afterEach(() => {
    require('../lib/TextEventDispatcher').TextEventDispatcher = RealTextEventDispatcher;
  });

  it('should dispatch the linter on an event', () => {
    eventCallback({getPath() { return 'foo'; }});
    expect(fakeLinter.lint).toHaveBeenCalled();
  });

  it('should not reorder results', () => {
    waitsForPromise(async () => {
      var numMessages = 0;
      var lastMessage = null;
      linterAdapter.onMessageUpdate(message => {
        numMessages++;
        lastMessage = message;
      });
      // dispatch two linter requests
      linterReturn = makePromise([{type: 'Error', filePath: 'bar'}], 50);
      eventCallback({getPath() { return 'foo'; }});
      linterReturn = makePromise([{type: 'Error', filePath: 'baz'}], 10);
      eventCallback({getPath() { return 'foo'; }});
      // If we call it once with a larger value, the first promise will resolve
      // first, even though the timeout is larger
      window.advanceClock(30);
      window.advanceClock(30);
      waitsFor(() => {
        return numMessages === 1 && lastMessage.filePathToMessages.has('baz');
      }, 'There should be only the latest message', 100);
    });
  });
});
