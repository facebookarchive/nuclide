'use strict';

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../../nuclide-commons-atom/destroyItemWhere');
}

var _PulseButtonWithTooltip;

function _load_PulseButtonWithTooltip() {
  return _PulseButtonWithTooltip = _interopRequireDefault(require('../../../../nuclide-commons-ui/PulseButtonWithTooltip'));
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../../nuclide-commons-ui/renderReactRoot');
}

var _ToolbarUtils;

function _load_ToolbarUtils() {
  return _ToolbarUtils = require('../../../../nuclide-commons-ui/ToolbarUtils');
}

var _event;

function _load_event() {
  return _event = require('../../../../nuclide-commons/event');
}

var _os = _interopRequireDefault(require('os'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../../../nuclide-commons-atom/getElementFilePath'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));
}

var _idbKeyval;

function _load_idbKeyval() {
  return _idbKeyval = _interopRequireDefault(require('idb-keyval'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AtomServiceContainer;

function _load_AtomServiceContainer() {
  return _AtomServiceContainer = require('./AtomServiceContainer');
}

var _terminalView;

function _load_terminalView() {
  return _terminalView = require('./terminal-view');
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('./nuclide-terminal-uri');
}

var _FocusManager;

function _load_FocusManager() {
  return _FocusManager = require('./FocusManager');
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

const NUX_SEEN_KEY = 'atom_ide_terminal_nux_seen';
// for homedir


class Activation {

  constructor() {
    const focusManager = new (_FocusManager || _load_FocusManager()).FocusManager();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(focusManager, atom.workspace.addOpener(uri => {
      if (uri.startsWith((_nuclideTerminalUri || _load_nuclideTerminalUri()).URI_PREFIX)) {
        return new (_terminalView || _load_terminalView()).TerminalView(uri);
      }
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-terminal', event => {
      const cwd = this._getPathOrCwd(event);
      const uri = cwd != null ? (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({ cwd }) : (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({});
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:new-local-terminal', event => {
      const uri = (0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({ cwd: _os.default.homedir() });
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
    }), atom.commands.add('atom-workspace', 'atom-ide-terminal:toggle-terminal-focus', () => focusManager.toggleFocus()));
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
      }
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-terminal');
    const buttonView = toolBar.addButton((0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
      icon: 'terminal',
      callback: 'atom-ide-terminal:new-terminal',
      tooltip: 'New Terminal',
      priority: 700
    }));

    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      toolBar.removeItems();
    }, _rxjsBundlesRxMinJs.Observable.defer(() => (_idbKeyval || _load_idbKeyval()).default.get(NUX_SEEN_KEY)).filter(seen => !seen)
    // monitor changes in the tool-bar's position, size, and visibility
    // and recreate the PulseButton on every significant change
    .switchMap(() => _rxjsBundlesRxMinJs.Observable.combineLatest((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.config.observe('tool-bar.visible', cb)), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.config.observe('tool-bar.position', cb)), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.config.observe('tool-bar.iconSize', cb)))).map(([visibility]) => visibility)
    // only show if the tool-bar is open
    .switchMap(isVisible => {
      if (!isVisible) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return _rxjsBundlesRxMinJs.Observable.create(() => {
        const rect = buttonView.element.getBoundingClientRect();
        const nuxRoot = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement((_PulseButtonWithTooltip || _load_PulseButtonWithTooltip()).default, {
          ariaLabel: 'Try the Terminal',
          tooltipText: 'There\'s now a new built-in terminal. Launch one here!',
          onDismiss: () => (_idbKeyval || _load_idbKeyval()).default.set(NUX_SEEN_KEY, true)
        }));
        nuxRoot.style.position = 'absolute';
        // attach a pulse button, offset so not to obscure the icon
        nuxRoot.style.top = rect.top + 15 + 'px';
        nuxRoot.style.left = rect.left + 18 + 'px';
        (0, (_nullthrows || _load_nullthrows()).default)(document.body).appendChild(nuxRoot);

        return () => {
          _reactDom.default.unmountComponentAtNode(nuxRoot);
          nuxRoot.remove();
        };
      });
    }).subscribe());
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('.terminal-pane', 'atom-ide-terminal:create-paste', async event => {
      const {
        currentTarget: { terminal }
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

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  // exported for package.json entry
  deserializeTerminalView: (_terminalView || _load_terminalView()).deserializeTerminalView
};

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);