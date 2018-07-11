"use strict";

var _atom = require("atom");

function _ReactMountRootElement() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-ui/ReactMountRootElement"));

  _ReactMountRootElement = function () {
    return data;
  };

  return data;
}

var _reactDom = _interopRequireDefault(require("react-dom"));

var React = _interopRequireWildcard(require("react"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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

function _mouseToPosition() {
  const data = require("../../../../nuclide-commons-atom/mouse-to-position");

  _mouseToPosition = function () {
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

function _promise() {
  const data = require("../../../../nuclide-commons/promise");

  _promise = function () {
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

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("../../../../nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _RenameComponent() {
  const data = _interopRequireDefault(require("./RenameComponent"));

  _RenameComponent = function () {
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
class Activation {
  constructor() {
    this._providers = new (_ProviderRegistry().default)();
    this._subscriptions = new (_UniversalDisposable().default)();

    this._subscriptions.add(this.registerOpenerAndCommand());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRenameProvider(provider) {
    const disposable = this._providers.addProvider(provider);

    this._subscriptions.add(disposable); // $FlowFixMe


    return () => {
      disposable.dispose();

      this._subscriptions.remove(disposable);
    };
  }

  registerOpenerAndCommand() {
    return new (_UniversalDisposable().default)(atom.commands.add('atom-text-editor', 'rename:activate', async event => {
      const editor = atom.workspace.getActiveTextEditor();

      if (!editor) {
        return null;
      }

      await this._doRename(this._getProviderData(editor, _ContextMenu().default.isEventFromContextMenu(event) ? this.lastMouseEvent : null));
    }), atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Rename',
        command: 'rename:activate',
        created: event => {
          this.lastMouseEvent = event;
        }
      }]
    }));
  }

  renderRenameInput(editor, selectedText, resolveNewName) {
    return React.createElement(_RenameComponent().default, {
      selectedText: selectedText,
      submitNewName: resolveNewName
    });
  }

  mountRenameInput(editor, mountPosition, container, element) {
    const overlayMarker = editor.markBufferRange(new _atom.Range(mountPosition, mountPosition), {
      invalidate: 'never'
    });
    editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      position: 'tail',
      item: container
    });
    return new (_UniversalDisposable().default)(() => overlayMarker.destroy(), () => _reactDom.default.unmountComponentAtNode(container), // The editor may not mount the marker until the next update.
    // It's not safe to render anything until that point, as overlayed containers
    // often need to measure their size in the DOM.
    _RxMin.Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(() => {
      container.style.display = 'block';

      _reactDom.default.render(element, container);
    }));
  }

  async _getUserInput(position, editor) {
    // TODO: Should only be instantiated once.
    //       However, the node has trouble rendering at the correct position
    //       when it is instantiated once in the constructor and re-mounted
    const container = new (_ReactMountRootElement().default)();
    container.className = 'rename-container';
    let disposable = null;
    const newName = await new Promise((resolve, reject) => {
      editor.setCursorBufferPosition(position);
      editor.selectWordsContainingCursors();
      const selectedText = editor.getSelectedText();
      const startOfWord = editor.getSelectedBufferRange().start;
      const renameElement = this.renderRenameInput(editor, selectedText, resolve);
      disposable = this.mountRenameInput(editor, startOfWord, container, renameElement);
      atom.commands.add(container, 'core:cancel', () => {
        resolve();
      });
    });

    if (disposable != null) {
      disposable.dispose();
    }

    return newName;
  }

  async _getProviderData(editor, event) {
    // Currently, when the UI is rendered, it pushes the cursor to the very end of the word.
    // However, the end position of the word does not count as a valid renaming position.
    //  Thus, if the keyboard shortcut is being used, the position of the cursor
    //    must be obtained BEFORE rendering the UI.
    const position = event != null ? (0, _mouseToPosition().bufferPositionForMouseEvent)(event, editor) : editor.getCursorBufferPosition();
    const newName = await this._getUserInput(position, editor);

    if (newName == null) {
      return null;
    }

    const providers = this._providers.getAllProvidersForEditor(editor);

    const resultPromise = (0, _promise().asyncFind)(Array.from(providers).map(provider => provider.rename(editor, position, newName).catch(err => {
      (0, _log4js().getLogger)('rename').error('Error renaming', err);
      return new Map();
    })), x => x);
    return resultPromise;
  }

  async _doRename(changes) {
    const renameChanges = await changes;

    if (!renameChanges) {
      return false;
    }

    return (0, _textEdit().applyTextEditsForMultipleFiles)(renameChanges);
  }

}

(0, _createPackage().default)(module.exports, Activation);