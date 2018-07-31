"use strict";

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _observeGrammarForTextEditors() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/observe-grammar-for-text-editors"));

  _observeGrammarForTextEditors = function () {
    return data;
  };

  return data;
}

function _mouseToPosition() {
  const data = require("../../../../nuclide-commons-atom/mouse-to-position");

  _mouseToPosition = function () {
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

function _ContextMenu() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ContextMenu"));

  _ContextMenu = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _refactorStore() {
  const data = require("./refactorStore");

  _refactorStore = function () {
    return data;
  };

  return data;
}

function _refactorUIs() {
  const data = require("./refactorUIs");

  _refactorUIs = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/*
 * WARNING: This package is still experimental and in early development. Use it at your own risk.
 */
const CONTEXT_MENU_CLASS = 'enable-nuclide-refactorizer';

class Activation {
  constructor() {
    this._providerRegistry = new (_ProviderRegistry().default)();
    this._store = (0, _refactorStore().getStore)(this._providerRegistry);
    let lastMouseEvent = null;
    this._disposables = new (_UniversalDisposable().default)((0, _refactorUIs().initRefactorUIs)(this._store), atom.commands.add('atom-workspace', // Since we are trying to move away from menu bar options,
    // we decide not to provide one here. Thus, we suppress the eslint warning.
    // eslint-disable-next-line
    'nuclide-refactorizer:refactorize', () => {
      this._store.dispatch(Actions().open('generic'));
    }), atom.commands.add('atom-text-editor', // We don't actually want people calling this directly.
    // eslint-disable-next-line nuclide-internal/atom-commands
    'nuclide-refactorizer:refactorize-from-context-menu', () => {
      const mouseEvent = lastMouseEvent;
      lastMouseEvent = null;

      if (!(mouseEvent != null)) {
        throw new Error('No mouse event found. Do not invoke this command directly. ' + 'If you did use the context menu, please report this issue.');
      }

      const editor = atom.workspace.getActiveTextEditor();

      if (!(editor != null)) {
        throw new Error("Invariant violation: \"editor != null\"");
      }

      const bufferPosition = (0, _mouseToPosition().bufferPositionForMouseEvent)(mouseEvent, editor); // If the user selected some text and clicked within it,
      // we'll treat it as a 'range refactor'.

      const currentSelection = editor.getSelectedBufferRange();

      if (!currentSelection.containsPoint(bufferPosition)) {
        editor.setCursorBufferPosition(bufferPosition);
      }

      this._store.dispatch(Actions().open('generic'));
    }), atom.contextMenu.add({
      'atom-text-editor:not(.mini).enable-nuclide-refactorizer': [{
        label: 'Refactor',
        command: 'nuclide-refactorizer:refactorize-from-context-menu',
        created: event => {
          lastMouseEvent = event;
        }
      }]
    }), atom.commands.add('atom-text-editor', 'nuclide-refactorizer:rename', event => {
      const editor = atom.workspace.getActiveTextEditor();

      if (!editor) {
        return null;
      }

      const mouseEvent = _ContextMenu().default.isEventFromContextMenu(event) ? lastMouseEvent : null;
      const position = mouseEvent != null ? (0, _mouseToPosition().bufferPositionForMouseEvent)(mouseEvent, editor) : editor.getCursorBufferPosition();
      editor.setCursorBufferPosition(position);
      editor.selectWordsContainingCursors();
      const selectedText = editor.getSelectedText().trim();

      if (selectedText === '') {
        return null;
      }

      const mountPosition = editor.getSelectedBufferRange().start;
      const provider = Array.from(this._providerRegistry.getAllProvidersForEditor(editor)).find(p => p.rename != null);

      if (provider == null) {
        (0, _log4js().getLogger)('rename').error('Rename Provider Not Found');
        return null;
      }

      this._store.dispatch(Actions().displayRename(editor, provider, selectedText, mountPosition, position));
    }), atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Rename',
        command: 'nuclide-refactorizer:rename',
        created: event => {
          lastMouseEvent = event;
        }
      }]
    }), (0, _observeGrammarForTextEditors().default)(editor => this._addContextMenuIfEligible(editor)));
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

    return new (_UniversalDisposable().default)(() => {
      this._providerRegistry.removeProvider(provider);

      this._checkAllEditorContextMenus();
    });
  }

}

(0, _createPackage().default)(module.exports, Activation);