'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getProviderData = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return null;
    }
    const path = editor.getPath();
    if (!path) {
      return null;
    }
    const point = editor.getCursorBufferPosition();
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-references:activate', {
      path,
      row: point.row.toString(),
      column: point.column.toString()
    });
    const supported = supportedProviders.get(editor);
    if (!supported) {
      return null;
    }
    const providerData = yield Promise.all(supported.map(function (provider) {
      return provider.findReferences(editor, point);
    }));
    return providerData.filter(function (x) {
      return Boolean(x);
    })[0];
  });

  return function getProviderData() {
    return _ref.apply(this, arguments);
  };
})();

let tryCreateView = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    try {
      const data = yield getProviderData();
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

  return function tryCreateView() {
    return _ref2.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeProvider = consumeProvider;

var _crypto = _interopRequireDefault(require('crypto'));

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

/* global getSelection */

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const FIND_REFERENCES_URI = 'atom://nuclide/find-references/';

let subscriptions = null;
let providers = [];
const supportedProviders = new Map();

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

// Returns true if this is this adds the supported provider.
function addSupportedProvider(editor, provider) {
  let supported = supportedProviders.get(editor);
  if (supported == null) {
    supported = [];
    supportedProviders.set(editor, supported);
  }
  supported.push(provider);
  return supported.length === 1;
}

function activate(state) {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-find-references:activate', (0, _asyncToGenerator.default)(function* () {
    const view = yield tryCreateView();
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
  })));

  // Mark text editors with a working provider with a special CSS class.
  // This ensures the context menu option only appears in supported projects.
  subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)((() => {
    var _ref4 = (0, _asyncToGenerator.default)(function* (editor) {
      const path = editor.getPath();
      if (!path || supportedProviders.get(editor)) {
        return;
      }
      supportedProviders.set(editor, []);
      yield Promise.all(providers.map((() => {
        var _ref5 = (0, _asyncToGenerator.default)(function* (provider) {
          if (yield provider.isEditorSupported(editor)) {
            if (addSupportedProvider(editor, provider)) {
              enableForEditor(editor);
            }
          }
        });

        return function (_x2) {
          return _ref5.apply(this, arguments);
        };
      })()));
      if (subscriptions) {
        const disposable = editor.onDidDestroy(function () {
          supportedProviders.delete(editor);
          if (subscriptions) {
            subscriptions.remove(disposable);
          }
        });
        subscriptions.add(disposable);
      }
    });

    return function (_x) {
      return _ref4.apply(this, arguments);
    };
  })()));

  // Enable text copy from the symbol reference view
  subscriptions.add(atom.commands.add('nuclide-find-references-view', 'core:copy', () => {
    const selection = getSelection();
    if (selection != null) {
      const selectedText = selection.toString();
      atom.clipboard.write(selectedText);
    }
  }));
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  providers = [];
}

function consumeProvider(provider) {
  providers.push(provider);
  // Editors are often open before providers load, so update existing ones too.
  atom.workspace.getTextEditors().forEach((() => {
    var _ref6 = (0, _asyncToGenerator.default)(function* (editor) {
      if (yield provider.isEditorSupported(editor)) {
        if (addSupportedProvider(editor, provider)) {
          enableForEditor(editor);
        }
      }
    });

    return function (_x3) {
      return _ref6.apply(this, arguments);
    };
  })());

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    providers = providers.filter(p => p !== provider);

    supportedProviders.forEach((supported, editor) => {
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