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

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
const MOVED_TERMINAL_NUX_SHOWN_KEY = 'atom_ide_terminal_moved_nux';

class Activation {
  constructor() {
    const focusManager = new (_FocusManager().FocusManager)();
    this._subscriptions = new (_UniversalDisposable().default)(focusManager, atom.workspace.addOpener((uri, options) => {
      if (uri.startsWith(_nuclideTerminalUri().URI_PREFIX)) {
        const info = (0, _nuclideTerminalUri().infoFromUri)(uri);

        if (info.cwd === '') {
          // $FlowFixMe we're threading cwd through options; it's not part of its type
          const cwd = options.cwd || this._cwd && this._cwd.getCwd();

          if (cwd != null) {
            info.cwd = cwd;
          }
        }

        return new (_terminalView().TerminalView)(info);
      }
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:toggle', () => {
      const activePane = atom.workspace.getActivePaneItem();

      if (activePane && activePane.getURI && activePane.getURI() === _nuclideTerminalUri().URI_PREFIX) {
        const container = atom.workspace.getActivePaneContainer();

        if (container === atom.workspace.getCenter()) {
          atom.confirm({
            message: 'This will destroy the current terminal',
            detail: 'Toggling active terminals in the center pane closes them.',
            buttons: ['Keep', 'Destroy'],
            defaultId: 0,
            cancelId: 0,
            type: 'warning'
          }, // $FlowFixMe Flow can't handle multiple definitions for confirm(). This is the newer async version.
          response => {
            if (response === 1) {
              atom.workspace.toggle(_nuclideTerminalUri().URI_PREFIX);
            }
          });
          return;
        }
      }

      atom.workspace.toggle(_nuclideTerminalUri().URI_PREFIX);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-terminal', event => {
      // HACK: we pass along the cwd in the opener's options to be able to
      // read from it above.
      // eslint-disable-next-line nuclide-internal/atom-apis
      openInNewPaneItem(_nuclideTerminalUri().URI_PREFIX, {
        cwd: this._getPathOrCwd(event),
        searchAllPanes: false
      });
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-local-terminal', () => {
      // HACK: we pass along the cwd in the opener's options to be able to
      // read from it above.
      // eslint-disable-next-line nuclide-internal/atom-apis
      openInNewPaneItem(_nuclideTerminalUri().URI_PREFIX, {
        cwd: _os.default.homedir()
      });
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

async function openInNewPaneItem(uri, options) {
  const existingPane = atom.workspace.paneForURI(uri); // TODO: The flow types are wrong. paneForURI returns a nullable pane

  if (!existingPane) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    return atom.workspace.open(uri, options);
  }

  const [item, hasShownNux] = await Promise.all([atom.workspace.createItemForURI(uri, options), _idbKeyval().default.get(MOVED_TERMINAL_NUX_SHOWN_KEY)]);
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
  return new (_UniversalDisposable().default)(_RxMin.Observable.create(() => {
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
  }).takeUntil(_RxMin.Observable.timer(1000 * 60)).takeUntil((0, _event().observableFromSubscribeFunction)(cb => atom.workspace.onDidDestroyPaneItem(cb)).filter(event => event.item === paneItem)).takeUntil(_RxMin.Observable.fromEvent(document.body, 'click').filter(e => e.target.classList.contains('nuclide-moved-terminal-nux-dismiss'))).subscribe());
}