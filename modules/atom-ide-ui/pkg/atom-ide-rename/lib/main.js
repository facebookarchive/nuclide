'use strict';

var _atom = require('atom');

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('../../../../nuclide-commons-ui/ReactMountRootElement'));
}

var _reactDom = _interopRequireDefault(require('react-dom'));

var _react = _interopRequireWildcard(require('react'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _ContextMenu;

function _load_ContextMenu() {
  return _ContextMenu = _interopRequireDefault(require('../../../../nuclide-commons-atom/ContextMenu'));
}

var _mouseToPosition;

function _load_mouseToPosition() {
  return _mouseToPosition = require('../../../../nuclide-commons-atom/mouse-to-position');
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('../../../../nuclide-commons-atom/ProviderRegistry'));
}

var _promise;

function _load_promise() {
  return _promise = require('../../../../nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));
}

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('../../../../nuclide-commons-atom/text-edit');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _RenameComponent;

function _load_RenameComponent() {
  return _RenameComponent = _interopRequireDefault(require('./RenameComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add(this.registerOpenerAndCommand());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeRenameProvider(provider) {
    const disposable = this._providers.addProvider(provider);
    this._subscriptions.add(disposable);
    // $FlowFixMe
    return () => {
      disposable.dispose();
      this._subscriptions.remove(disposable);
    };
  }

  registerOpenerAndCommand() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-text-editor', 'rename:activate', async event => {
      const editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return null;
      }

      await this._doRename(this._getProviderData(editor, (_ContextMenu || _load_ContextMenu()).default.isEventFromContextMenu(event) ? this.lastMouseEvent : null));
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

  renderRenameInput(editor, resolveNewName) {
    editor.selectWordsContainingCursors();
    const selectedText = editor.getSelectedText();

    return _react.createElement((_RenameComponent || _load_RenameComponent()).default, {
      selectedText: selectedText,
      submitNewName: resolveNewName
    });
  }

  mountRenameInput(editor, container, element) {
    const position = editor.getSelectedBufferRange().start;

    const overlayMarker = editor.markBufferRange(new _atom.Range(position, position), {
      invalidate: 'never'
    });

    editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      position: 'tail',
      item: container
    });

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => overlayMarker.destroy(), () => _reactDom.default.unmountComponentAtNode(container),

    // The editor may not mount the marker until the next update.
    // It's not safe to render anything until that point, as overlayed containers
    // often need to measure their size in the DOM.
    _rxjsBundlesRxMinJs.Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(() => {
      container.style.display = 'block';
      _reactDom.default.render(element, container);
    }));
  }

  async _getUserInput(editor) {
    // TODO: Should only be instantiated once.
    //       However, the node has trouble rendering at the correct position
    //       when it is instantiated once in the constructor and re-mounted
    const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
    container.className = 'rename-container';

    let disposable = null;

    const newName = await new Promise((resolve, reject) => {
      const renameElement = this.renderRenameInput(editor, resolve);
      disposable = this.mountRenameInput(editor, container, renameElement);

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
    const newName = await this._getUserInput(editor);
    if (newName == null) {
      return null;
    }

    const position = event != null ? (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(event, editor) : editor.getCursorBufferPosition();

    const providers = this._providers.getAllProvidersForEditor(editor);
    const resultPromise = (0, (_promise || _load_promise()).asyncFind)(Array.from(providers).map(provider => provider.rename(editor, position, newName).catch(err => {
      (0, (_log4js || _load_log4js()).getLogger)('rename').error('Error renaming', err);
      return new Map();
    })), x => x);

    return resultPromise;
  }

  async _doRename(changes) {
    const renameChanges = await changes;
    if (!renameChanges) {
      return false;
    }
    return (0, (_textEdit || _load_textEdit()).applyTextEditsForMultipleFiles)(renameChanges);
  }
} /**
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


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);