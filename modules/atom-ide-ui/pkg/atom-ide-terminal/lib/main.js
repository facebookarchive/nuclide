"use strict";

function _destroyItemWhere() {
  const data = require("../../../../nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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

function _idbKeyval() {
  const data = _interopRequireDefault(require("idb-keyval"));

  _idbKeyval = function () {
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

function _nuclideTerminalInfo() {
  const data = require("./nuclide-terminal-info");

  _nuclideTerminalInfo = function () {
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
const MOVED_TERMINAL_NUX_SHOWN_KEY = 'atom_ide_terminal_moved_nux';

class Activation {
  constructor() {
    const focusManager = new (_FocusManager().FocusManager)();
    this._subscriptions = new (_UniversalDisposable().default)(focusManager, atom.workspace.addOpener((uri, options) => {
      if (uri === _nuclideTerminalInfo().TERMINAL_URI) {
        // $FlowFixMe this has the merged terminalInfo inside it
        const info = options.terminalInfo || {};

        if (info.cwd == null || info.cwd === '') {
          const cwd = this._cwd && this._cwd.getCwd();

          if (cwd != null) {
            info.cwd = cwd;
          }
        }

        return new (_terminalView().TerminalView)(Object.assign({}, _nuclideTerminalInfo().TERMINAL_DEFAULT_INFO, info));
      }
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:toggle', () => {
      const activePane = atom.workspace.getActivePaneItem();

      if (activePane && activePane.getURI && activePane.getURI() === _nuclideTerminalInfo().TERMINAL_URI) {
        const container = atom.workspace.getActivePaneContainer();

        if (container === atom.workspace.getCenter()) {
          atom.confirm({
            message: 'This will destroy the current terminal',
            detail: 'Toggling active terminals in the center pane closes them.',
            buttons: ['Keep', 'Destroy'],
            defaultId: 0,
            cancelId: 0,
            type: 'warning'
          }, response => {
            if (response === 1) {
              atom.workspace.toggle(_nuclideTerminalInfo().TERMINAL_URI);
            }
          });
          return;
        }
      }

      atom.workspace.toggle(_nuclideTerminalInfo().TERMINAL_URI);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-terminal', event => {
      // HACK: we pass along the cwd in the opener's options to be able to
      // read from it above.
      // eslint-disable-next-line nuclide-internal/atom-apis
      openTerminalInNewPaneItem({
        terminalInfo: {
          cwd: this._getPathOrCwd(event)
        },
        searchAllPanes: false
      });
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-local-terminal', () => {
      // HACK: we pass along the cwd in the opener's options to be able to
      // read from it above.
      // eslint-disable-next-line nuclide-internal/atom-apis
      openTerminalInNewPaneItem({
        terminalInfo: {
          cwd: _os.default.homedir()
        }
      });
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:toggle-terminal-focus', () => focusManager.toggleFocus()));
  }

  provideTerminal() {
    return {
      open: info => {
        const terminalView = openTerminalInNewPaneItem({
          terminalInfo: info
        });
        return terminalView;
      },
      close: key => {
        (0, _destroyItemWhere().destroyItemWhere)(item => {
          // $FlowFixMe this is on TerminalViews only
          if (typeof item.getTerminalKey !== 'function') {
            return false;
          }

          return item.getTerminalKey() === key;
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
      callback: {
        '': 'atom-ide-terminal:toggle',
        alt: 'atom-ide-terminal:new-terminal'
      },
      tooltip: 'Toggle Terminal (alt click for New)',
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

  consumeGatekeeperService(service) {
    return (0, _AtomServiceContainer().setGkService)(service);
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

async function openTerminalInNewPaneItem(options) {
  const existingPane = atom.workspace.paneForURI(_nuclideTerminalInfo().TERMINAL_URI); // TODO: The flow types are wrong. paneForURI returns a nullable pane

  if (!existingPane) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    return atom.workspace.open(_nuclideTerminalInfo().TERMINAL_URI, options);
  }

  const [item, hasShownNux] = await Promise.all([atom.workspace.createItemForURI(_nuclideTerminalInfo().TERMINAL_URI, options), _idbKeyval().default.get(MOVED_TERMINAL_NUX_SHOWN_KEY)]);
  existingPane.activateItem(item);
  existingPane.activate();

  if (!hasShownNux) {
    if (!(item instanceof _terminalView().TerminalView)) {
      throw new Error("Invariant violation: \"item instanceof TerminalView\"");
    }

    showTooltipForPaneItem(item);

    _idbKeyval().default.set(MOVED_TERMINAL_NUX_SHOWN_KEY, true);
  }

  return item;
}

function showTooltipForPaneItem(paneItem) {
  return new (_UniversalDisposable().default)(_rxjsCompatUmdMin.Observable.create(() => {
    const tooltip = atom.tooltips.add(paneItem.getElement(), {
      title: `
        <div>
          <span style="margin-right: 4px">
            We now open terminals here, but if you move them, new terminals
            will open in the same location.
          </span>
          <button class="btn btn-primary nuclide-moved-terminal-nux-dismiss">
            Got it
          </button>
        </div>
      `,
      trigger: 'manual',
      html: true
    });
    return () => tooltip.dispose();
  }).takeUntil(_rxjsCompatUmdMin.Observable.timer(1000 * 60)).takeUntil((0, _event().observableFromSubscribeFunction)(cb => atom.workspace.onDidDestroyPaneItem(cb)).filter(event => event.item === paneItem)).takeUntil(_rxjsCompatUmdMin.Observable.fromEvent(document.body, 'click').filter(e => e.target.classList.contains('nuclide-moved-terminal-nux-dismiss'))).subscribe());
}