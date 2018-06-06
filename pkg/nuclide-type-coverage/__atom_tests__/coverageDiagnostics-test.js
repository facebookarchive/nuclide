'use strict';

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _coverageDiagnostics;

function _load_coverageDiagnostics() {
  return _coverageDiagnostics = require('../lib/coverageDiagnostics');
}

describe('diagnosticProviderForResultStream', () => {
  let inputResults = null;
  let isEnabledStream = null;

  let diagnosticProvider = null;

  let updates = null;
  let invalidations = null;

  let editor = null;

  let provider = null;
  let sampleResult = null;

  beforeEach(() => {
    updates = [];
    invalidations = [];
    inputResults = new _rxjsBundlesRxMinJs.Subject();
    isEnabledStream = new _rxjsBundlesRxMinJs.Subject();
    diagnosticProvider = (0, (_coverageDiagnostics || _load_coverageDiagnostics()).diagnosticProviderForResultStream)(inputResults, isEnabledStream);

    // For now it's easy enough to stub out the editor but in the future it may be worthwhile to use
    // an action TextEditor object. We would need an actual fixture to open, though, since we rely
    // on the path being non-null (so `atom.workspace.open()` would not be sufficient).
    editor = {
      getPath() {
        return 'foo';
      }
    };

    provider = {
      getCoverage() {
        return Promise.resolve(null);
      },
      priority: 1,
      grammarScopes: [],
      displayName: 'Foo'
    };

    sampleResult = {
      percentage: 90,
      uncoveredRegions: [{
        range: new _atom.Range([1, 2], [3, 4])
      }, {
        range: new _atom.Range([2, 3], [4, 5]),
        message: 'Custom message!!1!1!'
      }]
    };

    diagnosticProvider.updates.subscribe(update => {
      // We go through all this just to extract the array of file messages for the current file.
      if (!(update.size === 1)) {
        throw new Error('Invariant violation: "update.size === 1"');
      }

      const firstValue = update.values().next();

      if (!(firstValue.value != null)) {
        throw new Error('Invariant violation: "firstValue.value != null"');
      }

      const fileMessages = firstValue.value;
      updates.push(fileMessages);
    });
    diagnosticProvider.invalidations.subscribe(invalidation => invalidations.push(invalidation));
  });

  describe('diagnostic updates', () => {
    it('should emit an update with a diagnostic message for each uncovered region', () => {
      isEnabledStream.next(true);
      inputResults.next({
        kind: 'result',
        result: sampleResult,
        editor,
        provider
      });
      expect(updates.length).toBe(1);
      expect(updates[0]).toEqual([{
        providerName: 'Type Coverage',
        type: 'Info',
        filePath: 'foo',
        range: sampleResult.uncoveredRegions[0].range,
        text: 'Not covered by Foo'
      }, {
        providerName: 'Type Coverage',
        type: 'Info',
        filePath: 'foo',
        range: sampleResult.uncoveredRegions[1].range,
        text: 'Custom message!!1!1!'
      }]);
      expect(invalidations.length).toBe(0);
    });

    it('should not emit an update before it has been switched on', () => {
      inputResults.next({
        kind: 'result',
        result: sampleResult,
        editor,
        provider
      });
      expect(updates.length).toBe(0);
    });

    it('should not emit an update after it has been switched off', () => {
      isEnabledStream.next(true);
      isEnabledStream.next(false);
      inputResults.next({
        kind: 'result',
        result: sampleResult,
        editor,
        provider
      });
      expect(updates.length).toBe(0);
    });
  });

  describe('diagnostic invalidations', () => {
    const invalidateAll = { scope: 'all' };

    it('should emit an invalidation when toggled off', () => {
      isEnabledStream.next(true);
      expect(invalidations).toEqual([]);
      isEnabledStream.next(false);
      expect(invalidations).toEqual([invalidateAll]);
    });

    it('should emit an invalidation when no text editor has focus', () => {
      isEnabledStream.next(true);
      inputResults.next({ kind: 'not-text-editor' });
      expect(invalidations).toEqual([invalidateAll]);
    });

    it('should emit an invalidation when there is no provider for the current editor', () => {
      isEnabledStream.next(true);
      // Cheat the type system a bit -- if necessary we can fill in all the fields in the future
      inputResults.next({ kind: 'no-provider' });
      expect(invalidations).toEqual([invalidateAll]);
    });

    it('should emit an invalidation when the provider throws an error', () => {
      isEnabledStream.next(true);
      inputResults.next({ kind: 'provider-error', provider });
      expect(invalidations).toEqual([invalidateAll]);
    });

    it('should emit an invalidation on a pane change', () => {
      isEnabledStream.next(true);
      inputResults.next({ kind: 'pane-change', editor });
      expect(invalidations).toEqual([invalidateAll]);
    });

    it('should not emit an invalidation on edit or save', () => {
      isEnabledStream.next(true);
      inputResults.next({ kind: 'edit', editor });
      inputResults.next({ kind: 'save', editor });
      expect(invalidations).toEqual([]);
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */