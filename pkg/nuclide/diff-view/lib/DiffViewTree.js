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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _atomHelpers = require('../../atom-helpers');

var _uiTree = require('../../ui/tree');

var _DiffViewTreeNode = require('./DiffViewTreeNode');

var _DiffViewTreeNode2 = _interopRequireDefault(_DiffViewTreeNode);

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _constants = require('./constants');

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _utils = require('./utils');

function labelClassNameForNode(node) {
  var classObj = {
    'icon': true,
    'name': true
  };

  if (node.isContainer()) {
    classObj['icon-file-directory'] = true;
  } else if (node.getItem().statusCode) {
    classObj[(0, _atomHelpers.fileTypeClass)(node.getLabel())] = true;
  }
  return (0, _classnames3['default'])(classObj);
}

function rowClassNameForNode(node) {
  var vcsClassName = vcsClassNameForEntry(node.getItem());
  return (0, _classnames3['default'])(_defineProperty({}, vcsClassName, vcsClassName));
}

function vcsClassNameForEntry(entry) {
  var statusCodeDefined = entry.statusCode != null;
  var classObject = {
    'root': !statusCodeDefined,
    'file-change': statusCodeDefined
  };
  switch (entry.statusCode) {
    case _constants.FileChangeStatus.ADDED:
    case _constants.FileChangeStatus.UNTRACKED:
      classObject['status-added'] = true;
      break;
    case _constants.FileChangeStatus.MODIFIED:
      classObject['status-modified'] = true;
      break;
    case _constants.FileChangeStatus.REMOVED:
    case _constants.FileChangeStatus.MISSING:
      classObject['status-removed'] = true;
      break;
  }
  return (0, _classnames3['default'])(classObject);
}

/* eslint-disable react/prop-types */

var DiffViewTree = (function (_React$Component) {
  _inherits(DiffViewTree, _React$Component);

  function DiffViewTree(props) {
    _classCallCheck(this, DiffViewTree);

    _get(Object.getPrototypeOf(DiffViewTree.prototype), 'constructor', this).call(this, props);
    this._onConfirmSelection = this._onConfirmSelection.bind(this);
    var diffModel = props.diffModel;

    var _diffModel$getActiveFileState = diffModel.getActiveFileState();

    var filePath = _diffModel$getActiveFileState.filePath;

    this.state = {
      fileChanges: diffModel.getCompareFileChanges(),
      selectedFilePath: filePath
    };
  }

  _createClass(DiffViewTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var diffModel = this.props.diffModel;

      var subscriptions = this._subscriptions = new _atom.CompositeDisposable();
      subscriptions.add(diffModel.onDidChangeCompareStatus(function (fileChanges) {
        _this.setState({ fileChanges: fileChanges, selectedFilePath: _this.state.selectedFilePath });
      }));
      subscriptions.add(diffModel.onActiveFileUpdates(function (fileState) {
        var filePath = fileState.filePath;

        if (filePath !== _this.state.selectedFilePath) {
          _this.setState({ selectedFilePath: filePath, fileChanges: _this.state.fileChanges });
        }
      }));
      subscriptions.add(atom.contextMenu.add({
        '.nuclide-diff-view-tree .entry.file-change': [{ type: 'separator' }, {
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
      subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:goto-file', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }));
      subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-full-path', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        atom.clipboard.write((0, _remoteUri.getPath)(filePath || ''));
      }));
      subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-file-name', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        atom.clipboard.write((0, _remoteUri.basename)(filePath || ''));
      }));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _this2 = this;

      var roots = atom.project.getDirectories().map(function (directory) {
        return new _DiffViewTreeNode2['default']({ filePath: directory.getPath() }, null, /* null parent for roots */
        true, /* isContainer */
        _this2._rootChildrenFetcher.bind(_this2));
      });
      /* root children fetcher */
      var treeRoot = this.refs['tree'];
      var noOp = function noOp() {};
      var selectFileNode = function selectFileNode() {
        treeRoot.selectNodeKey(_this2.state.selectedFilePath).then(noOp, noOp);
      };
      treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
    }
  }, {
    key: '_rootChildrenFetcher',
    value: _asyncToGenerator(function* (rootNode) {
      var noChildrenFetcher = _asyncToGenerator(function* () {
        return _immutable2['default'].List.of();
      });

      var _rootNode$getItem = rootNode.getItem();

      var rootPath = _rootNode$getItem.filePath;

      var childNodes = [];

      var _require = require('../../hg-git-bridge');

      var repositoryForPath = _require.repositoryForPath;

      var repository = repositoryForPath(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        var nodeName = '[X] Non-Mercurial Repository';
        childNodes.push(new _DiffViewTreeNode2['default']({ filePath: nodeName }, rootNode, false, noChildrenFetcher));
      } else {
        var _fileChanges = this.state.fileChanges;

        var filePaths = _commons.array.from(_fileChanges.keys()).sort(function (filePath1, filePath2) {
          return _remoteUri2['default'].basename(filePath1).toLowerCase().localeCompare(_remoteUri2['default'].basename(filePath2).toLowerCase());
        });
        for (var filePath of filePaths) {
          if (filePath.startsWith(rootPath)) {
            var statusCode = _fileChanges.get(filePath);
            childNodes.push(new _DiffViewTreeNode2['default']({ filePath: filePath, statusCode: statusCode }, rootNode, false, noChildrenFetcher));
          }
        }
      }
      return _immutable2['default'].List(childNodes);
    })
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(_uiTree.TreeRootComponent, {
        initialRoots: [],
        eventHandlerSelector: '.nuclide-diff-view-tree',
        onConfirmSelection: this._onConfirmSelection,
        labelClassNameForNode: labelClassNameForNode,
        rowClassNameForNode: rowClassNameForNode,
        elementToRenderWhenEmpty: _reactForAtom.React.createElement(
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
      if (!entry.statusCode || entry.filePath === this.state.selectedFilePath) {
        return;
      }
      this.props.diffModel.activateFile(entry.filePath);
    }
  }]);

  return DiffViewTree;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewTree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFnQjRCLG9CQUFvQjs7c0JBQ2hCLGVBQWU7O2dDQUNsQixvQkFBb0I7Ozs7eUJBQzNCLGtCQUFrQjs7Ozt5QkFDbEIsV0FBVzs7Ozt5QkFDRixhQUFhOztvQkFDVixNQUFNOzs0QkFDcEIsZ0JBQWdCOzt1QkFFaEIsZUFBZTs7MkJBQ1osWUFBWTs7OztxQkFDVSxTQUFTOztBQUd0RCxTQUFTLHFCQUFxQixDQUFDLElBQWtCLEVBQVU7QUFDekQsTUFBTSxRQUFRLEdBQUc7QUFDZixVQUFNLEVBQUUsSUFBSTtBQUNaLFVBQU0sRUFBRSxJQUFJO0dBQ2IsQ0FBQzs7QUFFRixNQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN0QixZQUFRLHVCQUF1QixHQUFHLElBQUksQ0FBQztHQUN4QyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRTtBQUNwQyxZQUFRLENBQUMsZ0NBQWMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7R0FDakQ7QUFDRCxTQUFPLDZCQUFXLFFBQVEsQ0FBQyxDQUFDO0NBQzdCOztBQUVELFNBQVMsbUJBQW1CLENBQUMsSUFBa0IsRUFBRTtBQUMvQyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMxRCxTQUFPLGlEQUNKLFlBQVksRUFBRyxZQUFZLEVBQzVCLENBQUM7Q0FDSjs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLEtBQWlCLEVBQVU7QUFDdkQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztBQUNuRCxNQUFNLFdBQW1CLEdBQUc7QUFDMUIsVUFBTSxFQUFFLENBQUMsaUJBQWlCO0FBQzFCLGlCQUFhLEVBQUUsaUJBQWlCO0dBQ2pDLENBQUM7QUFDRixVQUFRLEtBQUssQ0FBQyxVQUFVO0FBQ3RCLFNBQUssNEJBQWlCLEtBQUssQ0FBQztBQUM1QixTQUFLLDRCQUFpQixTQUFTO0FBQzdCLGlCQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFlBQU07QUFBQSxBQUNSLFNBQUssNEJBQWlCLFFBQVE7QUFDNUIsaUJBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN0QyxZQUFNO0FBQUEsQUFDUixTQUFLLDRCQUFpQixPQUFPLENBQUM7QUFDOUIsU0FBSyw0QkFBaUIsT0FBTztBQUMzQixpQkFBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFlBQU07QUFBQSxHQUNUO0FBQ0QsU0FBTyw2QkFBVyxXQUFXLENBQUMsQ0FBQztDQUNoQzs7OztJQU9vQixZQUFZO1lBQVosWUFBWTs7QUFTcEIsV0FUUSxZQUFZLENBU25CLEtBQVksRUFBRTswQkFUUCxZQUFZOztBQVU3QiwrQkFWaUIsWUFBWSw2Q0FVdkIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvRCxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOzt3Q0FDRyxTQUFTLENBQUMsa0JBQWtCLEVBQUU7O1FBQTFDLFFBQVEsaUNBQVIsUUFBUTs7QUFDZixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsaUJBQVcsRUFBRSxTQUFTLENBQUMscUJBQXFCLEVBQUU7QUFDOUMsc0JBQWdCLEVBQUUsUUFBUTtLQUMzQixDQUFDO0dBQ0g7O2VBbEJrQixZQUFZOztXQW9CZCw2QkFBUzs7O1VBQ2pCLFNBQVMsR0FBSSxJQUFJLENBQUMsS0FBSyxDQUF2QixTQUFTOztBQUNoQixVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ3RFLG1CQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNsRSxjQUFLLFFBQVEsQ0FBQyxFQUFDLFdBQVcsRUFBWCxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsTUFBSyxLQUFLLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO09BQzdFLENBQUMsQ0FBQyxDQUFDO0FBQ0osbUJBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLFVBQUMsU0FBUyxFQUFzQjtZQUN2RSxRQUFRLEdBQUksU0FBUyxDQUFyQixRQUFROztBQUNmLFlBQUksUUFBUSxLQUFLLE1BQUssS0FBSyxDQUFDLGdCQUFnQixFQUFFO0FBQzVDLGdCQUFLLFFBQVEsQ0FBQyxFQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBSyxLQUFLLENBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQztTQUNsRjtPQUNGLENBQUMsQ0FBQyxDQUFDO0FBQ0osbUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7QUFDckMsb0RBQTRDLEVBQUUsQ0FDNUMsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLEVBQ25CO0FBQ0UsZUFBSyxFQUFFLFdBQVc7QUFDbEIsaUJBQU8sRUFBRSw2QkFBNkI7U0FDdkMsRUFDRDtBQUNFLGVBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQU8sRUFBRSxrQ0FBa0M7U0FDNUMsRUFDRDtBQUNFLGVBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQU8sRUFBRSxrQ0FBa0M7U0FDNUMsRUFDRCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FDcEI7T0FDRixDQUFDLENBQUMsQ0FBQztBQUNKLG1CQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQyw0Q0FBNEMsRUFDNUMsNkJBQTZCLEVBQzdCLFVBQUEsS0FBSyxFQUFJO0FBQ1AsWUFBTSxRQUFRLEdBQUcsMkNBQStCLEtBQUssQ0FBQyxDQUFDO0FBQ3ZELFlBQUksUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3ZDLGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO09BQ0YsQ0FDRixDQUFDLENBQUM7QUFDSCxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsNENBQTRDLEVBQzVDLGtDQUFrQyxFQUNsQyxVQUFBLEtBQUssRUFBSTtBQUNQLFlBQU0sUUFBUSxHQUFHLDJDQUErQixLQUFLLENBQUMsQ0FBQztBQUN2RCxZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx3QkFBUSxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztPQUMvQyxDQUNGLENBQUMsQ0FBQztBQUNILG1CQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNqQyw0Q0FBNEMsRUFDNUMsa0NBQWtDLEVBQ2xDLFVBQUEsS0FBSyxFQUFJO0FBQ1AsWUFBTSxRQUFRLEdBQUcsMkNBQStCLEtBQUssQ0FBQyxDQUFDO0FBQ3ZELFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHlCQUFTLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ2hELENBQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQiw4QkFBUzs7O0FBQ3pCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQzNELGVBQU8sa0NBQ0wsRUFBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLEVBQy9CLElBQUk7QUFDSixZQUFJO0FBQ0osZUFBSyxvQkFBb0IsQ0FBQyxJQUFJLFFBQU0sQ0FDckMsQ0FBQztPQUNILENBQUMsQ0FBQzs7QUFDSCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25DLFVBQU0sSUFBSSxHQUFHLFNBQVAsSUFBSSxHQUFTLEVBQUUsQ0FBQztBQUN0QixVQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDM0IsZ0JBQVEsQ0FBQyxhQUFhLENBQUMsT0FBSyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3RFLENBQUM7QUFDRixjQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDL0Q7Ozs2QkFFeUIsV0FBQyxRQUFzQixFQUF5QztBQUN4RixVQUFNLGlCQUFpQixxQkFBRztlQUFZLHVCQUFVLElBQUksQ0FBQyxFQUFFLEVBQUU7T0FBQSxDQUFBLENBQUM7OzhCQUM3QixRQUFRLENBQUMsT0FBTyxFQUFFOztVQUE5QixRQUFRLHFCQUFsQixRQUFROztBQUNmLFVBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQzs7cUJBQ00sT0FBTyxDQUFDLHFCQUFxQixDQUFDOztVQUFuRCxpQkFBaUIsWUFBakIsaUJBQWlCOztBQUN4QixVQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxVQUFJLFVBQVUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtBQUN2RCxZQUFNLFFBQVEsaUNBQWlDLENBQUM7QUFDaEQsa0JBQVUsQ0FBQyxJQUFJLENBQ2Isa0NBQXFCLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FDL0UsQ0FBQztPQUNILE1BQU07WUFDRSxZQUFXLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBekIsV0FBVzs7QUFDbEIsWUFBTSxTQUFTLEdBQUcsZUFBTSxJQUFJLENBQUMsWUFBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQzdDLElBQUksQ0FBQyxVQUFDLFNBQVMsRUFBRSxTQUFTO2lCQUN6Qix1QkFBVSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsYUFBYSxDQUN2RCx1QkFBVSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQzVDO1NBQUEsQ0FDRixDQUFDO0FBQ0osYUFBSyxJQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7QUFDaEMsY0FBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2pDLGdCQUFNLFVBQVUsR0FBRyxZQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLHNCQUFVLENBQUMsSUFBSSxDQUNiLGtDQUFxQixFQUFDLFFBQVEsRUFBUixRQUFRLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FDakYsQ0FBQztXQUNIO1NBQ0Y7T0FDRjtBQUNELGFBQU8sdUJBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7T0FDNUI7S0FDRjs7O1dBRUssa0JBQUc7QUFDUCxhQUNFO0FBQ0Usb0JBQVksRUFBRSxFQUFFLEFBQUM7QUFDakIsNEJBQW9CLEVBQUMseUJBQXlCO0FBQzlDLDBCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQUFBQztBQUM3Qyw2QkFBcUIsRUFBRSxxQkFBcUIsQUFBQztBQUM3QywyQkFBbUIsRUFBRSxtQkFBbUIsQUFBQztBQUN6QyxnQ0FBd0IsRUFBRTs7OztTQUE2QixBQUFDO0FBQ3hELHVCQUFlLEVBQUUsWUFBTSxFQUFFLEFBQUM7QUFDMUIsV0FBRyxFQUFDLE1BQU07UUFDVixDQUNGO0tBQ0g7OztXQUVrQiw2QkFBQyxJQUFrQixFQUFRO0FBQzVDLFVBQU0sS0FBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZFLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkQ7OztTQTFKa0IsWUFBWTtHQUFTLG9CQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6IkRpZmZWaWV3VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIExhenlUcmVlTm9kZSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlLCBGaWxlQ2hhbmdlU3RhdGUsIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7ZmlsZVR5cGVDbGFzc30gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7VHJlZVJvb3RDb21wb25lbnR9IGZyb20gJy4uLy4uL3VpL3RyZWUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZU5vZGUgZnJvbSAnLi9EaWZmVmlld1RyZWVOb2RlJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0ZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldFBhdGgsIGJhc2VuYW1lfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuZnVuY3Rpb24gbGFiZWxDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IGNsYXNzT2JqID0ge1xuICAgICdpY29uJzogdHJ1ZSxcbiAgICAnbmFtZSc6IHRydWUsXG4gIH07XG5cbiAgaWYgKG5vZGUuaXNDb250YWluZXIoKSkge1xuICAgIGNsYXNzT2JqW2BpY29uLWZpbGUtZGlyZWN0b3J5YF0gPSB0cnVlO1xuICB9IGVsc2UgaWYgKG5vZGUuZ2V0SXRlbSgpLnN0YXR1c0NvZGUpIHtcbiAgICBjbGFzc09ialtmaWxlVHlwZUNsYXNzKG5vZGUuZ2V0TGFiZWwoKSldID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gY2xhc3NuYW1lcyhjbGFzc09iaik7XG59XG5cbmZ1bmN0aW9uIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKSB7XG4gIGNvbnN0IHZjc0NsYXNzTmFtZSA9IHZjc0NsYXNzTmFtZUZvckVudHJ5KG5vZGUuZ2V0SXRlbSgpKTtcbiAgcmV0dXJuIGNsYXNzbmFtZXMoe1xuICAgIFt2Y3NDbGFzc05hbWVdOiB2Y3NDbGFzc05hbWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2Y3NDbGFzc05hbWVGb3JFbnRyeShlbnRyeTogRmlsZUNoYW5nZSk6IHN0cmluZyB7XG4gIGNvbnN0IHN0YXR1c0NvZGVEZWZpbmVkID0gZW50cnkuc3RhdHVzQ29kZSAhPSBudWxsO1xuICBjb25zdCBjbGFzc09iamVjdDogT2JqZWN0ID0ge1xuICAgICdyb290JzogIXN0YXR1c0NvZGVEZWZpbmVkLFxuICAgICdmaWxlLWNoYW5nZSc6IHN0YXR1c0NvZGVEZWZpbmVkLFxuICB9O1xuICBzd2l0Y2ggKGVudHJ5LnN0YXR1c0NvZGUpIHtcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuQURERUQ6XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRDpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtYWRkZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQ6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLW1vZGlmaWVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLlJFTU9WRUQ6XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLk1JU1NJTkc6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLXJlbW92ZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gY2xhc3NuYW1lcyhjbGFzc09iamVjdCk7XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3VHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGU6IHtcbiAgICBmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gICAgc2VsZWN0ZWRGaWxlUGF0aDogc3RyaW5nO1xuICB9O1xuXG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ29uZmlybVNlbGVjdGlvbiA9IHRoaXMuX29uQ29uZmlybVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gcHJvcHM7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZmlsZUNoYW5nZXM6IGRpZmZNb2RlbC5nZXRDb21wYXJlRmlsZUNoYW5nZXMoKSxcbiAgICAgIHNlbGVjdGVkRmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoZmlsZUNoYW5nZXMgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZUNoYW5nZXMsIHNlbGVjdGVkRmlsZVBhdGg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aH0pO1xuICAgIH0pKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcygoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHtcbiAgICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBmaWxlU3RhdGU7XG4gICAgICBpZiAoZmlsZVBhdGggIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEZpbGVQYXRoOiBmaWxlUGF0aCwgZmlsZUNoYW5nZXM6IHRoaXMuc3RhdGUuZmlsZUNoYW5nZXN9KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR290byBGaWxlJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Z290by1maWxlJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29weSBGaWxlIE5hbWUnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZpbGUtbmFtZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0NvcHkgRnVsbCBQYXRoJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpnb3RvLWZpbGUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAhPSBudWxsICYmIGZpbGVQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoZ2V0UGF0aChmaWxlUGF0aCB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1maWxlLW5hbWUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGJhc2VuYW1lKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGlmZlZpZXdUcmVlTm9kZShcbiAgICAgICAge2ZpbGVQYXRoOiBkaXJlY3RvcnkuZ2V0UGF0aCgpfSxcbiAgICAgICAgbnVsbCwgLyogbnVsbCBwYXJlbnQgZm9yIHJvb3RzICovXG4gICAgICAgIHRydWUsIC8qIGlzQ29udGFpbmVyICovXG4gICAgICAgIHRoaXMuX3Jvb3RDaGlsZHJlbkZldGNoZXIuYmluZCh0aGlzKSwgLyogcm9vdCBjaGlsZHJlbiBmZXRjaGVyICovXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnN0IHRyZWVSb290ID0gdGhpcy5yZWZzWyd0cmVlJ107XG4gICAgY29uc3Qgbm9PcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHNlbGVjdEZpbGVOb2RlID0gKCkgPT4ge1xuICAgICAgdHJlZVJvb3Quc2VsZWN0Tm9kZUtleSh0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZVBhdGgpLnRoZW4obm9PcCwgbm9PcCk7XG4gICAgfTtcbiAgICB0cmVlUm9vdC5zZXRSb290cyhyb290cykudGhlbihzZWxlY3RGaWxlTm9kZSwgc2VsZWN0RmlsZU5vZGUpO1xuICB9XG5cbiAgYXN5bmMgX3Jvb3RDaGlsZHJlbkZldGNoZXIocm9vdE5vZGU6IExhenlUcmVlTm9kZSk6IFByb21pc2U8SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPj4ge1xuICAgIGNvbnN0IG5vQ2hpbGRyZW5GZXRjaGVyID0gYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IHJvb3RQYXRofSA9IHJvb3ROb2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gW107XG4gICAgY29uc3Qge3JlcG9zaXRvcnlGb3JQYXRofSA9IHJlcXVpcmUoJy4uLy4uL2hnLWdpdC1icmlkZ2UnKTtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdFBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IG5vZGVOYW1lID0gYFtYXSBOb24tTWVyY3VyaWFsIFJlcG9zaXRvcnlgO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGg6IG5vZGVOYW1lfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtmaWxlQ2hhbmdlc30gPSB0aGlzLnN0YXRlO1xuICAgICAgY29uc3QgZmlsZVBhdGhzID0gYXJyYXkuZnJvbShmaWxlQ2hhbmdlcy5rZXlzKCkpXG4gICAgICAgIC5zb3J0KChmaWxlUGF0aDEsIGZpbGVQYXRoMikgPT5cbiAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgxKS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgyKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgocm9vdFBhdGgpKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IGZpbGVDaGFuZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IERpZmZWaWV3VHJlZU5vZGUoe2ZpbGVQYXRoLCBzdGF0dXNDb2RlfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJbW11dGFibGUuTGlzdChjaGlsZE5vZGVzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFRyZWVSb290Q29tcG9uZW50XG4gICAgICAgIGluaXRpYWxSb290cz17W119XG4gICAgICAgIGV2ZW50SGFuZGxlclNlbGVjdG9yPVwiLm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIlxuICAgICAgICBvbkNvbmZpcm1TZWxlY3Rpb249e3RoaXMuX29uQ29uZmlybVNlbGVjdGlvbn1cbiAgICAgICAgbGFiZWxDbGFzc05hbWVGb3JOb2RlPXtsYWJlbENsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgIHJvd0NsYXNzTmFtZUZvck5vZGU9e3Jvd0NsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgIGVsZW1lbnRUb1JlbmRlcldoZW5FbXB0eT17PGRpdj5ObyBjaGFuZ2VzIHRvIHNob3c8L2Rpdj59XG4gICAgICAgIG9uS2VlcFNlbGVjdGlvbj17KCkgPT4ge319XG4gICAgICAgIHJlZj1cInRyZWVcIlxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgX29uQ29uZmlybVNlbGVjdGlvbihub2RlOiBMYXp5VHJlZU5vZGUpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyeTogRmlsZUNoYW5nZSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGlmICghZW50cnkuc3RhdHVzQ29kZSB8fCBlbnRyeS5maWxlUGF0aCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmFjdGl2YXRlRmlsZShlbnRyeS5maWxlUGF0aCk7XG4gIH1cbn1cbiJdfQ==