'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let tryCreateView = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (data) {
    try {
      if (data == null) {
        showWarning('Symbol references are not available for this project.');
      } else if (data.type === 'error') {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-references:error', { message: data.message });
        showWarning(data.message);
      } else if (!data.references.length) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-references:success', { resultCount: '0' });
        showWarning('No references found.');
      } else {
        const { baseUri, referencedSymbolName, references } = data;
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-references:success', {
          baseUri,
          referencedSymbolName,
          resultCount: references.length.toString()
        });
        const model = new (_FindReferencesModel || _load_FindReferencesModel()).default(baseUri, referencedSymbolName, references);

        return new (_FindReferencesElement || _load_FindReferencesElement()).default().initialize(model);
      }
    } catch (e) {
      // TODO(peterhal): Remove this when unhandled rejections have a default handler.
      logger.error('Exception in nuclide-find-references', e);
      atom.notifications.addError(`nuclide-find-references: ${e}`, { dismissable: true });
    }
  });

  return function tryCreateView(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _crypto = _interopRequireDefault(require('crypto'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _ContextMenu;

function _load_ContextMenu() {
  return _ContextMenu = _interopRequireDefault(require('../../commons-atom/ContextMenu'));
}

var _mouseToPosition;

function _load_mouseToPosition() {
  return _mouseToPosition = require('../../commons-atom/mouse-to-position');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _FindReferencesElement;

function _load_FindReferencesElement() {
  return _FindReferencesElement = _interopRequireDefault(require('./FindReferencesElement'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _FindReferencesModel;

function _load_FindReferencesModel() {
  return _FindReferencesModel = _interopRequireDefault(require('./FindReferencesModel'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */

/* global getSelection */

const FIND_REFERENCES_URI = 'atom://nuclide/find-references/';

function showWarning(message) {
  atom.notifications.addWarning('nuclide-find-references: ' + message, { dismissable: true });
}

function enableForEditor(editor) {
  const elem = atom.views.getView(editor);
  elem.classList.add('enable-nuclide-find-references');
}

function disableForEditor(editor) {
  const elem = atom.views.getView(editor);
  elem.classList.remove('enable-nuclide-find-references');
}

class Activation {

  constructor(state) {
    var _this = this;

    this._providers = [];
    this._supportedProviders = new Map();

    let lastMouseEvent;

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-text-editor', 'nuclide-find-references:activate', (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (event) {
        const view = yield tryCreateView((yield _this._getProviderData((_ContextMenu || _load_ContextMenu()).default.isEventFromContextMenu(event) ? lastMouseEvent : null)));
        if (view != null) {
          // Generate a unique identifier.
          const id = (_crypto.default.randomBytes(8) || '').toString('hex');
          const uri = FIND_REFERENCES_URI + id;
          const disposable = atom.workspace.addOpener(function (newUri) {
            if (uri === newUri) {
              return view;
            }
          });
          // not a file URI
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open(uri);
          // The new tab opens instantly, so this is no longer needed.
          disposable.dispose();
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()),

    // Mark text editors with a working provider with a special CSS class.
    // This ensures the context menu option only appears in supported projects.
    (0, (_textEditor || _load_textEditor()).observeTextEditors)((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (editor) {
        const path = editor.getPath();
        if (!path || _this._supportedProviders.get(editor)) {
          return;
        }
        _this._supportedProviders.set(editor, []);
        yield Promise.all(_this._providers.map((() => {
          var _ref4 = (0, _asyncToGenerator.default)(function* (provider) {
            if (yield provider.isEditorSupported(editor)) {
              if (_this._addSupportedProvider(editor, provider)) {
                enableForEditor(editor);
              }
            }
          });

          return function (_x4) {
            return _ref4.apply(this, arguments);
          };
        })()));
        const disposable = editor.onDidDestroy(function () {
          _this._supportedProviders.delete(editor);
          _this._subscriptions.remove(disposable);
        });
        _this._subscriptions.add(disposable);
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })()),

    // Enable text copy from the symbol reference
    atom.commands.add('nuclide-find-references-view', 'core:copy', () => {
      const selection = getSelection();
      if (selection != null) {
        const selectedText = selection.toString();
        atom.clipboard.write(selectedText);
      }
    }),

    // Add the context menu programmatically so we can capture the mouse event.
    atom.contextMenu.add({
      'atom-text-editor:not(.mini).enable-nuclide-find-references': [{
        label: 'Find References',
        command: 'nuclide-find-references:activate',
        created: event => {
          lastMouseEvent = event;
        }
      }]
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeProvider(provider) {
    var _this2 = this;

    this._providers.push(provider);
    // Editors are often open before providers load, so update existing ones too.
    atom.workspace.getTextEditors().forEach((() => {
      var _ref5 = (0, _asyncToGenerator.default)(function* (editor) {
        if (yield provider.isEditorSupported(editor)) {
          if (_this2._addSupportedProvider(editor, provider)) {
            enableForEditor(editor);
          }
        }
      });

      return function (_x5) {
        return _ref5.apply(this, arguments);
      };
    })());

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
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

  _getProviderData(event) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return null;
      }
      const path = editor.getPath();
      if (!path) {
        return null;
      }
      const point = event != null ? (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(event, editor) : editor.getCursorBufferPosition();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-references:activate', {
        path,
        row: point.row.toString(),
        column: point.column.toString()
      });
      const supported = _this3._supportedProviders.get(editor);
      if (!supported) {
        return null;
      }
      const providerData = yield Promise.all(supported.map(function (provider) {
        return provider.findReferences(editor, point);
      }));
      return providerData.filter(function (x) {
        return Boolean(x);
      })[0];
    })();
  }

  // Returns true if this adds the first provider for the editor.
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);