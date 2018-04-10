'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../commons-atom/getElementFilePath'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _TerminalDashProvider;

function _load_TerminalDashProvider() {
  return _TerminalDashProvider = _interopRequireDefault(require('./TerminalDashProvider'));
}

var _terminalView;

function _load_terminalView() {
  return _terminalView = require('./terminal-view');
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('../../commons-node/nuclide-terminal-uri');
}

var _FocusManager;

function _load_FocusManager() {
  return _FocusManager = require('./FocusManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFB
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

// for homedir
const TERMINAL_CONTEXT_MENU_PRIORITY = 100;

class Activation {

  constructor() {
    const focusManager = new (_FocusManager || _load_FocusManager()).FocusManager();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(focusManager, atom.workspace.addOpener(uri => {
      if (uri.startsWith((_nuclideTerminalUri || _load_nuclideTerminalUri()).URI_PREFIX)) {
        return new (_terminalView || _load_terminalView()).TerminalView(uri);
      }
    }), atom.commands.add('atom-workspace', 'nuclide-terminal:new-terminal', event => {
      const cwd = this._getPathOrCwd(event);
      const uri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromCwd)(cwd);
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'nuclide-terminal:new-local-terminal', event => {
      const uri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromCwd)(_os.default.homedir());
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'nuclide-terminal:toggle-terminal-focus', () => focusManager.toggleFocus()));
  }

  provideTerminal() {
    return Object.freeze({
      infoFromUri: (_nuclideTerminalUri || _load_nuclideTerminalUri()).infoFromUri,
      uriFromInfo: (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo,
      uriFromCwd: (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromCwd
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('.terminal-pane', 'nuclide-terminal:create-paste', (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (event) {
        const { currentTarget: { terminal } } = event;
        const uri = yield createPaste(terminal.getSelection(), {
          title: 'Paste from Nuclide Terminal'
        }, 'terminal paste');
        atom.notifications.addSuccess(`Created paste at ${uri}`);
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()), atom.contextMenu.add({
      '.terminal-pane': [{
        label: 'Create Paste',
        command: 'nuclide-terminal:create-paste',
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
        }
      }, { type: 'separator' }]
    }));
    this._subscriptions.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      disposable.dispose();
      this._subscriptions.remove(disposable);
    });
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const menuItemSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    menuItemSubscriptions.add(contextMenu.addItemToShowInSection({
      label: 'New Terminal Here',
      callback() {
        const node = contextMenu.getSingleSelectedNode();

        if (!(node != null)) {
          throw new Error('Invariant violation: "node != null"');
        }

        const cwd = node.isContainer ? node.uri : (_nuclideUri || _load_nuclideUri()).default.dirname(node.uri);
        (0, (_goToLocation || _load_goToLocation()).goToLocation)((0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromCwd)(cwd));
      },
      shouldDisplay() {
        const node = contextMenu.getSingleSelectedNode();
        return node != null && node.uri != null && node.uri.length > 0;
      }
    }, TERMINAL_CONTEXT_MENU_PRIORITY));
    this._subscriptions.add(menuItemSubscriptions);

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._subscriptions.remove(menuItemSubscriptions));
  }

  initializeCwdApi(cwd) {
    this._cwd = cwd;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._cwd = null;
    });
  }

  consumeDash(registerProvider) {
    const subscription = registerProvider(new (_TerminalDashProvider || _load_TerminalDashProvider()).default({
      getCwdApi: () => this._cwd
    }));
    this._subscriptions.add(subscription);
    return subscription;
  }

  _getPathOrCwd(event) {
    const editorPath = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target, true);

    if (editorPath != null) {
      return (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(editorPath) ? editorPath : (_nuclideUri || _load_nuclideUri()).default.dirname(editorPath);
    }

    if (this._cwd != null) {
      return this._cwd.getCwd();
    }

    return null;
  }
}

// eslint-disable-next-line rulesdir/no-commonjs
module.exports = {
  // exported for package.json entry
  deserializeTerminalView: (_terminalView || _load_terminalView()).deserializeTerminalView
};

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);