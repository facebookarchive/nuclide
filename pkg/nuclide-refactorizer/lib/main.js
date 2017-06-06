'use strict';

var _atom = require('atom');

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _observeGrammarForTextEditors;

function _load_observeGrammarForTextEditors() {
  return _observeGrammarForTextEditors = _interopRequireDefault(require('../../commons-atom/observe-grammar-for-text-editors'));
}

var _mouseToPosition;

function _load_mouseToPosition() {
  return _mouseToPosition = require('nuclide-commons-atom/mouse-to-position');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

var _refactorStore;

function _load_refactorStore() {
  return _refactorStore = require('./refactorStore');
}

var _refactorUIs;

function _load_refactorUIs() {
  return _refactorUIs = require('./refactorUIs');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */

const CONTEXT_MENU_CLASS = 'enable-nuclide-refactorizer';

class Activation {

  constructor() {
    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();

    this._store = (0, (_refactorStore || _load_refactorStore()).getStore)(this._providerRegistry);

    let lastMouseEvent = null;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_refactorUIs || _load_refactorUIs()).initRefactorUIs)(this._store), atom.commands.add('atom-workspace', 'nuclide-refactorizer:refactorize', () => {
      this._store.dispatch((_refactorActions || _load_refactorActions()).open('generic'));
    }), atom.commands.add('atom-text-editor',
    // We don't actually want people calling this directly.
    // eslint-disable-next-line nuclide-internal/atom-commands
    'nuclide-refactorizer:refactorize-from-context-menu', () => {
      const mouseEvent = lastMouseEvent;
      lastMouseEvent = null;

      if (!(mouseEvent != null)) {
        throw new Error('No mouse event found. Do not invoke this command directly. ' + 'If you did use the context menu, please report this issue.');
      }

      const editor = atom.workspace.getActiveTextEditor();

      if (!(editor != null)) {
        throw new Error('Invariant violation: "editor != null"');
      }

      const bufferPosition = (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(mouseEvent, editor);
      editor.setCursorBufferPosition(bufferPosition);

      this._store.dispatch((_refactorActions || _load_refactorActions()).open('generic'));
    }), atom.contextMenu.add({
      'atom-text-editor:not(.mini).enable-nuclide-refactorizer': [{
        label: 'Refactor',
        command: 'nuclide-refactorizer:refactorize-from-context-menu',
        created: event => {
          lastMouseEvent = event;
        }
      }]
    }), atom.commands.add('atom-workspace', 'nuclide-refactorizer:rename', () => {
      this._store.dispatch((_refactorActions || _load_refactorActions()).open('rename'));
    }), (0, (_observeGrammarForTextEditors || _load_observeGrammarForTextEditors()).default)(editor => this._addContextMenuIfEligible(editor)));
  }

  dispose() {
    this._disposables.dispose();
  }

  _addContextMenuIfEligible(editor) {
    const element = atom.views.getView(editor);
    if (this._providerRegistry.getProviderForEditor(editor) != null) {
      element.classList.add(CONTEXT_MENU_CLASS);
    } else {
      element.classList.remove(CONTEXT_MENU_CLASS);
    }
  }

  _checkAllEditorContextMenus() {
    atom.workspace.getTextEditors().forEach(editor => this._addContextMenuIfEligible(editor));
  }

  consumeRefactorProvider(provider) {
    this._providerRegistry.addProvider(provider);
    this._checkAllEditorContextMenus();
    return new _atom.Disposable(() => {
      this._providerRegistry.removeProvider(provider);
      this._checkAllEditorContextMenus();
    });
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);