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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideHgGitBridgeLibConstants;

function _load_nuclideHgGitBridgeLibConstants() {
  return _nuclideHgGitBridgeLibConstants = require('../nuclide-hg-git-bridge/lib/constants');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideHgRepositoryLibActions;

function _load_nuclideHgRepositoryLibActions() {
  return _nuclideHgRepositoryLibActions = require('../nuclide-hg-repository/lib/actions');
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = _interopRequireDefault(require('./ChangedFilesList'));
}

var MultiRootChangedFilesView = (function (_React$Component) {
  _inherits(MultiRootChangedFilesView, _React$Component);

  function MultiRootChangedFilesView() {
    _classCallCheck(this, MultiRootChangedFilesView);

    _get(Object.getPrototypeOf(MultiRootChangedFilesView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MultiRootChangedFilesView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
      var commandPrefix = this.props.commandPrefix;

      this._subscriptions.add(atom.contextMenu.add(_defineProperty({}, '.' + commandPrefix + '-file-entry', [{ type: 'separator' }, {
        label: 'Add to Mercurial',
        command: commandPrefix + ':add',
        shouldDisplay: function shouldDisplay(event) {
          // The context menu has the `currentTarget` set to `document`.
          // Hence, use `target` instead.
          var filePath = event.target.getAttribute('data-path');
          var rootPath = event.target.getAttribute('data-root');
          var fileChangesForRoot = _this.props.fileChanges.get(rootPath);
          (0, (_assert || _load_assert()).default)(fileChangesForRoot, 'Invalid rootpath');
          var statusCode = fileChangesForRoot.get(filePath);
          return statusCode === (_nuclideHgGitBridgeLibConstants || _load_nuclideHgGitBridgeLibConstants()).FileChangeStatus.UNTRACKED;
        }
      }, {
        label: 'Revert',
        command: commandPrefix + ':revert',
        shouldDisplay: function shouldDisplay(event) {
          // The context menu has the `currentTarget` set to `document`.
          // Hence, use `target` instead.
          var filePath = event.target.getAttribute('data-path');
          var rootPath = event.target.getAttribute('data-root');
          var fileChangesForRoot = _this.props.fileChanges.get(rootPath);
          (0, (_assert || _load_assert()).default)(fileChangesForRoot, 'Invalid rootpath');
          var statusCode = fileChangesForRoot.get(filePath);
          if (statusCode == null) {
            return false;
          }
          return (_nuclideHgGitBridgeLibConstants || _load_nuclideHgGitBridgeLibConstants()).RevertibleStatusCodes.includes(statusCode);
        }
      }, {
        label: 'Goto File',
        command: commandPrefix + ':goto-file'
      }, {
        label: 'Copy File Name',
        command: commandPrefix + ':copy-file-name'
      }, {
        label: 'Copy Full Path',
        command: commandPrefix + ':copy-full-path'
      }, { type: 'separator' }])));

      this._subscriptions.add(atom.commands.add('.' + commandPrefix + '-file-entry', commandPrefix + ':goto-file', function (event) {
        var filePath = _this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }));

      this._subscriptions.add(atom.commands.add('.' + commandPrefix + '-file-entry', commandPrefix + ':copy-full-path', function (event) {
        atom.clipboard.write((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(_this._getFilePathFromEvent(event) || ''));
      }));
      this._subscriptions.add(atom.commands.add('.' + commandPrefix + '-file-entry', commandPrefix + ':copy-file-name', function (event) {
        atom.clipboard.write((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(_this._getFilePathFromEvent(event) || ''));
      }));
      this._subscriptions.add(atom.commands.add('.' + commandPrefix + '-file-entry', commandPrefix + ':add', function (event) {
        var filePath = _this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions || _load_nuclideHgRepositoryLibActions()).addPath)(filePath);
        }
      }));
      this._subscriptions.add(atom.commands.add('.' + commandPrefix + '-file-entry', commandPrefix + ':revert', function (event) {
        var filePath = _this._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions || _load_nuclideHgRepositoryLibActions()).revertPath)(filePath);
        }
      }));
    }
  }, {
    key: '_getFilePathFromEvent',
    value: function _getFilePathFromEvent(event) {
      var eventTarget = event.currentTarget;
      return eventTarget.getAttribute('data-path');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      if (this.props.fileChanges.size === 0) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          null,
          'No changes'
        );
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-ui-multi-root-file-tree-container' },
        Array.from(this.props.fileChanges.entries()).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var root = _ref2[0];
          var fileChanges = _ref2[1];
          return (_reactForAtom || _load_reactForAtom()).React.createElement((_ChangedFilesList || _load_ChangedFilesList()).default, {
            key: root,
            fileChanges: fileChanges,
            rootPath: root,
            commandPrefix: _this2.props.commandPrefix,
            selectedFile: _this2.props.selectedFile,
            hideEmptyFolders: _this2.props.hideEmptyFolders,
            shouldShowFolderName: _this2.props.fileChanges.size > 1,
            onFileChosen: _this2.props.onFileChosen
          });
        })
      );
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }]);

  return MultiRootChangedFilesView;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.MultiRootChangedFilesView = MultiRootChangedFilesView;