'use strict';

var _os = _interopRequireDefault(require('os'));

var _dedent;

function _load_dedent() {
  return _dedent = _interopRequireDefault(require('dedent'));
}

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

var _TerminalOmni2Provider;

function _load_TerminalOmni2Provider() {
  return _TerminalOmni2Provider = _interopRequireDefault(require('./TerminalOmni2Provider'));
}

var _terminalView;

function _load_terminalView() {
  return _terminalView = require('./terminal-view');
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('../../commons-node/nuclide-terminal-uri');
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
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
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
    }), atom.config.onDidChange('editor.fontSize', this._syncAtomStyle.bind(this)), atom.config.onDidChange('editor.fontFamily', this._syncAtomStyle.bind(this)), atom.config.onDidChange('editor.lineHeight', this._syncAtomStyle.bind(this)), () => this._styleSheet.dispose());
    this._syncAtomStyle();
  }

  dispose() {
    this._subscriptions.dispose();
  }

  _syncAtomStyle() {
    if (this._styleSheet != null) {
      this._styleSheet.dispose();
    }
    // Based on workspace-element in Atom
    this._styleSheet = atom.styles.addStyleSheet((_dedent || _load_dedent()).default`
      .terminal {
        font-size: ${atom.config.get('editor.fontSize')}px !important;
        font-family: ${atom.config.get('editor.fontFamily')} !important;
        line-height: ${atom.config.get('editor.lineHeight')} !important;
      }`, {
      sourcePath: 'nuclide-terminal-sync-with-atom',
      priority: -1
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

  consumeOmni2(registerProvider) {
    return registerProvider(new (_TerminalOmni2Provider || _load_TerminalOmni2Provider()).default({
      getCwdApi: () => this._cwd
    }));
  }

  _getPathOrCwd(event) {
    const editorPath = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target, true);

    if (editorPath != null) {
      return (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(editorPath) ? editorPath : (_nuclideUri || _load_nuclideUri()).default.dirname(editorPath);
    }

    if (this._cwd != null) {
      const cwd = this._cwd.getCwd();
      if (cwd != null) {
        return cwd.getPath();
      }
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