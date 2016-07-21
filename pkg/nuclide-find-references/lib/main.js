Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getProviderData = _asyncToGenerator(function* () {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return null;
  }
  var path = editor.getPath();
  if (!path) {
    return null;
  }
  var point = editor.getCursorBufferPosition();
  (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('find-references:activate', {
    path: path,
    row: point.row.toString(),
    column: point.column.toString()
  });
  var supported = supportedProviders.get(editor);
  if (!supported) {
    return null;
  }
  var providerData = yield Promise.all(supported.map(function (provider) {
    return provider.findReferences(editor, point);
  }));
  return providerData.filter(function (x) {
    return Boolean(x);
  })[0];
});

var tryCreateView = _asyncToGenerator(function* () {
  try {
    var data = yield getProviderData();
    if (data == null) {
      showError('Symbol references are not available for this project.');
    } else if (data.type === 'error') {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('find-references:error', { message: data.message });
      showError(data.message);
    } else if (!data.references.length) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('find-references:success', { resultCount: '0' });
      showError('No references found.');
    } else {
      var _baseUri = data.baseUri;
      var _referencedSymbolName = data.referencedSymbolName;
      var _references = data.references;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('find-references:success', {
        baseUri: _baseUri,
        referencedSymbolName: _referencedSymbolName,
        resultCount: _references.length.toString()
      });
      var FindReferencesModel = require('./FindReferencesModel');
      var model = new FindReferencesModel(_baseUri, _referencedSymbolName, _references);

      return new (_FindReferencesElement2 || _FindReferencesElement()).default().initialize(model);
    }
  } catch (e) {
    // TODO(peterhal): Remove this when unhandled rejections have a default handler.

    var _require = require('../../nuclide-logging');

    var getLogger = _require.getLogger;

    getLogger().error('Exception in nuclide-find-references', e);
    showError(e);
  }
});

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeProvider = consumeProvider;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _crypto2;

function _crypto() {
  return _crypto2 = _interopRequireDefault(require('crypto'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _FindReferencesElement2;

function _FindReferencesElement() {
  return _FindReferencesElement2 = _interopRequireDefault(require('./FindReferencesElement'));
}

var FIND_REFERENCES_URI = 'atom://nuclide/find-references/';

var subscriptions = null;
var providers = [];
var supportedProviders = new Map();

function showError(message) {
  atom.notifications.addError('nuclide-find-references: ' + message, { dismissable: true });
}

function enableForEditor(editor) {
  var elem = atom.views.getView(editor);
  elem.classList.add('enable-nuclide-find-references');
}

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-find-references:activate', _asyncToGenerator(function* () {
    var view = yield tryCreateView();
    if (view != null) {
      (function () {
        // Generate a unique identifier.
        var id = ((_crypto2 || _crypto()).default.randomBytes(8) || '').toString('hex');
        var uri = FIND_REFERENCES_URI + id;
        var disposable = atom.workspace.addOpener(function (newUri) {
          if (uri === newUri) {
            return view;
          }
        });
        atom.workspace.open(uri);
        // The new tab opens instantly, so this is no longer needed.
        disposable.dispose();
      })();
    }
  })));

  // Mark text editors with a working provider with a special CSS class.
  // This ensures the context menu option only appears in supported projects.
  subscriptions.add(atom.workspace.observeTextEditors(_asyncToGenerator(function* (editor) {
    var path = editor.getPath();
    if (!path || supportedProviders.get(editor)) {
      return;
    }
    var supported = yield Promise.all(providers.map(_asyncToGenerator(function* (provider) {
      if (yield provider.isEditorSupported(editor)) {
        return provider;
      }
      return null;
    })));
    supported = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(supported);
    if (supported.length) {
      enableForEditor(editor);
    }
    supportedProviders.set(editor, supported);
    if (subscriptions) {
      (function () {
        var disposable = editor.onDidDestroy(function () {
          supportedProviders.delete(editor);
          if (subscriptions) {
            subscriptions.remove(disposable);
          }
        });
        subscriptions.add(disposable);
      })();
    }
  })));

  // Enable text copy from the symbol reference view
  subscriptions.add(atom.commands.add('nuclide-find-references-view', 'core:copy', function () {
    var selectedText = window.getSelection().toString();
    atom.clipboard.write(selectedText);
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
  supportedProviders.forEach(_asyncToGenerator(function* (supported, editor) {
    if (yield provider.isEditorSupported(editor)) {
      if (!supported.length) {
        enableForEditor(editor);
      }
      supported.push(provider);
    }
  }));
}

// Return true if your provider supports finding references for the provided TextEditor.

// `findReferences` will only be called if `isEditorSupported` previously returned true
// for the given TextEditor.