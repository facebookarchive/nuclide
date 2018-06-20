'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _BuckBuildSystem;

function _load_BuckBuildSystem() {
  return _BuckBuildSystem = require('../lib/BuckBuildSystem');
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

describe('BuckBuildSystem', () => {
  let buckBuildSystem;
  beforeEach(() => {
    buckBuildSystem = new (_BuckBuildSystem || _load_BuckBuildSystem()).BuckBuildSystem();
  });

  describe('_consumeEventStream', () => {
    it("doesn't swallow log messages", async () => {
      await (async () => {
        const result = await buckBuildSystem._consumeEventStream(_rxjsBundlesRxMinJs.Observable.from([{ type: 'log', message: 'test', level: 'error' }, { type: 'log', message: 'test2', level: 'warning' }, { type: 'progress', progress: 1 }]), '').toArray().toPromise();

        expect(result).toEqual([{ type: 'message', message: { text: 'test', level: 'error' } }, { type: 'message', message: { text: 'test2', level: 'warning' } }, { type: 'progress', progress: 1 }]);
      })();
    });

    it('emits diagnostics', async () => {
      const diagnostics = [];
      const subscription = buckBuildSystem.getDiagnosticProvider().updates.subscribe(update => {
        // Make a deep copy (since the messages will change.)
        const deepCopy = Array.from(update.entries()).map(([key, value]) => [key, Array.from(value)]);
        diagnostics.push(new Map(deepCopy));
      });

      const diagnostic = {
        providerName: 'Buck',
        type: 'Error',
        filePath: 'a'
      };

      const result = await buckBuildSystem._consumeEventStream(_rxjsBundlesRxMinJs.Observable.from([{
        type: 'diagnostics',
        diagnostics: [diagnostic]
      }, {
        type: 'diagnostics',
        diagnostics: [Object.assign({}, diagnostic, { type: 'Warning' })]
      }, {
        type: 'diagnostics',
        diagnostics: [Object.assign({}, diagnostic, { filePath: 'b' })]
      }]), '').toArray().toPromise();

      // Check for the message indicating to look in diagnostics.
      expect(result.length).toEqual(1);
      const msg = result[0];
      expect(msg.type).toEqual('message');

      if (!(msg.type === 'message')) {
        throw new Error('Invariant violation: "msg.type === \'message\'"');
      }

      expect(msg.message.level).toEqual('info');
      expect(msg.message.text).toContain('Diagnostics');

      expect(diagnostics).toEqual([new Map([['a', [diagnostic]]]), new Map([['a', [diagnostic, Object.assign({}, diagnostic, { type: 'Warning' })]]]),
      // No need to emit diagnostics for 'a' again.
      new Map([['b', [Object.assign({}, diagnostic, { filePath: 'b' })]]])]);

      subscription.unsubscribe();
    });
  });
});