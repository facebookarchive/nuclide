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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../commons-node/collection');
}

var _nuclideHgGitBridgeLibConstants2;

function _nuclideHgGitBridgeLibConstants() {
  return _nuclideHgGitBridgeLibConstants2 = require('../nuclide-hg-git-bridge/lib/constants');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideHgRepositoryLibActions2;

function _nuclideHgRepositoryLibActions() {
  return _nuclideHgRepositoryLibActions2 = require('../nuclide-hg-repository/lib/actions');
}

var ChangedFilesView = (function (_React$Component) {
  _inherits(ChangedFilesView, _React$Component);

  function ChangedFilesView(props) {
    _classCallCheck(this, ChangedFilesView);

    _get(Object.getPrototypeOf(ChangedFilesView.prototype), 'constructor', this).call(this, props);
    this.state = {
      isCollapsed: false
    };
  }

  _createClass(ChangedFilesView, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return (0, (_commonsNodeCollection2 || _commonsNodeCollection()).mapEqual)(this.props.fileChanges, nextProps.fileChanges);
    }
  }, {
    key: '_getFileClassname',
    value: function _getFileClassname(file, fileChangeValue) {
      var selectedFile = this.props.selectedFile;

      return (0, (_classnames2 || _classnames()).default)('list-item', {
        selected: file === selectedFile
      }, (_nuclideHgGitBridgeLibConstants2 || _nuclideHgGitBridgeLibConstants()).FileChangeStatusToTextColor[fileChangeValue]);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var fileChanges = this.props.fileChanges;

      if (fileChanges.size === 0 && this.props.hideEmptyFolders) {
        return null;
      }

      var rootClassName = (0, (_classnames2 || _classnames()).default)('list-nested-item', {
        collapsed: this.state.isCollapsed
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'ul',
        { className: 'list-tree has-collapsable-children' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'li',
          { className: rootClassName },
          this.props.shouldShowFolderName ? (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            {
              className: 'list-item',
              key: this.props.rootPath,
              onClick: function () {
                return _this.setState({ isCollapsed: !_this.state.isCollapsed });
              } },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              {
                className: 'icon icon-file-directory nuclide-file-changes-root-entry',
                'data-path': this.props.rootPath },
              (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(this.props.rootPath)
            )
          ) : null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'ul',
            { className: 'list-tree has-flat-children' },
            Array.from(fileChanges.entries()).map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2);

              var filePath = _ref2[0];
              var fileChangeValue = _ref2[1];
              return (_reactForAtom2 || _reactForAtom()).React.createElement(
                'li',
                {
                  'data-path': filePath,
                  className: _this._getFileClassname(filePath, fileChangeValue),
                  key: filePath,
                  onClick: function () {
                    return _this.props.onFileChosen(filePath);
                  } },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'span',
                  {
                    className: 'icon icon-file-text nuclide-file-changes-file-entry',
                    'data-path': filePath,
                    'data-root': _this.props.rootPath },
                  (_nuclideHgGitBridgeLibConstants2 || _nuclideHgGitBridgeLibConstants()).FileChangeStatusToPrefix[fileChangeValue],
                  (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath)
                )
              );
            })
          )
        )
      );
    }
  }]);

  return ChangedFilesView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

var MultiRootChangedFilesView = (function (_React$Component2) {
  _inherits(MultiRootChangedFilesView, _React$Component2);

  function MultiRootChangedFilesView() {
    _classCallCheck(this, MultiRootChangedFilesView);

    _get(Object.getPrototypeOf(MultiRootChangedFilesView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MultiRootChangedFilesView, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default();
      var commandPrefix = this.props.commandPrefix;

      this._subscriptions.add(atom.contextMenu.add({
        '.nuclide-file-changes-file-entry': [{ type: 'separator' }, {
          label: 'Add to Mercurial',
          command: commandPrefix + ':add',
          shouldDisplay: function shouldDisplay(event) {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            var filePath = event.target.getAttribute('data-path');
            var rootPath = event.target.getAttribute('data-root');
            // $FlowFixMe
            var statusCode = _this2.props.fileChanges.get(rootPath).get(filePath);
            return statusCode === (_nuclideHgGitBridgeLibConstants2 || _nuclideHgGitBridgeLibConstants()).FileChangeStatus.UNTRACKED;
          }
        }, {
          label: 'Revert',
          command: commandPrefix + ':revert',
          shouldDisplay: function shouldDisplay(event) {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            var filePath = event.target.getAttribute('data-path');
            var rootPath = event.target.getAttribute('data-root');
            // $FlowFixMe
            var statusCode = _this2.props.fileChanges.get(rootPath).get(filePath);
            if (statusCode == null) {
              return false;
            }
            return (_nuclideHgGitBridgeLibConstants2 || _nuclideHgGitBridgeLibConstants()).RevertibleStatusCodes.includes(statusCode);
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
        }, { type: 'separator' }]
      }));

      this._subscriptions.add(atom.commands.add('.nuclide-file-changes-file-entry', commandPrefix + ':goto-file', function (event) {
        var filePath = _this2._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }));

      this._subscriptions.add(atom.commands.add('.nuclide-file-changes-file-entry', commandPrefix + ':copy-full-path', function (event) {
        atom.clipboard.write((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(_this2._getFilePathFromEvent(event) || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-file-changes-file-entry', commandPrefix + ':copy-file-name', function (event) {
        atom.clipboard.write((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(_this2._getFilePathFromEvent(event) || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-file-changes-file-entry', commandPrefix + ':add', function (event) {
        var filePath = _this2._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions2 || _nuclideHgRepositoryLibActions()).addPath)(filePath);
        }
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-file-changes-file-entry', commandPrefix + ':revert', function (event) {
        var filePath = _this2._getFilePathFromEvent(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions2 || _nuclideHgRepositoryLibActions()).revertPath)(filePath);
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
      var _this3 = this;

      if (this.props.fileChanges.size === 0) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          'No changes'
        );
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        Array.from(this.props.fileChanges.entries()).map(function (_ref3) {
          var _ref32 = _slicedToArray(_ref3, 2);

          var root = _ref32[0];
          var fileChanges = _ref32[1];
          return (_reactForAtom2 || _reactForAtom()).React.createElement(ChangedFilesView, {
            key: root,
            fileChanges: fileChanges,
            rootPath: root,
            selectedFile: _this3.props.selectedFile,
            hideEmptyFolders: _this3.props.hideEmptyFolders,
            shouldShowFolderName: _this3.props.fileChanges.size > 1,
            onFileChosen: _this3.props.onFileChosen
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.MultiRootChangedFilesView = MultiRootChangedFilesView;