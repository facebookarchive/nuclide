"use strict";

function _destroyItemWhere() {
  const data = require("../../../../nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
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

function _getElementFilePath() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/getElementFilePath"));

  _getElementFilePath = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _AtomServiceContainer() {
  const data = require("./AtomServiceContainer");

  _AtomServiceContainer = function () {
    return data;
  };

  return data;
}

function _terminalView() {
  const data = require("./terminal-view");

  _terminalView = function () {
    return data;
  };

  return data;
}

function _nuclideTerminalUri() {
  const data = require("./nuclide-terminal-uri");

  _nuclideTerminalUri = function () {
    return data;
  };

  return data;
}

function _FocusManager() {
  const data = require("./FocusManager");

  _FocusManager = function () {
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
// for homedir
class Activation {
  constructor() {
    const focusManager = new (_FocusManager().FocusManager)();
    this._subscriptions = new (_UniversalDisposable().default)(focusManager, atom.workspace.addOpener(uri => {
      if (uri.startsWith(_nuclideTerminalUri().URI_PREFIX)) {
        return new (_terminalView().TerminalView)(uri);
      }
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-terminal', event => {
      const cwd = this._getPathOrCwd(event);

      const uri = cwd != null ? (0, _nuclideTerminalUri().uriFromInfo)({
        cwd
      }) : (0, _nuclideTerminalUri().uriFromInfo)({});
      (0, _goToLocation().goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-local-terminal', event => {
      const uri = (0, _nuclideTerminalUri().uriFromInfo)({
        cwd: _os.default.homedir()
      });
      (0, _goToLocation().goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:toggle-terminal-focus', () => focusManager.toggleFocus()));
  }

  provideTerminal() {
    return {
      open: info => {
        const terminalView = (0, _goToLocation().goToLocation)((0, _nuclideTerminalUri().uriFromInfo)(info));
        return terminalView;
      },
      close: key => {
        (0, _destroyItemWhere().destroyItemWhere)(item => {
          if (item.getURI == null || item.getURI() == null) {
            return false;
          }

          const uri = (0, _nullthrows().default)(item.getURI());

          try {
            // Only close terminal tabs with the same unique key.
            const otherInfo = (0, _nuclideTerminalUri().infoFromUri)(uri);
            return otherInfo.key === key;
          } catch (e) {}

          return false;
        });
      }
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-terminal');
    toolBar.addButton({
      icon: 'terminal',
      callback: 'atom-ide-terminal:new-terminal',
      tooltip: 'New Terminal',
      priority: 700
    });
    const disposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    });

    this._subscriptions.add(disposable);

    return disposable;
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;
    const disposable = new (_UniversalDisposable().default)(atom.commands.add('.terminal-pane', 'atom-ide-terminal:create-paste', async event => {
      const {
        currentTarget: {
          terminal
        }
      } = event;
      const uri = await createPaste(terminal.getSelection(), {
        title: 'Paste from Atom IDE Terminal'
      }, 'terminal paste');
      atom.notifications.addSuccess(`Created paste at ${uri}`);
    }), atom.contextMenu.add({
      '.terminal-pane': [{
        label: 'Create Paste',
        command: 'atom-ide-terminal:create-paste',
        shouldDisplay: event => {
          const div = event.target.closest('.terminal-pane');

          if (div == null) {
            return false;
          }

          const {
            terminal
          } = div;

          if (terminal == null) {
            return false;
          }

          return terminal.hasSelection();
        }
      }, {
        type: 'separator'
      }]
    }));

    this._subscriptions.add(disposable);

    return new (_UniversalDisposable().default)(() => {
      disposable.dispose();

      this._subscriptions.remove(disposable);
    });
  }

  initializeCwdApi(cwd) {
    this._cwd = cwd;
    return new (_UniversalDisposable().default)(() => {
      this._cwd = null;
    });
  }

  consumeRpcService(rpcService) {
    return (0, _AtomServiceContainer().setRpcService)(rpcService);
  }

  _getPathOrCwd(event) {
    const editorPath = (0, _getElementFilePath().default)(event.target, true);

    if (editorPath != null) {
      return _nuclideUri().default.endsWithSeparator(editorPath) ? editorPath : _nuclideUri().default.dirname(editorPath);
    }

    if (this._cwd != null) {
      return this._cwd.getCwd();
    }

    return null;
  }

} // eslint-disable-next-line nuclide-internal/no-commonjs


module.exports = {
  // exported for package.json entry
  deserializeTerminalView: _terminalView().deserializeTerminalView
};
(0, _createPackage().default)(module.exports, Activation);