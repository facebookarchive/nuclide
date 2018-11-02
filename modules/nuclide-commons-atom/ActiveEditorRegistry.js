"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _debounced() {
  const data = require("./debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _paneItem() {
  const data = require("./pane-item");

  _paneItem = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("./ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * ActiveEditorRegistry provides abstractions for creating services that operate
 * on text editor contents.
 */
class ActiveEditorRegistry {
  constructor(resultFunction, eventSources = {}) {
    this._resultFunction = resultFunction;
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._newProviderEvents = new _rxjsCompatUmdMin.Subject();
    this._resultsStream = this._createResultsStream({
      activeEditors: eventSources.activeEditors || (0, _debounced().observeActiveEditorsDebounced)(),
      savesForEditor: eventSources.savesForEditor || (editor => {
        return (0, _event().observableFromSubscribeFunction)(callback => editor.onDidSave(callback)).mapTo(undefined);
      })
    });
  }

  consumeProvider(provider) {
    this._providerRegistry.addProvider(provider);

    this._newProviderEvents.next();

    return new (_UniversalDisposable().default)(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }

  getResultsStream() {
    return this._resultsStream;
  }

  _createResultsStream(eventSources) {
    const repeatedEditors = eventSources.activeEditors.switchMap(editor => {
      if (editor == null) {
        return _rxjsCompatUmdMin.Observable.of(editor);
      }

      return _rxjsCompatUmdMin.Observable.concat(_rxjsCompatUmdMin.Observable.of(editor), this._newProviderEvents.mapTo(editor));
    });
    const results = repeatedEditors.switchMap(editorArg => {
      // Necessary so the type refinement holds in the callback later
      const editor = editorArg;

      if (editor == null) {
        return _rxjsCompatUmdMin.Observable.of({
          kind: 'not-text-editor'
        });
      }

      return _rxjsCompatUmdMin.Observable.concat( // Emit a pane change event first, so that clients can do something while waiting for a
      // provider to give a result.
      _rxjsCompatUmdMin.Observable.of({
        kind: 'pane-change',
        editor
      }), // wait for pending panes to no longer be pending, or if they're not,
      // get the result right away.
      ((0, _paneItem().isPending)(editor) ? (0, _paneItem().observePendingStateEnd)(editor).take(1) : _rxjsCompatUmdMin.Observable.of(null)).ignoreElements(), _rxjsCompatUmdMin.Observable.fromPromise(this._getResultForEditor(this._getProvidersForEditor(editor), editor)), this._resultsForEditor(editor, eventSources));
    });
    return (0, _observable().cacheWhileSubscribed)(results);
  }

  _resultsForEditor(editor, eventSources) {
    // It's possible that the active provider for an editor changes over time.
    // Thus, we have to subscribe to both edits and saves.
    return _rxjsCompatUmdMin.Observable.merge(eventSources.savesForEditor(editor).map(() => 'save')).flatMap(event => {
      const providers = this._getProvidersForEditor(editor);

      return _rxjsCompatUmdMin.Observable.concat( // $FlowIssue: {kind: save}
      _rxjsCompatUmdMin.Observable.of({
        kind: event,
        editor
      }), _rxjsCompatUmdMin.Observable.fromPromise(this._getResultForEditor(providers, editor)));
    });
  }

  _getProvidersForEditor(editor) {
    return [...this._providerRegistry.getAllProvidersForEditor(editor)];
  }

  async _getResultForEditor(providers, editor) {
    if (providers.length === 0) {
      return {
        kind: 'no-provider',
        grammar: editor.getGrammar()
      };
    }

    let errorResult;
    const results = await Promise.all(providers.map(async provider => {
      try {
        return await this._resultFunction(provider, editor);
      } catch (error) {
        (0, _log4js().getLogger)(this.constructor.name).error(`Error from provider for ${editor.getGrammar().scopeName}`, error);
        errorResult = {
          provider,
          kind: 'provider-error'
        };
      }
    }));

    if (errorResult != null) {
      return errorResult;
    }

    const resultIndex = results.findIndex(r => r != null);
    return {
      kind: 'result',
      result: results[resultIndex],
      provider: providers[resultIndex] || providers[0],
      editor
    };
  }

}

exports.default = ActiveEditorRegistry;