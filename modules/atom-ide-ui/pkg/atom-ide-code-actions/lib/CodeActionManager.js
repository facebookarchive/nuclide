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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

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

  consumeDiagnosticUpdates(diagnosticUpdater) {
    this._diagnosticUpdater = diagnosticUpdater;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._diagnosticUpdater = null;
    });
  }

  consumeIndie(register) {
    const linterDelegate = register({
      name: 'Code Actions',
      supportedMessageKinds: ['action']
    });
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
      return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(codeActionRequests))));
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
    // Patterned after highlightEditors of CodeHighlightManager.
    return (0, (_debounced || _load_debounced()).observeActiveEditorsDebounced)(0).switchMap(
    // Get selections for the active editor.
    editor => {
      if (editor == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const destroyEvents = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor));
      const selections = (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangeSelectionRange.bind(editor)).switchMap(event =>
      // Remove 0-character selections since it's just cursor movement.
      event.newBufferRange.isEmpty() ? _rxjsBundlesRxMinJs.Observable.of(null) : _rxjsBundlesRxMinJs.Observable.of(event.newBufferRange).delay(TIP_DELAY_MS) // Delay the emission of the range.
      .startWith(null) // null the range immediately when selection changes.
      ).distinctUntilChanged().takeUntil(destroyEvents);
      return selections.map(range => range == null ? null : { editor, range });
    }).switchMap(
    // Get a message for the provided selection.
    selection => {
      if (selection == null) {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }
      const { editor, range } = selection;
      const file = editor.getBuffer().getPath();
      if (file == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const diagnostics = this._diagnosticUpdater == null ? [] : this._diagnosticUpdater.getFileMessageUpdates(file).messages.filter(message => message.range && message.range.intersectsWith(range));
      return _rxjsBundlesRxMinJs.Observable.fromPromise(this._genAllCodeActions(editor, range, diagnostics)).switchMap(actions => {
        // Only produce a message if we have actions to display.
        if (actions.length > 0) {
          return actionsToMessage({ file, position: range }, actions);
        } else {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
      });
    }).distinctUntilChanged().catch((e, caught) => {
      (0, (_log4js || _load_log4js()).getLogger)('code-actions').error('Error getting code actions on selection', e);
      return caught;
    }).subscribe(message => {
      if (this._linterDelegate == null) {
        return;
      }
      if (message == null) {
        this._linterDelegate.clearMessages();
      } else {
        this._linterDelegate.setAllMessages([message]);
      }
    });
  }
}
exports.CodeActionManager = CodeActionManager;