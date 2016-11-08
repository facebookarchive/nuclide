'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesView = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


var _constants;

function _load_constants() {
  return _constants = require('../nuclide-hg-git-bridge/lib/constants');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _reactForAtom = require('react-for-atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _actions;

function _load_actions() {
  return _actions = require('../nuclide-hg-repository/lib/actions');
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let MultiRootChangedFilesView = exports.MultiRootChangedFilesView = class MultiRootChangedFilesView extends _reactForAtom.React.Component {

  componentDidMount() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const commandPrefix = this.props.commandPrefix;

    this._subscriptions.add(atom.contextMenu.add({
      [`.${ commandPrefix }-file-entry`]: [{ type: 'separator' }, {
        label: 'Add to Mercurial',
        command: `${ commandPrefix }:add`,
        shouldDisplay: event => {
          // The context menu has the `currentTarget` set to `document`.
          // Hence, use `target` instead.
          const filePath = event.target.getAttribute('data-path');
          const rootPath = event.target.getAttribute('data-root');
          const fileChangesForRoot = this.props.fileChanges.get(rootPath);

          if (!fileChangesForRoot) {
            throw new Error('Invalid rootpath');
          }

          const statusCode = fileChangesForRoot.get(filePath);
          return statusCode === (_constants || _load_constants()).FileChangeStatus.UNTRACKED;
        }
      }, {
        label: 'Revert',
        command: `${ commandPrefix }:revert`,
        shouldDisplay: event => {
          // The context menu has the `currentTarget` set to `document`.
          // Hence, use `target` instead.
          const filePath = event.target.getAttribute('data-path');
          const rootPath = event.target.getAttribute('data-root');
          const fileChangesForRoot = this.props.fileChanges.get(rootPath);

          if (!fileChangesForRoot) {
            throw new Error('Invalid rootpath');
          }

          const statusCode = fileChangesForRoot.get(filePath);
          if (statusCode == null) {
            return false;
          }
          return (_constants || _load_constants()).RevertibleStatusCodes.includes(statusCode);
        }
      }, {
        label: 'Goto File',
        command: `${ commandPrefix }:goto-file`
      }, {
        label: 'Copy File Name',
        command: `${ commandPrefix }:copy-file-name`
      }, {
        label: 'Copy Full Path',
        command: `${ commandPrefix }:copy-full-path`
      }, { type: 'separator' }]
    }));

    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:goto-file`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        atom.workspace.open(filePath);
      }
    }));

    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:copy-full-path`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.getPath(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:copy-file-name`, event => {
      atom.clipboard.write((_nuclideUri || _load_nuclideUri()).default.basename(this._getFilePathFromEvent(event) || ''));
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:add`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        (0, (_actions || _load_actions()).addPath)(filePath);
      }
    }));
    this._subscriptions.add(atom.commands.add(`.${ commandPrefix }-file-entry`, `${ commandPrefix }:revert`, event => {
      const filePath = this._getFilePathFromEvent(event);
      if (filePath != null && filePath.length) {
        (0, (_actions || _load_actions()).revertPath)(filePath);
      }
    }));
  }

  _getFilePathFromEvent(event) {
    const eventTarget = event.currentTarget;
    return eventTarget.getAttribute('data-path');
  }

  render() {
    if (this.props.fileChanges.size === 0) {
      return _reactForAtom.React.createElement(
        'div',
        null,
        'No changes'
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-ui-multi-root-file-tree-container' },
      Array.from(this.props.fileChanges.entries()).map((_ref) => {
        var _ref2 = _slicedToArray(_ref, 2);

        let root = _ref2[0],
            fileChanges = _ref2[1];
        return _reactForAtom.React.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
          key: root,
          fileChanges: fileChanges,
          rootPath: root,
          commandPrefix: this.props.commandPrefix,
          selectedFile: this.props.selectedFile,
          hideEmptyFolders: this.props.hideEmptyFolders,
          shouldShowFolderName: this.props.fileChanges.size > 1,
          onFileChosen: this.props.onFileChosen
        });
      })
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }
};