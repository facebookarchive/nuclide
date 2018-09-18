"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActionManager = void 0;

function _debounced() {
  const data = require("../../../../nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const TIP_DELAY_MS = 500;

async function actionsToMessage(location, actions) {
  const titles = await Promise.all(actions.map(r => r.getTitle()));
  const solutions = titles.map((title, i) => ({
    title,
    position: location.position,
    apply: actions[i].apply.bind(actions[i])
  }));
  return {
    location,
    solutions,
    excerpt: 'Select an action',
    severity: 'info',
    kind: 'action'
  };
}

class CodeActionManager {
  constructor() {
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._disposables = new (_UniversalDisposable().default)(this._selectionSubscriber());
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
    return new (_UniversalDisposable().default)(() => {
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
    return new (_UniversalDisposable().default)(() => {
      this._disposables.remove(linterDelegate);

      this._linterDelegate = null;
    });
  }

  async _genAllCodeActions(editor, range, diagnostics) {
    const codeActionRequests = [];

    for (const provider of this._providerRegistry.getAllProvidersForEditor(editor)) {
      codeActionRequests.push(provider.getCodeActions(editor, range, diagnostics));
    }

    return (0, _collection().arrayFlatten)((0, _collection().arrayCompact)((await Promise.all(codeActionRequests))));
  }

  createCodeActionFetcher() {
    return {
      getCodeActionForDiagnostic: (diagnostic, editor) => {
        if (diagnostic.range) {
          const {
            range
          } = diagnostic;
          return this._genAllCodeActions(editor, range, [diagnostic]);
        }

        return Promise.resolve([]);
      }
    };
  } // Listen to buffer range selection changes and trigger code action providers
  // when ranges change.


  _selectionSubscriber() {
    // Patterned after highlightEditors of CodeHighlightManager.
    return (0, _debounced().observeActiveEditorsDebounced)(0).switchMap( // Get selections for the active editor.
    editor => {
      if (editor == null) {
        return _RxMin.Observable.empty();
      }

      const destroyEvents = (0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor));
      const selections = (0, _event().observableFromSubscribeFunction)(editor.onDidChangeSelectionRange.bind(editor)).switchMap(event => // Remove 0-character selections since it's just cursor movement.
      event.newBufferRange.isEmpty() ? _RxMin.Observable.of(null) : _RxMin.Observable.of(event.newBufferRange).delay(TIP_DELAY_MS) // Delay the emission of the range.
      .startWith(null) // null the range immediately when selection changes.
      ).distinctUntilChanged().takeUntil(destroyEvents);
      return selections.map(range => range == null ? null : {
        editor,
        range
      });
    }).switchMap( // Get a message for the provided selection.
    selection => {
      if (selection == null) {
        return _RxMin.Observable.of(null);
      }

      const {
        editor,
        range
      } = selection;
      const file = editor.getBuffer().getPath();

      if (file == null) {
        return _RxMin.Observable.empty();
      }

      const diagnostics = this._diagnosticUpdater == null ? [] : this._diagnosticUpdater.getFileMessageUpdates(file).messages.filter(message => message.range && message.range.intersectsWith(range));
      return _RxMin.Observable.fromPromise(this._genAllCodeActions(editor, range, diagnostics)).switchMap(actions => {
        // Only produce a message if we have actions to display.
        if (actions.length > 0) {
          return actionsToMessage({
            file,
            position: range
          }, actions);
        } else {
          return _RxMin.Observable.empty();
        }
      });
    }).distinctUntilChanged().catch((e, caught) => {
      (0, _log4js().getLogger)('code-actions').error('Error getting code actions on selection', e);
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