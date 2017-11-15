'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _debounced;

function _load_debounced() {
  return _debounced = require('nuclide-commons-atom/debounced');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _getSignatureDatatip;

function _load_getSignatureDatatip() {
  return _getSignatureDatatip = _interopRequireDefault(require('./getSignatureDatatip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Chosen to be a little more than the default key repeat rate.
const CURSOR_DEBOUNCE_TIME = 200;

// Aggressively timeout signature requests to avoid 'stuck' signatures.
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

const SIGNATURE_TIMEOUT = 2500;

class SignatureHelpManager {

  constructor() {
    this._commands = new _rxjsBundlesRxMinJs.Subject();

    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._subscribeToEditors(),
    // Share the command subscription between all editors.
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
    return (0, (_debounced || _load_debounced()).observeActiveEditorsDebounced)(0).switchMap(editor => {
      if (editor == null) {
        return _rxjsBundlesRxMinJs.Observable.of({ editor, signatureHelp: null });
      }
      return this._signatureHelpTriggers(editor).exhaustMap(() => this._getSignatureStream(editor)).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor))).map(signatureHelp => ({ editor, signatureHelp }));
    }).switchMap(({ editor, signatureHelp }) => {
      if (editor != null && signatureHelp != null) {
        return this._showSignatureDatatip(editor, signatureHelp);
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).subscribe();
  }

  /**
   * A stream of all signature help triggers.
   */
  _signatureHelpTriggers(editor) {
    return _rxjsBundlesRxMinJs.Observable.merge(
    // 1) Any keypresses that match a triggerCharacter.
    (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => editor.getBuffer().onDidChangeText(cb))
    // The change events and cursor changes are often sequential.
    // We need to make sure we use the final cursor position.
    .let((0, (_observable || _load_observable()).fastDebounce)(0)).filter(edit => {
      if (edit.changes.length !== 1) {
        return false;
      }
      const change = edit.changes[0];
      if (
      // Only handle single/double-character insertions.
      // (e.g. bracket-matcher inserts two characters on open parenthesis)
      change.newText.length === 0 || change.newText.length > 2 ||
      // The change should cover the current cursor position.
      !change.newRange.containsPoint(editor.getCursorBufferPosition())) {
        return false;
      }
      for (const provider of this._providerRegistry.getAllProvidersForEditor(editor)) {
        if (provider.triggerCharacters != null) {
          for (let i = 0; i < change.newText.length; i++) {
            if (provider.triggerCharacters.has(change.newText[i])) {
              return true;
            }
          }
        }
      }
      return false;
    }),
    // 2) Explicit usage of the Atom command.
    this._commands.filter(e => e === editor));
  }

  /**
   * A stream of all signatures from an editor.
   */
  _getSignatureStream(editor) {
    return _rxjsBundlesRxMinJs.Observable.concat(
    // Start with a null signature to clear out any prior signatures.
    _rxjsBundlesRxMinJs.Observable.of(null),
    // Immediately start fetching signatures for the current position.
    _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.of(editor.getCursorBufferPosition())),
    // Further cursor changes will be debounced.
    (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor).let((0, (_observable || _load_observable()).fastDebounce)(CURSOR_DEBOUNCE_TIME))).distinctUntilChanged((a, b) => a.isEqual(b)).switchMap(point => this._getSignatures(editor, point))
    // Stop once we get a null result.
    .takeWhile(Boolean)
    // Stop once the escape key is pressed.
    // NOTE: we can't use core:cancel because plugins like vim-mode-plus override it.
    .takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(editor.getElement(), 'keydown').filter(evt => evt.keyCode === 27)),
    // Terminate with a null signature to clear any visible signatures.
    _rxjsBundlesRxMinJs.Observable.of(null));
  }

  /**
   * Retrieve a signature from all providers for an editor + point.
   * (Effectively just a cancellable promise).
   */
  _getSignatures(editor, point) {
    // Take the highest-priority non-empty result.
    return _rxjsBundlesRxMinJs.Observable.defer(() => _rxjsBundlesRxMinJs.Observable.from(this._providerRegistry.getAllProvidersForEditor(editor))).concatMap(provider => {
      return provider.getSignatureHelp(editor, point).catch(err => {
        const editorPath = editor.getPath() || '<untitled editor>';
        (0, (_log4js || _load_log4js()).getLogger)('atom-ide-signature-help').error(`Caught error from signature help provider for ${editorPath}`, err);
        return null;
      });
    }).filter(x => x != null && x.signatures.length > 0).timeoutWith(SIGNATURE_TIMEOUT, _rxjsBundlesRxMinJs.Observable.of(null)).take(1).defaultIfEmpty(null);
  }

  /**
   * Displays the signature datatip and wraps its lifetime in an Observable.
   */
  _showSignatureDatatip(editor, signatureHelp) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => {
      const datatipService = this._datatipService;
      if (datatipService == null || signatureHelp.signatures.length === 0) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const currentPosition = editor.getCursorBufferPosition();
      // Make sure the datatip follows the cursor position.
      return (0, (_textEditor || _load_textEditor()).getCursorPositions)(editor)
      // But don't go too far.
      .takeWhile(position => Math.abs(currentPosition.row - position.row) + Math.abs(currentPosition.column - position.column) <= 2).let((0, (_observable || _load_observable()).completingSwitchMap)(point => {
        return _rxjsBundlesRxMinJs.Observable.create(() => {
          const disposable = datatipService.createPinnedDataTip((0, (_getSignatureDatatip || _load_getSignatureDatatip()).default)(signatureHelp, point), editor, {
            position: 'above-range',
            showRangeHighlight: false
          });
          return new (_UniversalDisposable || _load_UniversalDisposable()).default(disposable);
        });
      }));
    });
  }
}
exports.default = SignatureHelpManager;