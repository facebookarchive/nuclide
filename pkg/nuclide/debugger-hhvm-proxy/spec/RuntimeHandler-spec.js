'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var RuntimeHandler = require('../lib/RuntimeHandler');

describe('debugger-hhvm-proxy RuntimeHandler', () => {
    var callback;
    var handler;

    beforeEach(() => {
      callback = jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']);
      handler = new RuntimeHandler(callback);
    });

    it('enable', () => {
      handler.handleMethod(1, 'enable');
      expect(callback.sendMethod).toHaveBeenCalledWith(
        'Runtime.executionContextCreated',
        {
          'context': {
            'id': 1,
            'frameId': 'Frame.0',
            'name': 'hhvm: TODO: mangle in pid, idekey, script from connection',
          }
        });
    });

    it('unknown', () => {
      handler.handleMethod(4, 'unknown');
      expect(callback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
    });
});
