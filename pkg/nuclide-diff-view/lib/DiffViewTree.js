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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomFileTypeClass2;

function _commonsAtomFileTypeClass() {
  return _commonsAtomFileTypeClass2 = _interopRequireDefault(require('../../commons-atom/file-type-class'));
}

var _nuclideUiLibTreeRootComponent2;

function _nuclideUiLibTreeRootComponent() {
  return _nuclideUiLibTreeRootComponent2 = require('../../nuclide-ui/lib/TreeRootComponent');
}

var _DiffViewTreeNode2;

function _DiffViewTreeNode() {
  return _DiffViewTreeNode2 = _interopRequireDefault(require('./DiffViewTreeNode'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _commonsAtomUiTreePath2;

function _commonsAtomUiTreePath() {
  return _commonsAtomUiTreePath2 = _interopRequireDefault(require('../../commons-atom/ui-tree-path'));
}

var _nuclideRemoteUri4;

function _nuclideRemoteUri3() {
  return _nuclideRemoteUri4 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideHgRepositoryLibActions2;

function _nuclideHgRepositoryLibActions() {
  return _nuclideHgRepositoryLibActions2 = require('../../nuclide-hg-repository/lib/actions');
}

var REVERTABLE_STATUS_CODES = [(_constants2 || _constants()).FileChangeStatus.ADDED, (_constants2 || _constants()).FileChangeStatus.MODIFIED, (_constants2 || _constants()).FileChangeStatus.REMOVED];

function labelClassNameForNode(node) {
  var classArr = ['icon', 'name'];
  if (node.isContainer()) {
    classArr.push('icon-file-directory');
  } else if (node.getItem().statusCode) {
    classArr.push((0, (_commonsAtomFileTypeClass2 || _commonsAtomFileTypeClass()).default)(node.getLabel()));
  }
  return (0, (_classnames2 || _classnames()).default)(classArr);
}

function rowClassNameForNode(node) {
  var vcsClassName = vcsClassNameForEntry(node.getItem());
  return (0, (_classnames2 || _classnames()).default)(_defineProperty({}, vcsClassName, vcsClassName));
}

function vcsClassNameForEntry(entry) {
  var statusCodeDefined = entry.statusCode != null;
  var classObject = {
    'root': !statusCodeDefined,
    'file-change': statusCodeDefined
  };
  switch (entry.statusCode) {
    case (_constants2 || _constants()).FileChangeStatus.ADDED:
    case (_constants2 || _constants()).FileChangeStatus.UNTRACKED:
      classObject['status-added'] = true;
      break;
    case (_constants2 || _constants()).FileChangeStatus.MODIFIED:
      classObject['status-modified'] = true;
      break;
    case (_constants2 || _constants()).FileChangeStatus.REMOVED:
    case (_constants2 || _constants()).FileChangeStatus.MISSING:
      classObject['status-removed'] = true;
      break;
  }
  return (0, (_classnames2 || _classnames()).default)(classObject);
}

var DiffViewTree = (function (_React$Component) {
  _inherits(DiffViewTree, _React$Component);

  function DiffViewTree(props) {
    _classCallCheck(this, DiffViewTree);

    _get(Object.getPrototypeOf(DiffViewTree.prototype), 'constructor', this).call(this, props);
    this._onConfirmSelection = this._onConfirmSelection.bind(this);
  }

  _createClass(DiffViewTree, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return this.props.activeFilePath !== nextProps.activeFilePath || this.props.fileChanges !== nextProps.fileChanges;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
      this._subscriptions.add(atom.contextMenu.add({
        '.nuclide-diff-view-tree .entry.file-change': [{ type: 'separator' }, {
          label: 'Add to Mercurial',
          command: 'nuclide-diff-tree:add',
          shouldDisplay: function shouldDisplay(event) {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)({ currentTarget: event.target });
            var statusCode = _this.props.fileChanges.get(filePath);
            return statusCode === (_constants2 || _constants()).FileChangeStatus.UNTRACKED;
          }
        }, {
          label: 'Revert',
          command: 'nuclide-diff-tree:revert',
          shouldDisplay: function shouldDisplay(event) {
            // The context menu has the `currentTarget` set to `document`.
            // Hence, use `target` instead.
            var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)({ currentTarget: event.target });
            var statusCode = _this.props.fileChanges.get(filePath);
            return REVERTABLE_STATUS_CODES.indexOf(statusCode) !== -1;
          }
        }, {
          label: 'Goto File',
          command: 'nuclide-diff-tree:goto-file'
        }, {
          label: 'Copy File Name',
          command: 'nuclide-diff-tree:copy-file-name'
        }, {
          label: 'Copy Full Path',
          command: 'nuclide-diff-tree:copy-full-path'
        }, { type: 'separator' }]
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:goto-file', function (event) {
        var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-full-path', function (event) {
        var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
        atom.clipboard.write((_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.getPath(filePath || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-file-name', function (event) {
        var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
        atom.clipboard.write((_nuclideRemoteUri4 || _nuclideRemoteUri3()).default.getPath(filePath || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:add', function (event) {
        var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions2 || _nuclideHgRepositoryLibActions()).addPath)(filePath);
        }
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:revert', function (event) {
        var filePath = (0, (_commonsAtomUiTreePath2 || _commonsAtomUiTreePath()).default)(event);
        if (filePath != null && filePath.length) {
          (0, (_nuclideHgRepositoryLibActions2 || _nuclideHgRepositoryLibActions()).revertPath)(filePath);
        }
      }));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _this2 = this;

      var roots = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(atom.project.getDirectories().map(function (directory) {
        var rootPath = directory.getPath();
        var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(rootPath);
        if (!_this2.props.showNonHgRepos && (repository == null || repository.getType() !== 'hg')) {
          return null;
        }
        return new (_DiffViewTreeNode2 || _DiffViewTreeNode()).default({ filePath: rootPath }, null, /* null parent for roots */
        true, /* isContainer */
        _this2._rootChildrenFetcher.bind(_this2));
      }));
      /* root children fetcher */
      var treeRoot = this.refs.tree;
      var noOp = function noOp() {};
      var selectFileNode = function selectFileNode() {
        treeRoot.selectNodeKey(_this2.props.activeFilePath).then(noOp, noOp);
      };
      treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
    }

    // TODO(most): move async code out of the React component class.
  }, {
    key: '_rootChildrenFetcher',
    value: _asyncToGenerator(function* (rootNode) {
      var noChildrenFetcher = _asyncToGenerator(function* () {
        return (_immutable2 || _immutable()).default.List.of();
      });

      var _rootNode$getItem = rootNode.getItem();

      var rootPath = _rootNode$getItem.filePath;

      var childNodes = [];

      var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        var nodeName = (_constants2 || _constants()).NON_MERCURIAL_REPO_DISPLAY_NAME;
        childNodes.push(new (_DiffViewTreeNode2 || _DiffViewTreeNode()).default({ filePath: nodeName }, rootNode, false, noChildrenFetcher));
      } else {
        var _fileChanges = this.props.fileChanges;

        var filePaths = Array.from(_fileChanges.keys()).sort(function (filePath1, filePath2) {
          return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath1).toLowerCase().localeCompare((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath2).toLowerCase());
        });
        for (var filePath of filePaths) {
          if (filePath.startsWith(rootPath)) {
            var statusCode = _fileChanges.get(filePath);
            childNodes.push(new (_DiffViewTreeNode2 || _DiffViewTreeNode()).default({ filePath: filePath, statusCode: statusCode }, rootNode, false, noChildrenFetcher));
          }
        }
      }
      return (_immutable2 || _immutable()).default.List(childNodes);
    })
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibTreeRootComponent2 || _nuclideUiLibTreeRootComponent()).TreeRootComponent, {
        initialRoots: [],
        eventHandlerSelector: '.nuclide-diff-view-tree',
        onConfirmSelection: this._onConfirmSelection,
        labelClassNameForNode: labelClassNameForNode,
        rowClassNameForNode: rowClassNameForNode,
        elementToRenderWhenEmpty: (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          'No changes to show'
        ),
        onKeepSelection: function () {},
        ref: 'tree'
      });
    }
  }, {
    key: '_onConfirmSelection',
    value: function _onConfirmSelection(node) {
      var entry = node.getItem();
      if (!entry.statusCode || entry.filePath === this.props.activeFilePath) {
        return;
      }
      this.props.diffModel.diffEntity({ file: entry.filePath });
    }
  }]);

  return DiffViewTree;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DiffViewTree;
module.exports = exports.default;