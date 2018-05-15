'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _nuclideUri;





















function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));}var _promise;
function _load_promise() {return _promise = require('../../../../nuclide-commons/promise');}var _createPackage;
function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _ContextMenu;
function _load_ContextMenu() {return _ContextMenu = _interopRequireDefault(require('../../../../nuclide-commons-atom/ContextMenu'));}var _mouseToPosition;
function _load_mouseToPosition() {return _mouseToPosition = require('../../../../nuclide-commons-atom/mouse-to-position');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _analytics;
function _load_analytics() {return _analytics = _interopRequireDefault(require('../../../../nuclide-commons/analytics'));}var _FindReferencesViewModel;
function _load_FindReferencesViewModel() {return _FindReferencesViewModel = require('./FindReferencesViewModel');}var _log4js;
function _load_log4js() {return _log4js = require('log4js');}var _FindReferencesModel;
function _load_FindReferencesModel() {return _FindReferencesModel = _interopRequireDefault(require('./FindReferencesModel'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                             * All rights reserved.
                                                                                                                                                                                                                             *
                                                                                                                                                                                                                             * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                             *
                                                                                                                                                                                                                             * 
                                                                                                                                                                                                                             * @format
                                                                                                                                                                                                                             */ /* global getSelection */function showWarning(message) {atom.notifications.addWarning('Find References: ' + message, { dismissable: true });}function tryCreateView(data) {if (data == null) {showWarning('Symbol references are not available for this project.');
  } else if (data.type === 'error') {
    (_analytics || _load_analytics()).default.track('find-references:error', { message: data.message });
    showWarning(data.message);
  } else {
    const { baseUri, referencedSymbolName, references } = data;
    // Only record symbol name/uri if we actually found some references.
    const trackData = references.length ? { baseUri, referencedSymbolName } : {};
    (_analytics || _load_analytics()).default.track('find-references:success', Object.assign({
      resultCount: references.length.toString() },
    trackData));

    return createView(data);
  }
}

function createView(data) {
  const { baseUri, referencedSymbolName, references } = data;
  if (!data.references.length) {
    showWarning('No references found.');
  } else {
    let title = data.title;
    if (title == null) {
      title = 'Symbol References';
    }
    const model = new (_FindReferencesModel || _load_FindReferencesModel()).default(
    baseUri,
    referencedSymbolName,
    title,
    references);

    return new (_FindReferencesViewModel || _load_FindReferencesViewModel()).FindReferencesViewModel(model);
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
  });
  // not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open(view.getURI());
  // The new tab opens instantly, so this is no longer needed.
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









  constructor(state) {this._providers = [];this._supportedProviders = new Map();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    // Add this separately as registerOpenerAndCommand requires
    // this._subscriptions to be initialized for observeTextEditors function.
    this._subscriptions.add(this.registerOpenerAndCommand());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeBusySignal(busySignalService) {
    this._busySignalService = busySignalService;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._busySignalService = null;
    });
  }

  consumeProvider(provider) {var _this = this;
    this._providers.push(provider);
    // Editors are often open before providers load, so update existing ones too.
    atom.workspace.getTextEditors().forEach((() => {var _ref = (0, _asyncToGenerator.default)(function* (editor) {
        if (yield provider.isEditorSupported(editor)) {
          if (_this._addSupportedProvider(editor, provider)) {
            enableForEditor(editor);
          }
        }
      });return function (_x) {return _ref.apply(this, arguments);};})());

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

  provideReferencesViewService() {
    return {
      viewResults(results) {return (0, _asyncToGenerator.default)(function* () {
          openViewModel(createView(results));})();
      } };

  }

  registerOpenerAndCommand() {var _this2 = this;
    let lastMouseEvent;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.commands.add(
    'atom-text-editor',
    'find-references:activate', (() => {var _ref2 = (0, _asyncToGenerator.default)(
      function* (event) {
        openViewModel(
        tryCreateView((
        yield _this2._getProviderData(
        (_ContextMenu || _load_ContextMenu()).default.isEventFromContextMenu(event) ?
        lastMouseEvent :
        null))));



      });return function (_x2) {return _ref2.apply(this, arguments);};})()),

    // Mark text editors with a working provider with a special CSS class.
    // This ensures the context menu option only appears in supported projects.
    atom.workspace.observeTextEditors((() => {var _ref3 = (0, _asyncToGenerator.default)(function* (editor) {
        const path = editor.getPath();
        // flowlint-next-line sketchy-null-string:off
        if (!path || _this2._supportedProviders.get(editor)) {
          return;
        }
        _this2._supportedProviders.set(editor, []);
        yield Promise.all(
        _this2._providers.map((() => {var _ref4 = (0, _asyncToGenerator.default)(function* (provider) {
            if (yield provider.isEditorSupported(editor)) {
              if (_this2._addSupportedProvider(editor, provider)) {
                enableForEditor(editor);
              }
            }
          });return function (_x4) {return _ref4.apply(this, arguments);};})()));

        if (editor.isDestroyed()) {
          // This is asynchronous, so the editor may have been destroyed!
          _this2._supportedProviders.delete(editor);
          return;
        }
        const disposable = editor.onDidDestroy(function () {
          _this2._supportedProviders.delete(editor);
          _this2._subscriptions.remove(disposable);
        });
        _this2._subscriptions.add(disposable);
      });return function (_x3) {return _ref3.apply(this, arguments);};})()),
    // Enable text copy from the symbol reference
    atom.commands.add('atom-ide-find-references-view', 'core:copy', () => {
      const selection = getSelection();
      if (selection != null) {
        const selectedText = selection.toString();
        atom.clipboard.write(selectedText);
      }
    }),
    // Add the context menu programmatically so we can capture the mouse event.
    atom.contextMenu.add({
      'atom-text-editor:not(.mini).enable-atom-ide-find-references': [
      {
        label: 'Find References',
        command: 'find-references:activate',
        created: event => {
          lastMouseEvent = event;
        } }] }));




  }

  _getProviderData(event) {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return null;
      }
      const path = editor.getPath();
      // flowlint-next-line sketchy-null-string:off
      if (!path) {
        return null;
      }
      const point =
      event != null ?
      (0, (_mouseToPosition || _load_mouseToPosition()).bufferPositionForMouseEvent)(event, editor) :
      editor.getCursorBufferPosition();
      (_analytics || _load_analytics()).default.track('find-references:activate', {
        path,
        row: point.row.toString(),
        column: point.column.toString() });

      const supported = _this3._supportedProviders.get(editor);
      if (!supported) {
        return null;
      }
      const resultPromise = (0, (_promise || _load_promise()).asyncFind)(
      supported.map(function (provider) {return (
          provider.findReferences(editor, point).catch(function (err) {
            (0, (_log4js || _load_log4js()).getLogger)('find-references').error('Error finding references', err);
            return {
              type: 'error',
              message: String(err) };

          }));}),

      function (x) {return x;});

      const busySignalService = _this3._busySignalService;
      if (busySignalService != null) {
        const displayPath = (_nuclideUri || _load_nuclideUri()).default.basename(path);
        return busySignalService.reportBusyWhile(
        `Finding references for ${displayPath}:${point.row}:${point.column}`,
        function () {return resultPromise;},
        { revealTooltip: true });

      }
      return resultPromise;})();
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
  }}


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);