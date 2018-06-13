'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _;

function _load_() {
  return _ = require('..');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('serverStatusUpdatesToBusyMessages', () => {
  it('should work', async () => {
    await (async () => {
      const input = [{
        pathToRoot: 'nuclide://host.example.com/remote/root',
        status: 'not running'
      }, {
        pathToRoot: '/local/root',
        status: 'busy'
      }, {
        pathToRoot: 'nuclide://host.example.com/remote/root',
        status: 'init'
      }, {
        pathToRoot: '/local/root',
        status: 'ready'
      }, {
        pathToRoot: 'nuclide://host.example.com/remote/root',
        status: 'ready'
      },
      // Ending the stream should also dispose this one.
      {
        pathToRoot: '/local/test',
        status: 'busy'
      }];
      const expected = [{
        message: 'Flow server is busy (/local/root)'
      }, {
        message: 'Flow server is initializing (host.example.com:/remote/root)'
      }, {
        message: 'Flow server is busy (/local/root)',
        dispose: true
      }, {
        message: 'Flow server is initializing (host.example.com:/remote/root)',
        dispose: true
      }, {
        message: 'Flow server is busy (/local/test)'
      }, {
        message: 'Flow server is busy (/local/test)',
        dispose: true
      }];

      const messages = [];
      const mockBusySignal = {
        reportBusyWhile() {
          throw new Error('stub');
        },
        reportBusy(title, options) {
          let currentTitle = title;
          messages.push({ message: currentTitle });
          const busyMessage = {
            setTitle: title2 => {
              currentTitle = title2;
              messages.push({ message: currentTitle });
            },
            dispose: () => {
              messages.push({ message: currentTitle, dispose: true });
            }
          };
          return busyMessage;
        },
        dispose() {}
      };
      (0, (_ || _load_()).serverStatusUpdatesToBusyMessages)(_rxjsBundlesRxMinJs.Observable.from(input), mockBusySignal);
      expect(messages).toEqual(expected);
    })();
  });
});