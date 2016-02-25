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
    this._boundOnConfirmSelection = this._onConfirmSelection.bind(this);
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
        onConfirmSelection: this._boundOnConfirmSelection,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZWaWV3VHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFnQjRCLG9CQUFvQjs7c0JBQ2hCLGVBQWU7O2dDQUNsQixvQkFBb0I7Ozs7eUJBQzNCLGtCQUFrQjs7Ozt5QkFDbEIsV0FBVzs7Ozt5QkFDRixhQUFhOztvQkFDVixNQUFNOzs0QkFDcEIsZ0JBQWdCOzt1QkFFaEIsZUFBZTs7MkJBQ1osWUFBWTs7OztxQkFDVSxTQUFTOztBQUd0RCxTQUFTLHFCQUFxQixDQUFDLElBQWtCLEVBQVU7QUFDekQsTUFBTSxRQUFRLEdBQUc7QUFDZixVQUFNLEVBQUUsSUFBSTtBQUNaLFVBQU0sRUFBRSxJQUFJO0dBQ2IsQ0FBQzs7QUFFRixNQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN0QixZQUFRLHVCQUF1QixHQUFHLElBQUksQ0FBQztHQUN4QyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRTtBQUNwQyxZQUFRLENBQUMsZ0NBQWMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7R0FDakQ7QUFDRCxTQUFPLDZCQUFXLFFBQVEsQ0FBQyxDQUFDO0NBQzdCOztBQUVELFNBQVMsbUJBQW1CLENBQUMsSUFBa0IsRUFBRTtBQUMvQyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMxRCxTQUFPLGlEQUNKLFlBQVksRUFBRyxZQUFZLEVBQzVCLENBQUM7Q0FDSjs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLEtBQWlCLEVBQVU7QUFDdkQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztBQUNuRCxNQUFNLFdBQW1CLEdBQUc7QUFDMUIsVUFBTSxFQUFFLENBQUMsaUJBQWlCO0FBQzFCLGlCQUFhLEVBQUUsaUJBQWlCO0dBQ2pDLENBQUM7QUFDRixVQUFRLEtBQUssQ0FBQyxVQUFVO0FBQ3RCLFNBQUssNEJBQWlCLEtBQUssQ0FBQztBQUM1QixTQUFLLDRCQUFpQixTQUFTO0FBQzdCLGlCQUFXLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFlBQU07QUFBQSxBQUNSLFNBQUssNEJBQWlCLFFBQVE7QUFDNUIsaUJBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN0QyxZQUFNO0FBQUEsQUFDUixTQUFLLDRCQUFpQixPQUFPLENBQUM7QUFDOUIsU0FBSyw0QkFBaUIsT0FBTztBQUMzQixpQkFBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFlBQU07QUFBQSxHQUNUO0FBQ0QsU0FBTyw2QkFBVyxXQUFXLENBQUMsQ0FBQztDQUNoQzs7OztJQU9vQixZQUFZO1lBQVosWUFBWTs7QUFVcEIsV0FWUSxZQUFZLENBVW5CLEtBQVksRUFBRTswQkFWUCxZQUFZOztBQVc3QiwrQkFYaUIsWUFBWSw2Q0FXdkIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7d0NBQ0csU0FBUyxDQUFDLGtCQUFrQixFQUFFOztRQUExQyxRQUFRLGlDQUFSLFFBQVE7O0FBQ2YsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGlCQUFXLEVBQUUsU0FBUyxDQUFDLHFCQUFxQixFQUFFO0FBQzlDLHNCQUFnQixFQUFFLFFBQVE7S0FDM0IsQ0FBQztHQUNIOztlQW5Ca0IsWUFBWTs7V0FxQmQsNkJBQVM7OztVQUNqQixTQUFTLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBdkIsU0FBUzs7QUFDaEIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUN0RSxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDbEUsY0FBSyxRQUFRLENBQUMsRUFBQyxXQUFXLEVBQVgsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE1BQUssS0FBSyxDQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQztPQUM3RSxDQUFDLENBQUMsQ0FBQztBQUNKLG1CQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFDLFNBQVMsRUFBc0I7WUFDdkUsUUFBUSxHQUFJLFNBQVMsQ0FBckIsUUFBUTs7QUFDZixZQUFJLFFBQVEsS0FBSyxNQUFLLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1QyxnQkFBSyxRQUFRLENBQUMsRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQUssS0FBSyxDQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7U0FDbEY7T0FDRixDQUFDLENBQUMsQ0FBQztBQUNKLG1CQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQ3JDLG9EQUE0QyxFQUFFLENBQzVDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxFQUNuQjtBQUNFLGVBQUssRUFBRSxXQUFXO0FBQ2xCLGlCQUFPLEVBQUUsNkJBQTZCO1NBQ3ZDLEVBQ0Q7QUFDRSxlQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFPLEVBQUUsa0NBQWtDO1NBQzVDLEVBQ0Q7QUFDRSxlQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFPLEVBQUUsa0NBQWtDO1NBQzVDLEVBQ0QsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLENBQ3BCO09BQ0YsQ0FBQyxDQUFDLENBQUM7QUFDSixtQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsNENBQTRDLEVBQzVDLDZCQUE2QixFQUM3QixVQUFBLEtBQUssRUFBSTtBQUNQLFlBQU0sUUFBUSxHQUFHLDJDQUErQixLQUFLLENBQUMsQ0FBQztBQUN2RCxZQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN2QyxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtPQUNGLENBQ0YsQ0FBQyxDQUFDO0FBQ0gsbUJBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2pDLDRDQUE0QyxFQUM1QyxrQ0FBa0MsRUFDbEMsVUFBQSxLQUFLLEVBQUk7QUFDUCxZQUFNLFFBQVEsR0FBRywyQ0FBK0IsS0FBSyxDQUFDLENBQUM7QUFDdkQsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsd0JBQVEsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDL0MsQ0FDRixDQUFDLENBQUM7QUFDSCxtQkFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDakMsNENBQTRDLEVBQzVDLGtDQUFrQyxFQUNsQyxVQUFBLEtBQUssRUFBSTtBQUNQLFlBQU0sUUFBUSxHQUFHLDJDQUErQixLQUFLLENBQUMsQ0FBQztBQUN2RCxZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx5QkFBUyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztPQUNoRCxDQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFaUIsOEJBQVM7OztBQUN6QixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUMzRCxlQUFPLGtDQUNMLEVBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxFQUMvQixJQUFJO0FBQ0osWUFBSTtBQUNKLGVBQUssb0JBQW9CLENBQUMsSUFBSSxRQUFNLENBQ3JDLENBQUM7T0FDSCxDQUFDLENBQUM7O0FBQ0gsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxVQUFNLElBQUksR0FBRyxTQUFQLElBQUksR0FBUyxFQUFFLENBQUM7QUFDdEIsVUFBTSxjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQzNCLGdCQUFRLENBQUMsYUFBYSxDQUFDLE9BQUssS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN0RSxDQUFDO0FBQ0YsY0FBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQy9EOzs7NkJBRXlCLFdBQUMsUUFBc0IsRUFBeUM7QUFDeEYsVUFBTSxpQkFBaUIscUJBQUc7ZUFBWSx1QkFBVSxJQUFJLENBQUMsRUFBRSxFQUFFO09BQUEsQ0FBQSxDQUFDOzs4QkFDN0IsUUFBUSxDQUFDLE9BQU8sRUFBRTs7VUFBOUIsUUFBUSxxQkFBbEIsUUFBUTs7QUFDZixVQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7O3FCQUNNLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQzs7VUFBbkQsaUJBQWlCLFlBQWpCLGlCQUFpQjs7QUFDeEIsVUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsVUFBSSxVQUFVLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7QUFDdkQsWUFBTSxRQUFRLGlDQUFpQyxDQUFDO0FBQ2hELGtCQUFVLENBQUMsSUFBSSxDQUNiLGtDQUFxQixFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQy9FLENBQUM7T0FDSCxNQUFNO1lBQ0UsWUFBVyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXpCLFdBQVc7O0FBQ2xCLFlBQU0sU0FBUyxHQUFHLGVBQU0sSUFBSSxDQUFDLFlBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUM3QyxJQUFJLENBQUMsVUFBQyxTQUFTLEVBQUUsU0FBUztpQkFDekIsdUJBQVUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsQ0FDdkQsdUJBQVUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUM1QztTQUFBLENBQ0YsQ0FBQztBQUNKLGFBQUssSUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO0FBQ2hDLGNBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNqQyxnQkFBTSxVQUFVLEdBQUcsWUFBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxzQkFBVSxDQUFDLElBQUksQ0FDYixrQ0FBcUIsRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFFLFVBQVUsRUFBVixVQUFVLEVBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQ2pGLENBQUM7V0FDSDtTQUNGO09BQ0Y7QUFDRCxhQUFPLHVCQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNuQzs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO09BQzVCO0tBQ0Y7OztXQUVLLGtCQUFHO0FBQ1AsYUFDRTtBQUNFLG9CQUFZLEVBQUUsRUFBRSxBQUFDO0FBQ2pCLDRCQUFvQixFQUFDLHlCQUF5QjtBQUM5QywwQkFBa0IsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEFBQUM7QUFDbEQsNkJBQXFCLEVBQUUscUJBQXFCLEFBQUM7QUFDN0MsMkJBQW1CLEVBQUUsbUJBQW1CLEFBQUM7QUFDekMsZ0NBQXdCLEVBQUU7Ozs7U0FBNkIsQUFBQztBQUN4RCx1QkFBZSxFQUFFLFlBQU0sRUFBRSxBQUFDO0FBQzFCLFdBQUcsRUFBQyxNQUFNO1FBQ1YsQ0FDRjtLQUNIOzs7V0FFa0IsNkJBQUMsSUFBa0IsRUFBUTtBQUM1QyxVQUFNLEtBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtBQUN2RSxlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25EOzs7U0EzSmtCLFlBQVk7R0FBUyxvQkFBTSxTQUFTOztxQkFBcEMsWUFBWSIsImZpbGUiOiJEaWZmVmlld1RyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBMYXp5VHJlZU5vZGUgZnJvbSAnLi4vLi4vdWkvdHJlZSc7XG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZSwgRmlsZUNoYW5nZVN0YXRlLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1RyZWVSb290Q29tcG9uZW50fSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCBEaWZmVmlld1RyZWVOb2RlIGZyb20gJy4vRGlmZlZpZXdUcmVlTm9kZSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnR9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtnZXRQYXRoLCBiYXNlbmFtZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmZ1bmN0aW9uIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBjbGFzc09iaiA9IHtcbiAgICAnaWNvbic6IHRydWUsXG4gICAgJ25hbWUnOiB0cnVlLFxuICB9O1xuXG4gIGlmIChub2RlLmlzQ29udGFpbmVyKCkpIHtcbiAgICBjbGFzc09ialtgaWNvbi1maWxlLWRpcmVjdG9yeWBdID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChub2RlLmdldEl0ZW0oKS5zdGF0dXNDb2RlKSB7XG4gICAgY2xhc3NPYmpbZmlsZVR5cGVDbGFzcyhub2RlLmdldExhYmVsKCkpXSA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZXMoY2xhc3NPYmopO1xufVxuXG5mdW5jdGlvbiByb3dDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSkge1xuICBjb25zdCB2Y3NDbGFzc05hbWUgPSB2Y3NDbGFzc05hbWVGb3JFbnRyeShub2RlLmdldEl0ZW0oKSk7XG4gIHJldHVybiBjbGFzc25hbWVzKHtcbiAgICBbdmNzQ2xhc3NOYW1lXTogdmNzQ2xhc3NOYW1lLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmNzQ2xhc3NOYW1lRm9yRW50cnkoZW50cnk6IEZpbGVDaGFuZ2UpOiBzdHJpbmcge1xuICBjb25zdCBzdGF0dXNDb2RlRGVmaW5lZCA9IGVudHJ5LnN0YXR1c0NvZGUgIT0gbnVsbDtcbiAgY29uc3QgY2xhc3NPYmplY3Q6IE9iamVjdCA9IHtcbiAgICAncm9vdCc6ICFzdGF0dXNDb2RlRGVmaW5lZCxcbiAgICAnZmlsZS1jaGFuZ2UnOiBzdGF0dXNDb2RlRGVmaW5lZCxcbiAgfTtcbiAgc3dpdGNoIChlbnRyeS5zdGF0dXNDb2RlKSB7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQ6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLWFkZGVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1tb2RpZmllZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5SRU1PVkVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NSVNTSU5HOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1yZW1vdmVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZXMoY2xhc3NPYmplY3QpO1xufVxuXG50eXBlIFByb3BzID0ge1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmVmlld1RyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHN0YXRlOiB7XG4gICAgZmlsZUNoYW5nZXM6IE1hcDxOdWNsaWRlVXJpLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWU+O1xuICAgIHNlbGVjdGVkRmlsZVBhdGg6IHN0cmluZztcbiAgfTtcblxuICBfYm91bmRPbkNvbmZpcm1TZWxlY3Rpb246IEZ1bmN0aW9uO1xuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kT25Db25maXJtU2VsZWN0aW9uID0gdGhpcy5fb25Db25maXJtU2VsZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWxlQ2hhbmdlczogZGlmZk1vZGVsLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpLFxuICAgICAgc2VsZWN0ZWRGaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhmaWxlQ2hhbmdlcyA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtmaWxlQ2hhbmdlcywgc2VsZWN0ZWRGaWxlUGF0aDogdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRofSk7XG4gICAgfSkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkFjdGl2ZUZpbGVVcGRhdGVzKChmaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSkgPT4ge1xuICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IGZpbGVTdGF0ZTtcbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkRmlsZVBhdGg6IGZpbGVQYXRoLCBmaWxlQ2hhbmdlczogdGhpcy5zdGF0ZS5maWxlQ2hhbmdlc30pO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJzogW1xuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdHb3RvIEZpbGUnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpnb3RvLWZpbGUnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdDb3B5IEZpbGUgTmFtZScsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZmlsZS1uYW1lJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29weSBGdWxsIFBhdGgnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICBdLFxuICAgIH0pKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi10cmVlOmdvdG8tZmlsZScsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZnVsbC1wYXRoJyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShnZXRQYXRoKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZpbGUtbmFtZScsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoYmFzZW5hbWUoZmlsZVBhdGggfHwgJycpKTtcbiAgICAgIH1cbiAgICApKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290cyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEaWZmVmlld1RyZWVOb2RlKFxuICAgICAgICB7ZmlsZVBhdGg6IGRpcmVjdG9yeS5nZXRQYXRoKCl9LFxuICAgICAgICBudWxsLCAvKiBudWxsIHBhcmVudCBmb3Igcm9vdHMgKi9cbiAgICAgICAgdHJ1ZSwgLyogaXNDb250YWluZXIgKi9cbiAgICAgICAgdGhpcy5fcm9vdENoaWxkcmVuRmV0Y2hlci5iaW5kKHRoaXMpLCAvKiByb290IGNoaWxkcmVuIGZldGNoZXIgKi9cbiAgICAgICk7XG4gICAgfSk7XG4gICAgY29uc3QgdHJlZVJvb3QgPSB0aGlzLnJlZnNbJ3RyZWUnXTtcbiAgICBjb25zdCBub09wID0gKCkgPT4ge307XG4gICAgY29uc3Qgc2VsZWN0RmlsZU5vZGUgPSAoKSA9PiB7XG4gICAgICB0cmVlUm9vdC5zZWxlY3ROb2RlS2V5KHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkudGhlbihub09wLCBub09wKTtcbiAgICB9O1xuICAgIHRyZWVSb290LnNldFJvb3RzKHJvb3RzKS50aGVuKHNlbGVjdEZpbGVOb2RlLCBzZWxlY3RGaWxlTm9kZSk7XG4gIH1cblxuICBhc3luYyBfcm9vdENoaWxkcmVuRmV0Y2hlcihyb290Tm9kZTogTGF6eVRyZWVOb2RlKTogUHJvbWlzZTxJbW11dGFibGUuTGlzdDxMYXp5VHJlZU5vZGU+PiB7XG4gICAgY29uc3Qgbm9DaGlsZHJlbkZldGNoZXIgPSBhc3luYyAoKSA9PiBJbW11dGFibGUuTGlzdC5vZigpO1xuICAgIGNvbnN0IHtmaWxlUGF0aDogcm9vdFBhdGh9ID0gcm9vdE5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBbXTtcbiAgICBjb25zdCB7cmVwb3NpdG9yeUZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vaGctZ2l0LWJyaWRnZScpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChyb290UGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3Qgbm9kZU5hbWUgPSBgW1hdIE5vbi1NZXJjdXJpYWwgUmVwb3NpdG9yeWA7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgIG5ldyBEaWZmVmlld1RyZWVOb2RlKHtmaWxlUGF0aDogbm9kZU5hbWV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge2ZpbGVDaGFuZ2VzfSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCBmaWxlUGF0aHMgPSBhcnJheS5mcm9tKGZpbGVDaGFuZ2VzLmtleXMoKSlcbiAgICAgICAgLnNvcnQoKGZpbGVQYXRoMSwgZmlsZVBhdGgyKSA9PlxuICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDEpLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShcbiAgICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChyb290UGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gZmlsZUNoYW5nZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGgsIHN0YXR1c0NvZGV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEltbXV0YWJsZS5MaXN0KGNoaWxkTm9kZXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8VHJlZVJvb3RDb21wb25lbnRcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS1kaWZmLXZpZXctdHJlZVwiXG4gICAgICAgIG9uQ29uZmlybVNlbGVjdGlvbj17dGhpcy5fYm91bmRPbkNvbmZpcm1TZWxlY3Rpb259XG4gICAgICAgIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZT17bGFiZWxDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXtyb3dDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9ezxkaXY+Tm8gY2hhbmdlcyB0byBzaG93PC9kaXY+fVxuICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICByZWY9XCJ0cmVlXCJcbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNvbmZpcm1TZWxlY3Rpb24obm9kZTogTGF6eVRyZWVOb2RlKTogdm9pZCB7XG4gICAgY29uc3QgZW50cnk6IEZpbGVDaGFuZ2UgPSBub2RlLmdldEl0ZW0oKTtcbiAgICBpZiAoIWVudHJ5LnN0YXR1c0NvZGUgfHwgZW50cnkuZmlsZVBhdGggPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5hY3RpdmF0ZUZpbGUoZW50cnkuZmlsZVBhdGgpO1xuICB9XG59XG4iXX0=