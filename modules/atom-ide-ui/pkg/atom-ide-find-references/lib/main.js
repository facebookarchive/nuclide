"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _FindReferencesViewModel() {
  const data = require("./FindReferencesViewModel");

  _FindReferencesViewModel = function () {
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

function _FindReferencesModel() {
  const data = _interopRequireDefault(require("./FindReferencesModel"));

  _FindReferencesModel = function () {
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
 * 
 * @format
 */

/* global getSelection */
function showWarning(message) {
  atom.notifications.addWarning('Find References: ' + message, {
    dismissable: true
  });
}

function tryCreateView(data) {
  if (data == null) {
    showWarning('Symbol references are not available for this project.');
  } else if (data.type === 'error') {
    _analytics().default.track('find-references:error', {
      message: data.message
    });

    showWarning(data.message);
  } else {
    const {
      baseUri,
      referencedSymbolName,
      references
    } = data; // Only record symbol name/uri if we actually found some references.

    const trackData = references.length ? {
      baseUri,
      referencedSymbolName
    } : {};

    _analytics().default.track('find-references:success', Object.assign({
      resultCount: references.length.toString()
    }, trackData));

    return createView(data);
  }
}

function createView(data) {
  const {
    baseUri,
    referencedSymbolName,
    references
  } = data;

  if (!data.references.length) {
    showWarning('No references found.');
  } else {
    let title = data.title;

    if (title == null) {
      title = 'Symbol References';
    }

    const model = new (_FindReferencesModel().default)(baseUri, referencedSymbolName, title, references);
    return new (_FindReferencesViewModel().FindReferencesViewModel)(model);
  }
}

function openViewModel(view) {
  if (!view) {
    return;
  }

  const disposable = atom.workspace.addOpener(newUri => {
    if (view.getURI() === newUri) {
      return view;
    }
  }); // not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis

  atom.workspace.open(view.getURI()); // The new tab opens instantly, so this is no longer needed.

  disposable.dispose();
}

function enableForEditor(editor) {
  const elem = atom.views.getView(editor);
  elem.classList.add('enable-atom-ide-find-references');
}

function disableForEditor(editor) {
  const elem = atom.views.getView(editor);
  elem.classList.remove('enable-atom-ide-find-references');
}

class Activation {
  constructor(state) {
    this._providers = [];
    this._supportedProviders = new Map();
    this._subscriptions = new (_UniversalDisposable().default)(); // Add this separately as registerOpenerAndCommand requires
    // this._subscriptions to be initialized for observeTextEditors function.

    this._subscriptions.add(this.registerOpenerAndCommand());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeBusySignal(busySignalService) {
    this._busySignalService = busySignalService;
    return new (_UniversalDisposable().default)(() => {
      this._busySignalService = null;
    });
  }

  consumeProvider(provider) {
    this._providers.push(provider); // Editors are often open before providers load, so update existing ones too.


    atom.workspace.getTextEditors().forEach(async editor => {
      if (await provider.isEditorSupported(editor)) {
        if (this._addSupportedProvider(editor, provider)) {
          enableForEditor(editor);
        }
      }
    });
    return new (_UniversalDisposable().default)(() => {
      this._providers = this._providers.filter(p => p !== provider);

      this._supportedProviders.forEach((supported, editor) => {
        const providerIdx = supported.indexOf(provider);

        if (providerIdx !== -1) {
          supported.splice(providerIdx, 1);

          if (supported.length === 0) {
            disableForEditor(editor);
          }
        }
      });
    });
  }

  provideReferencesViewService() {
    return {
      async viewResults(results) {
        openViewModel(createView(results));
      }

    };
  }

  registerOpenerAndCommand() {
    let lastMouseEvent;
    return new (_UniversalDisposable().default)(atom.commands.add('atom-text-editor', 'find-references:activate', async event => {
      openViewModel(tryCreateView((await this._getProviderData(_ContextMenu().default.isEventFromContextMenu(event) ? lastMouseEvent : null))));
    }), // Mark text editors with a working provider with a special CSS class.
    // This ensures the context menu option only appears in supported projects.
    atom.workspace.observeTextEditors(async editor => {
      const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

      if (!path || this._supportedProviders.get(editor)) {
        return;
      }

      this._supportedProviders.set(editor, []);

      await Promise.all(this._providers.map(async provider => {
        if (await provider.isEditorSupported(editor)) {
          if (this._addSupportedProvider(editor, provider)) {
            enableForEditor(editor);
          }
        }
      }));

      if (editor.isDestroyed()) {
        // This is asynchronous, so the editor may have been destroyed!
        this._supportedProviders.delete(editor);

        return;
      }

      const disposable = editor.onDidDestroy(() => {
        this._supportedProviders.delete(editor);

        this._subscriptions.remove(disposable);
      });

      this._subscriptions.add(disposable);
    }), // Enable text copy from the symbol reference
    atom.commands.add('atom-ide-find-references-view', 'core:copy', () => {
      const selection = getSelection();

      if (selection != null) {
        const selectedText = selection.toString();
        atom.clipboard.write(selectedText);
      }
    }), // Add the context menu programmatically so we can capture the mouse event.
    atom.contextMenu.add({
      'atom-text-editor:not(.mini).enable-atom-ide-find-references': [{
        label: 'Find References',
        command: 'find-references:activate',
        created: event => {
          lastMouseEvent = event;
        }
      }]
    }));
  }

  async _getProviderData(event) {
    const editor = atom.workspace.getActiveTextEditor();

    if (!editor) {
      return null;
    }

    const path = editor.getPath(); // flowlint-next-line sketchy-null-string:off

    if (!path) {
      return null;
    }

    const point = event != null ? (0, _mouseToPosition().bufferPositionForMouseEvent)(event, editor) : editor.getCursorBufferPosition();

    _analytics().default.track('find-references:activate', {
      path,
      row: point.row.toString(),
      column: point.column.toString()
    });

    const supported = this._supportedProviders.get(editor);

    if (!supported) {
      return null;
    }

    const resultPromise = (0, _promise().asyncFind)(supported.map(provider => provider.findReferences(editor, point).catch(err => {
      (0, _log4js().getLogger)('find-references').error('Error finding references', err);
      return {
        type: 'error',
        message: String(err)
      };
    })), x => x);
    const busySignalService = this._busySignalService;

    if (busySignalService != null) {
      const displayPath = _nuclideUri().default.basename(path);

      return busySignalService.reportBusyWhile(`Finding references for ${displayPath}:${point.row}:${point.column}`, () => resultPromise, {
        revealTooltip: true
      });
    }

    return resultPromise;
  } // Returns true if this adds the first provider for the editor.


  _addSupportedProvider(editor, provider) {
    let supported = this._supportedProviders.get(editor);

    if (supported == null) {
      supported = [];

      this._supportedProviders.set(editor, supported);
    }

    supported.push(provider);
    return supported.length === 1;
  }

}

(0, _createPackage().default)(module.exports, Activation);