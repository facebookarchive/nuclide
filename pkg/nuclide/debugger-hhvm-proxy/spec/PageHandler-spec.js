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
  let chromeCallback;
  let notificationCallback;
  let handler;

  beforeEach(() => {
    chromeCallback = jasmine.createSpyObj(
      'chromeCallback',
      ['replyToCommand', 'replyWithError', 'sendMethod']
    );
    notificationCallback = jasmine.createSpyObj(
      'notificationCallback',
      ['sendInfo', 'sendWarning', 'sendError', 'sendFatalError']
    );
    handler = new PageHandler(chromeCallback, notificationCallback);
  });

  it('enable', () => {
    handler.handleMethod(1, 'enable');
    expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(1, {}, undefined);
  });

  it('canScreencast', () => {
    handler.handleMethod(2, 'canScreencast');
    expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(2, {result: false}, undefined);
  });

  it('getResourceTree', () => {
    handler.handleMethod(3, 'getResourceTree');
    expect(chromeCallback.replyToCommand).toHaveBeenCalledWith(3, {
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
      },
    }, undefined);
  });

  it('unknown', () => {
    handler.handleMethod(4, 'unknown');
    expect(chromeCallback.replyWithError).toHaveBeenCalledWith(4, jasmine.any(String));
  });
});
