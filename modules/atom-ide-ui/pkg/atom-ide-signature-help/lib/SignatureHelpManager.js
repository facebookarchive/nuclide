"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _debounced() {
  const data = require("../../../../nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../../nuclide-commons-atom/text-editor");

  _textEditor = function () {
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

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _getSignatureDatatip() {
  const data = _interopRequireDefault(require("./getSignatureDatatip"));

  _getSignatureDatatip = function () {
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
// Chosen to be a little more than the default key repeat rate.
const CURSOR_DEBOUNCE_TIME = 200; // Aggressively timeout signature requests to avoid 'stuck' signatures.

const SIGNATURE_TIMEOUT = 2500;

class SignatureHelpManager {
  constructor() {
    this._commands = new _RxMin.Subject();
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._disposables = new (_UniversalDisposable().default)(this._subscribeToEditors(), // Share the command subscription between all editors.
    atom.commands.add('atom-text-editor', 'signature-help:show', () => {
      this._commands.next(atom.workspace.getActiveTextEditor());
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  setDatatipService(service) {
    this._datatipService = service;
  }

  consumeSignatureHelp(provider) {
    return this._providerRegistry.addProvider(provider);
  }
  /**
   * The signature help flow looks like this:
   * 1) Wait for signature help to be triggered.
   *    This means that the user types a character matching triggerCharacters
   *    from at least one provider, or they activate the Atom command.
   * 2) Once signature help is triggered, we start fetching signatures for the cursor location.
   *    New signatures are continously fetched as the cursor moves.
   * 3) Signature help stops once we get a null signature, or once the user hits 'escape'.
   */


  _subscribeToEditors() {
    return (0, _debounced().observeActiveEditorsDebounced)(0).switchMap(editor => {
      if (editor == null) {
        return _RxMin.Observable.of({
          editor,
          signatureHelp: null
        });
      }

      return _featureConfig().default.observeAsStream('atom-ide-signature-help.enable', {
        scope: editor.getRootScopeDescriptor()
      }).switchMap(enabled => {
        if (enabled === false) {
          return _RxMin.Observable.empty();
        }

        return this._signatureHelpTriggers(editor).exhaustMap(() => this._getSignatureStream(editor)).takeUntil((0, _event().observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor))).map(signatureHelp => ({
          editor,
          signatureHelp
        }));
      });
    }).switchMap(({
      editor,
      signatureHelp
    }) => {
      if (editor != null && signatureHelp != null) {
        return this._showSignatureDatatip(editor, signatureHelp);
      }

      return _RxMin.Observable.empty();
    }).subscribe();
  }
  /**
   * A stream of all signature help triggers.
   */


  _signatureHelpTriggers(editor) {
    return _RxMin.Observable.merge( // 1) Any keypresses that match a triggerCharacter.
    (0, _event().observableFromSubscribeFunction)(cb => editor.getBuffer().onDidChangeText(cb)) // The change events and cursor changes are often sequential.
    // We need to make sure we use the final cursor position.
    .let((0, _observable().fastDebounce)(0)).filter(edit => {
      if (edit.changes.length !== 1) {
        return false;
      }

      const change = edit.changes[0]; // Use the start of the current selection as the cursor position.
      // (Autocomplete often inserts a placeholder and puts the cursor at the end.)

      const cursorPosition = editor.getSelectedBufferRange().start;

      if (change.newText.length === 0 || // Don't allow multi-line changes.
      change.newRange.start.row !== change.newRange.end.row || // The change should cover the current cursor position.
      !change.newRange.containsPoint(cursorPosition)) {
        return false;
      } // Use the character before the cursor as the 'trigger character'.


      const index = Math.max(0, cursorPosition.column - change.newRange.start.column - 1);

      for (const provider of this._providerRegistry.getAllProvidersForEditor(editor)) {
        if (provider.triggerCharacters != null) {
          if (provider.triggerCharacters.has(change.newText[index])) {
            return true;
          }
        }
      }

      return false;
    }), // 2) Explicit usage of the Atom command.
    this._commands.filter(e => e === editor));
  }
  /**
   * A stream of all signatures from an editor.
   */


  _getSignatureStream(editor) {
    return _RxMin.Observable.concat( // Start with a null signature to clear out any prior signatures.
    _RxMin.Observable.of(null), // Immediately start fetching signatures for the current position.
    _RxMin.Observable.concat(_RxMin.Observable.defer(() => _RxMin.Observable.of(editor.getCursorBufferPosition())), // Further cursor changes will be debounced.
    (0, _textEditor().getCursorPositions)(editor).let((0, _observable().fastDebounce)(CURSOR_DEBOUNCE_TIME))).distinctUntilChanged((a, b) => a.isEqual(b)).switchMap(point => this._getSignatures(editor, point)) // Stop once we get a null result.
    .takeWhile(Boolean) // Stop once the escape key is pressed.
    // NOTE: we can't use core:cancel because plugins like vim-mode-plus override it.
    .takeUntil(_RxMin.Observable.fromEvent(editor.getElement(), 'keydown').filter(evt => evt.keyCode === 27)), // Terminate with a null signature to clear any visible signatures.
    _RxMin.Observable.of(null));
  }
  /**
   * Retrieve a signature from all providers for an editor + point.
   * (Effectively just a cancellable promise).
   */


  _getSignatures(editor, point) {
    // Take the highest-priority non-empty result.
    return _RxMin.Observable.defer(() => _RxMin.Observable.from(this._providerRegistry.getAllProvidersForEditor(editor))).concatMap(provider => {
      return provider.getSignatureHelp(editor, point).catch(err => {
        const editorPath = editor.getPath() || '<untitled editor>';
        (0, _log4js().getLogger)('atom-ide-signature-help').error(`Caught error from signature help provider for ${editorPath}`, err);
        return null;
      });
    }).filter(x => x != null && x.signatures.length > 0).timeoutWith(SIGNATURE_TIMEOUT, _RxMin.Observable.of(null)).take(1).defaultIfEmpty(null);
  }
  /**
   * Displays the signature datatip and wraps its lifetime in an Observable.
   */


  _showSignatureDatatip(editor, signatureHelp) {
    return _RxMin.Observable.defer(() => {
      const datatipService = this._datatipService;

      if (datatipService == null || signatureHelp.signatures.length === 0) {
        return _RxMin.Observable.empty();
      }

      const currentPosition = editor.getCursorBufferPosition(); // Make sure the datatip follows the cursor position.

      return (0, _textEditor().getCursorPositions)(editor) // But don't go too far.
      .takeWhile(position => Math.abs(currentPosition.row - position.row) + Math.abs(currentPosition.column - position.column) <= 2).let((0, _observable().completingSwitchMap)(point => {
        return _RxMin.Observable.create(() => {
          const disposable = datatipService.createPinnedDataTip((0, _getSignatureDatatip().default)(signatureHelp, point), editor, {
            position: 'above-range',
            showRangeHighlight: false
          });
          return new (_UniversalDisposable().default)(disposable);
        });
      }));
    });
  }

}

exports.default = SignatureHelpManager;