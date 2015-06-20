'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var PageHandler = require('../lib/PageHandler');

describe('debugger-hhvm-proxy PageHandler', () => {
    var callback;
    var handler;

    beforeEach(() => {
      callback = jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']);
      handler = new PageHandler(callback);
    });

    it('enable', () => {
      handler.handleMethod(1, 'enable');
      expect(callback.replyToCommand).toHaveBeenCalledWith(1, {}, undefined);
    });

    it('canScreencast', () => {
      handler.handleMethod(2, 'canScreencast');
      expect(callback.replyToCommand).toHaveBeenCalledWith(2, {result: false}, undefined);
    });

    it('getResourceTree', () => {
      handler.handleMethod(3, 'getResourceTree');
      expect(callback.replyToCommand).toHaveBeenCalledWith(3, {
        'frameTree': {
          'childFrames': [],
          'resources': [],
          'frame': {
            'id': 'Frame.0',
            'loaderId': 'Loader.0',
            'mimeType': '',
            'name': 'HHVM',
            'securityOrigin': '',
            'url': 'hhvm:///',
          },
        }
      }, undefined);
    });

    it('unknown', () => {
      handler.handleMethod(4, 'unknown');
      expect(callback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
    });
});
