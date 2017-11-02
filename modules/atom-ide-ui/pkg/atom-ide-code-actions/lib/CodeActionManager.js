'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActionManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let actionsToMessage = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (location, actions) {
    const titles = yield Promise.all(actions.map(function (r) {
      return r.getTitle();
    }));
    const solutions = titles.map(function (title, i) {
      return {
        title,
        position: location.position,
        apply: actions[i].apply.bind(actions[i])
      };
    });
    return {
      location,
      solutions,
      excerpt: 'Select an action',
      severity: 'info',
      kind: 'action'
    };
  });

  return function actionsToMessage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _debounced;

function _load_debounced() {
  return _debounced = require('nuclide-commons-atom/debounced');
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TIP_DELAY_MS = 500; /**
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

class CodeActionManager {

  constructor() {
    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._selectionSubscriber());
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    const disposable = this._providerRegistry.addProvider(provider);
    this._disposables.add(disposable);
    return disposable;
  }

  consumeIndie(register) {
    const linterDelegate = register({ name: 'Code Actions' });
    this._disposables.add(linterDelegate);
    this._linterDelegate = linterDelegate;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._disposables.remove(linterDelegate);
      this._linterDelegate = null;
    });
  }

  _genAllCodeActions(editor, range, diagnostics) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const codeActionRequests = [];
      for (const provider of _this._providerRegistry.getAllProvidersForEditor(editor)) {
        codeActionRequests.push(provider.getCodeActions(editor, range, diagnostics));
      }
      return (0, (_collection || _load_collection()).arrayFlatten)((yield Promise.all(codeActionRequests)));
    })();
  }

  createCodeActionFetcher() {
    return {
      getCodeActionForDiagnostic: (diagnostic, editor) => {
        if (diagnostic.range) {
          const { range } = diagnostic;
          return this._genAllCodeActions(editor, range, [diagnostic]);
        }
        return Promise.resolve([]);
      }
    };
  }

  // Listen to buffer range selection changes and trigger code action providers
  // when ranges change.
  _selectionSubscriber() {
    const disposeMessages = () => {
      if (this._linterDelegate != null) {
        this._linterDelegate.clearMessages();
      }
    };
    // Patterned after highlightEditors of CodeHighlightManager.
    return (0, (_debounced || _load_debounced()).observeActiveEditorsDebounced)(0).switchMap(editor => {
      if (editor == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const destroyEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor));
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangeSelectionRange.bind(editor))
      // Remove current messages whenever a selection event happens.
      .do(disposeMessages).let((0, (_observable || _load_observable()).fastDebounce)(TIP_DELAY_MS)).filter(({ newBufferRange }) =>
      // Remove 0-character selections since it's just cursor movement.
      newBufferRange.start.column !== newBufferRange.end.column || newBufferRange.start.row !== newBufferRange.end.row).map(e => ({ range: e.newBufferRange, editor })).takeUntil(destroyEvents);
    }).switchMap(({ editor, range }) => {
      const file = editor.getBuffer().getPath();
      if (file == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return _rxjsBundlesRxMinJs.Observable.fromPromise(this._genAllCodeActions(editor, range, [])).switchMap(actions => {
        // Only produce a message if we have actions to display.
        if (actions.length > 0) {
          return actionsToMessage({ file, position: range }, actions);
        } else {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
      });
    }).subscribe(message => {
      if (this._linterDelegate != null) {
        this._linterDelegate.setAllMessages([message]);
      }
    });
  }
}
exports.CodeActionManager = CodeActionManager;