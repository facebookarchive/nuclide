'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _destroyItemWhere;











function _load_destroyItemWhere() {return _destroyItemWhere = require('../../../../nuclide-commons-atom/destroyItemWhere');}

var _os = _interopRequireDefault(require('os'));var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _createPackage;

function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _getElementFilePath;
function _load_getElementFilePath() {return _getElementFilePath = _interopRequireDefault(require('../../../../nuclide-commons-atom/getElementFilePath'));}var _goToLocation;
function _load_goToLocation() {return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _AtomServiceContainer;

function _load_AtomServiceContainer() {return _AtomServiceContainer = require('./AtomServiceContainer');}var _terminalView;
function _load_terminalView() {return _terminalView = require('./terminal-view');}var _nuclideTerminalUri;
function _load_nuclideTerminalUri() {return _nuclideTerminalUri = require('./nuclide-terminal-uri');}var _FocusManager;
function _load_FocusManager() {return _FocusManager = require('./FocusManager');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                *
                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                *
                                                                                                                                                                                * 
                                                                                                                                                                                * @format
                                                                                                                                                                                */class Activation {constructor() {const focusManager = new (_FocusManager || _load_FocusManager()).FocusManager();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    focusManager,
    atom.workspace.addOpener(uri => {
      if (uri.startsWith((_nuclideTerminalUri || _load_nuclideTerminalUri()).URI_PREFIX)) {
        return new (_terminalView || _load_terminalView()).TerminalView(uri);
      }
    }),
    atom.commands.add(
    'atom-workspace',
    'atom-ide-terminal:new-terminal',
    event => {
      const cwd = this._getPathOrCwd(event);
      const uri = cwd != null ? (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({ cwd }) : (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({});
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }),

    atom.commands.add(
    'atom-workspace',
    'atom-ide-terminal:new-local-terminal',
    event => {
      const uri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({ cwd: _os.default.homedir() });
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }),

    atom.commands.add(
    'atom-workspace',
    'atom-ide-terminal:toggle-terminal-focus',
    () => focusManager.toggleFocus()));


  }

  provideTerminal() {
    return {
      open: info => {
        const terminalView = (0, (_goToLocation || _load_goToLocation()).goToLocation)((0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)(info));
        return terminalView;
      },
      close: key => {
        (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => {
          if (item.getURI == null || item.getURI() == null) {
            return false;
          }

          const uri = (0, (_nullthrows || _load_nullthrows()).default)(item.getURI());
          try {
            // Only close terminal tabs with the same unique key.
            const otherInfo = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).infoFromUri)(uri);
            return otherInfo.key === key;
          } catch (e) {}
          return false;
        });
      } };

  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.commands.add(
    '.terminal-pane',
    'atom-ide-terminal:create-paste', (() => {var _ref = (0, _asyncToGenerator.default)(
      function* (event) {
        const {
          currentTarget: { terminal } } =
        event;
        const uri = yield createPaste(
        terminal.getSelection(),
        {
          title: 'Paste from Atom IDE Terminal' },

        'terminal paste');

        atom.notifications.addSuccess(`Created paste at ${uri}`);
      });return function (_x) {return _ref.apply(this, arguments);};})()),

    atom.contextMenu.add({
      '.terminal-pane': [
      {
        label: 'Create Paste',
        command: 'atom-ide-terminal:create-paste',
        shouldDisplay: event => {
          const div = event.target.closest('.terminal-pane');
          if (div == null) {
            return false;
          }
          const { terminal } = div;
          if (terminal == null) {
            return false;
          }
          return terminal.hasSelection();
        } },

      { type: 'separator' }] }));



    this._subscriptions.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      disposable.dispose();
      this._subscriptions.remove(disposable);
    });
  }

  initializeCwdApi(cwd) {
    this._cwd = cwd;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._cwd = null;
    });
  }

  consumeRpcService(rpcService) {
    return (0, (_AtomServiceContainer || _load_AtomServiceContainer()).setRpcService)(rpcService);
  }

  _getPathOrCwd(event) {
    const editorPath = (0, (_getElementFilePath || _load_getElementFilePath()).default)(
    event.target,
    true);


    if (editorPath != null) {
      return (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(editorPath) ?
      editorPath :
      (_nuclideUri || _load_nuclideUri()).default.dirname(editorPath);
    }

    if (this._cwd != null) {
      return this._cwd.getCwd();
    }

    return null;
  }}


// eslint-disable-next-line nuclide-internal/no-commonjs
// for homedir
module.exports = { // exported for package.json entry
  deserializeTerminalView: (_terminalView || _load_terminalView()).deserializeTerminalView };


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);