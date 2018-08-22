"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
 *  strict-local
 * @format
 */

/**
 * ActiveEditorRegistry provides abstractions for creating services that operate
 * on text editor contents.
 */
const DEFAULT_CONFIG = {
  updateOnEdit: true
};

function getConcreteConfig(config) {
  return Object.assign({}, DEFAULT_CONFIG, config);
}

class ActiveEditorRegistry {
  constructor(resultFunction, config = {}, eventSources = {}) {
    this._config = getConcreteConfig(config);
    this._resultFunction = resultFunction;
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._newProviderEvents = new _RxMin.Subject();
    this._resultsStream = this._createResultsStream({
      activeEditors: eventSources.activeEditors || (0, _debounced().observeActiveEditorsDebounced)(),
      changesForEditor: eventSources.changesForEditor || (editor => (0, _debounced().editorChangesDebounced)(editor)),
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
        return _RxMin.Observable.of(editor);
      }

      return _RxMin.Observable.concat(_RxMin.Observable.of(editor), this._newProviderEvents.mapTo(editor));
    });
    const results = repeatedEditors.switchMap(editorArg => {
      // Necessary so the type refinement holds in the callback later
      const editor = editorArg;

      if (editor == null) {
        return _RxMin.Observable.of({
          kind: 'not-text-editor'
        });
      }

      return _RxMin.Observable.concat( // Emit a pane change event first, so that clients can do something while waiting for a
      // provider to give a result.
      _RxMin.Observable.of({
        kind: 'pane-change',
        editor
      }), // wait for pending panes to no longer be pending, or if they're not,
      // get the result right away.
      ((0, _paneItem().isPending)(editor) ? (0, _paneItem().observePendingStateEnd)(editor).take(1) : _RxMin.Observable.of(null)).ignoreElements(), _RxMin.Observable.fromPromise(this._getResultForEditor(this._getProviderForEditor(editor), editor)), this._resultsForEditor(editor, eventSources));
    });
    return (0, _observable().cacheWhileSubscribed)(results);
  }

  _resultsForEditor(editor, eventSources) {
    // It's possible that the active provider for an editor changes over time.
    // Thus, we have to subscribe to both edits and saves.
    return _RxMin.Observable.merge(eventSources.changesForEditor(editor).map(() => 'edit'), eventSources.savesForEditor(editor).map(() => 'save')).flatMap(event => {
      const provider = this._getProviderForEditor(editor);

      if (provider != null) {
        let updateOnEdit = provider.updateOnEdit; // Fall back to the config's updateOnEdit if not provided.

        if (updateOnEdit == null) {
          updateOnEdit = this._config.updateOnEdit;
        }

        if (updateOnEdit !== (event === 'edit')) {
          return _RxMin.Observable.empty();
        }
      }

      return _RxMin.Observable.concat( // $FlowIssue: {kind: edit | save} <=> {kind: edit} | {kind: save}
      _RxMin.Observable.of({
        kind: event,
        editor
      }), _RxMin.Observable.fromPromise(this._getResultForEditor(provider, editor)));
    });
  }

  _getProviderForEditor(editor) {
    return this._providerRegistry.getProviderForEditor(editor);
  }

  async _getResultForEditor(provider, editor) {
    if (provider == null) {
      return {
        kind: 'no-provider',
        grammar: editor.getGrammar()
      };
    }

    try {
      return {
        kind: 'result',
        result: await this._resultFunction(provider, editor),
        provider,
        editor
      };
    } catch (e) {
      (0, _log4js().getLogger)(this.constructor.name).error(`Error from provider for ${editor.getGrammar().scopeName}`, e);
      return {
        provider,
        kind: 'provider-error'
      };
    }
  }

}

exports.default = ActiveEditorRegistry;