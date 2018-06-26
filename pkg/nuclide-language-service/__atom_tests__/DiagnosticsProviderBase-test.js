'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _DiagnosticsProviderBase;

function _load_DiagnosticsProviderBase() {
  return _DiagnosticsProviderBase = require('../lib/DiagnosticsProviderBase');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const grammar = 'testgrammar';

describe('DiagnosticsProviderBase', () => {
  let providerBase;

  let eventCallback;
  let subscribedToAny;
  let fakeEditor;

  let textEventCallback;

  class FakeEventDispatcher {
    onFileChange(grammars, callback) {
      eventCallback = callback;
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    onAnyFileChange(callback) {
      subscribedToAny = true;
      eventCallback = callback;
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
  }

  function newProviderBase(options) {
    return new (_DiagnosticsProviderBase || _load_DiagnosticsProviderBase()).DiagnosticsProviderBase(options, new FakeEventDispatcher());
  }

  beforeEach(() => {
    fakeEditor = {
      getPath() {
        return 'foo';
      },
      getGrammar() {
        return { scopeName: grammar };
      }
    };
    eventCallback = null;
    subscribedToAny = null;

    // Flow complains that a spy is not callable.
    textEventCallback = jest.fn();
    const options = {
      grammarScopes: new Set([grammar]),
      onTextEditorEvent: textEventCallback,
      shouldRunOnTheFly: true
    };
    providerBase = newProviderBase(options);
  });

  it('should call the provided callback when there is a text event', () => {
    eventCallback(fakeEditor);
    expect(textEventCallback).toHaveBeenCalled();
  });

  it("should subscribe to 'all' if allGrammarScopes is true", () => {
    newProviderBase({
      grammarScopes: new Set([]),
      enableForAllGrammars: true,
      shouldRunOnTheFly: true
    });
    expect(subscribedToAny).toBe(true);
  });

  it('should send published messages to all subscribers', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    providerBase.onMessageUpdate(callback1);
    providerBase.onMessageUpdate(callback2);

    const update = 'this is a fake update';
    providerBase.publishMessageUpdate(update);
    expect(callback1).toHaveBeenCalledWith(update);
    expect(callback2).toHaveBeenCalledWith(update);
  });
});