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

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideUiLibTreeRootComponent = require('../../nuclide-ui/lib/TreeRootComponent');

var _DiffViewTreeNode = require('./DiffViewTreeNode');

var _DiffViewTreeNode2 = _interopRequireDefault(_DiffViewTreeNode);

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _constants = require('./constants');

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _nuclideCommons = require('../../nuclide-commons');

var _classnames2 = require('classnames');

var _classnames3 = _interopRequireDefault(_classnames2);

var _utils = require('./utils');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

function labelClassNameForNode(node) {
  var classObj = {
    'icon': true,
    'name': true
  };

  if (node.isContainer()) {
    classObj['icon-file-directory'] = true;
  } else if (node.getItem().statusCode) {
    classObj[(0, _nuclideAtomHelpers.fileTypeClass)(node.getLabel())] = true;
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
      this._subscriptions = new _atom.CompositeDisposable();
      this._subscriptions.add(atom.contextMenu.add({
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
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:goto-file', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-full-path', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        atom.clipboard.write((0, _nuclideRemoteUri.getPath)(filePath || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-file-name', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        atom.clipboard.write((0, _nuclideRemoteUri.basename)(filePath || ''));
      }));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _this = this;

      var roots = _nuclideCommons.array.compact(atom.project.getDirectories().map(function (directory) {
        var rootPath = directory.getPath();
        var repository = (0, _nuclideHgGitBridge.repositoryForPath)(rootPath);
        if (!_this.props.showNonHgRepos && (repository == null || repository.getType() !== 'hg')) {
          return null;
        }
        return new _DiffViewTreeNode2['default']({ filePath: rootPath }, null, /* null parent for roots */
        true, /* isContainer */
        _this._rootChildrenFetcher.bind(_this));
      }));
      /* root children fetcher */
      var treeRoot = this.refs['tree'];
      var noOp = function noOp() {};
      var selectFileNode = function selectFileNode() {
        treeRoot.selectNodeKey(_this.props.activeFilePath).then(noOp, noOp);
      };
      treeRoot.setRoots(roots).then(selectFileNode, selectFileNode);
    }

    // TODO(most): move async code out of the React component class.
  }, {
    key: '_rootChildrenFetcher',
    value: _asyncToGenerator(function* (rootNode) {
      var noChildrenFetcher = _asyncToGenerator(function* () {
        return _immutable2['default'].List.of();
      });

      var _rootNode$getItem = rootNode.getItem();

      var rootPath = _rootNode$getItem.filePath;

      var childNodes = [];

      var repository = (0, _nuclideHgGitBridge.repositoryForPath)(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        var nodeName = '[X] Non-Mercurial Repository';
        childNodes.push(new _DiffViewTreeNode2['default']({ filePath: nodeName }, rootNode, false, noChildrenFetcher));
      } else {
        var _fileChanges = this.props.fileChanges;

        var filePaths = Array.from(_fileChanges.keys()).sort(function (filePath1, filePath2) {
          return _nuclideRemoteUri2['default'].basename(filePath1).toLowerCase().localeCompare(_nuclideRemoteUri2['default'].basename(filePath2).toLowerCase());
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
      this._subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(_nuclideUiLibTreeRootComponent.TreeRootComponent, {
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
      if (!entry.statusCode || entry.filePath === this.props.activeFilePath) {
        return;
      }
      this.props.diffModel.diffEntity({ file: entry.filePath });
    }
  }]);

  return DiffViewTree;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewTree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFRLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQ2pGLENBQUM7V0FDSDtTQUNGO09BQ0Y7QUFDRCxhQUFPLHVCQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNuQzs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztXQUVLLGtCQUFHO0FBQ1AsYUFDRTtBQUNFLG9CQUFZLEVBQUUsRUFBRSxBQUFDO0FBQ2pCLDRCQUFvQixFQUFDLHlCQUF5QjtBQUM5QywwQkFBa0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEFBQUM7QUFDN0MsNkJBQXFCLEVBQUUscUJBQXFCLEFBQUM7QUFDN0MsMkJBQW1CLEVBQUUsbUJBQW1CLEFBQUM7QUFDekMsZ0NBQXdCLEVBQUU7Ozs7U0FBNkIsQUFBQztBQUN4RCx1QkFBZSxFQUFFLFlBQU0sRUFBRSxBQUFDO0FBQzFCLFdBQUcsRUFBQyxNQUFNO1FBQ1YsQ0FDRjtLQUNIOzs7V0FFa0IsNkJBQUMsSUFBa0IsRUFBUTtBQUM1QyxVQUFNLEtBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDckUsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO0tBQ3pEOzs7U0FsSmtCLFlBQVk7R0FBUyxvQkFBTSxTQUFTOztxQkFBcEMsWUFBWSIsImZpbGUiOiJEaWZmVmlld1RyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TGF6eVRyZWVOb2RlfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9MYXp5VHJlZU5vZGUnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2UsIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtmaWxlVHlwZUNsYXNzfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge1RyZWVSb290Q29tcG9uZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9UcmVlUm9vdENvbXBvbmVudCc7XG5pbXBvcnQgRGlmZlZpZXdUcmVlTm9kZSBmcm9tICcuL0RpZmZWaWV3VHJlZU5vZGUnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldFBhdGgsIGJhc2VuYW1lfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcblxuZnVuY3Rpb24gbGFiZWxDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IGNsYXNzT2JqID0ge1xuICAgICdpY29uJzogdHJ1ZSxcbiAgICAnbmFtZSc6IHRydWUsXG4gIH07XG5cbiAgaWYgKG5vZGUuaXNDb250YWluZXIoKSkge1xuICAgIGNsYXNzT2JqW2BpY29uLWZpbGUtZGlyZWN0b3J5YF0gPSB0cnVlO1xuICB9IGVsc2UgaWYgKG5vZGUuZ2V0SXRlbSgpLnN0YXR1c0NvZGUpIHtcbiAgICBjbGFzc09ialtmaWxlVHlwZUNsYXNzKG5vZGUuZ2V0TGFiZWwoKSldID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gY2xhc3NuYW1lcyhjbGFzc09iaik7XG59XG5cbmZ1bmN0aW9uIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKSB7XG4gIGNvbnN0IHZjc0NsYXNzTmFtZSA9IHZjc0NsYXNzTmFtZUZvckVudHJ5KG5vZGUuZ2V0SXRlbSgpKTtcbiAgcmV0dXJuIGNsYXNzbmFtZXMoe1xuICAgIFt2Y3NDbGFzc05hbWVdOiB2Y3NDbGFzc05hbWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2Y3NDbGFzc05hbWVGb3JFbnRyeShlbnRyeTogRmlsZUNoYW5nZSk6IHN0cmluZyB7XG4gIGNvbnN0IHN0YXR1c0NvZGVEZWZpbmVkID0gZW50cnkuc3RhdHVzQ29kZSAhPSBudWxsO1xuICBjb25zdCBjbGFzc09iamVjdDogT2JqZWN0ID0ge1xuICAgICdyb290JzogIXN0YXR1c0NvZGVEZWZpbmVkLFxuICAgICdmaWxlLWNoYW5nZSc6IHN0YXR1c0NvZGVEZWZpbmVkLFxuICB9O1xuICBzd2l0Y2ggKGVudHJ5LnN0YXR1c0NvZGUpIHtcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuQURERUQ6XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLlVOVFJBQ0tFRDpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtYWRkZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQ6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLW1vZGlmaWVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLlJFTU9WRUQ6XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLk1JU1NJTkc6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLXJlbW92ZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gY2xhc3NuYW1lcyhjbGFzc09iamVjdCk7XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGFjdGl2ZUZpbGVQYXRoOiA/TnVjbGlkZVVyaTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xuICBmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIHNob3dOb25IZ1JlcG9zOiBib29sZWFuO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25Db25maXJtU2VsZWN0aW9uID0gdGhpcy5fb25Db25maXJtU2VsZWN0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBQcm9wcyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnByb3BzLmFjdGl2ZUZpbGVQYXRoICE9PSBuZXh0UHJvcHMuYWN0aXZlRmlsZVBhdGggfHxcbiAgICAgIHRoaXMucHJvcHMuZmlsZUNoYW5nZXMgIT09IG5leHRQcm9wcy5maWxlQ2hhbmdlc1xuICAgICk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJzogW1xuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdHb3RvIEZpbGUnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpnb3RvLWZpbGUnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdDb3B5IEZpbGUgTmFtZScsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZmlsZS1uYW1lJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29weSBGdWxsIFBhdGgnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICBdLFxuICAgIH0pKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi10cmVlOmdvdG8tZmlsZScsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYgKGZpbGVQYXRoICE9IG51bGwgJiYgZmlsZVBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZnVsbC1wYXRoJyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShnZXRQYXRoKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZpbGUtbmFtZScsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoYmFzZW5hbWUoZmlsZVBhdGggfHwgJycpKTtcbiAgICAgIH1cbiAgICApKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290cyA9IGFycmF5LmNvbXBhY3QoXG4gICAgICBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdFBhdGgpO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd05vbkhnUmVwb3MgJiYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERpZmZWaWV3VHJlZU5vZGUoXG4gICAgICAgICAge2ZpbGVQYXRoOiByb290UGF0aH0sXG4gICAgICAgICAgbnVsbCwgLyogbnVsbCBwYXJlbnQgZm9yIHJvb3RzICovXG4gICAgICAgICAgdHJ1ZSwgLyogaXNDb250YWluZXIgKi9cbiAgICAgICAgICB0aGlzLl9yb290Q2hpbGRyZW5GZXRjaGVyLmJpbmQodGhpcyksIC8qIHJvb3QgY2hpbGRyZW4gZmV0Y2hlciAqL1xuICAgICAgICApO1xuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IHRyZWVSb290ID0gdGhpcy5yZWZzWyd0cmVlJ107XG4gICAgY29uc3Qgbm9PcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHNlbGVjdEZpbGVOb2RlID0gKCkgPT4ge1xuICAgICAgdHJlZVJvb3Quc2VsZWN0Tm9kZUtleSh0aGlzLnByb3BzLmFjdGl2ZUZpbGVQYXRoKS50aGVuKG5vT3AsIG5vT3ApO1xuICAgIH07XG4gICAgdHJlZVJvb3Quc2V0Um9vdHMocm9vdHMpLnRoZW4oc2VsZWN0RmlsZU5vZGUsIHNlbGVjdEZpbGVOb2RlKTtcbiAgfVxuXG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIFJlYWN0IGNvbXBvbmVudCBjbGFzcy5cbiAgYXN5bmMgX3Jvb3RDaGlsZHJlbkZldGNoZXIocm9vdE5vZGU6IExhenlUcmVlTm9kZSk6IFByb21pc2U8SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPj4ge1xuICAgIGNvbnN0IG5vQ2hpbGRyZW5GZXRjaGVyID0gYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IHJvb3RQYXRofSA9IHJvb3ROb2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gW107XG5cbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdFBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IG5vZGVOYW1lID0gYFtYXSBOb24tTWVyY3VyaWFsIFJlcG9zaXRvcnlgO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGg6IG5vZGVOYW1lfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtmaWxlQ2hhbmdlc30gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgZmlsZVBhdGhzID0gQXJyYXkuZnJvbShmaWxlQ2hhbmdlcy5rZXlzKCkpXG4gICAgICAgIC5zb3J0KChmaWxlUGF0aDEsIGZpbGVQYXRoMikgPT5cbiAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgxKS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgyKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgocm9vdFBhdGgpKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IGZpbGVDaGFuZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IERpZmZWaWV3VHJlZU5vZGUoe2ZpbGVQYXRoLCBzdGF0dXNDb2RlfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJbW11dGFibGUuTGlzdChjaGlsZE5vZGVzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8VHJlZVJvb3RDb21wb25lbnRcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS1kaWZmLXZpZXctdHJlZVwiXG4gICAgICAgIG9uQ29uZmlybVNlbGVjdGlvbj17dGhpcy5fb25Db25maXJtU2VsZWN0aW9ufVxuICAgICAgICBsYWJlbENsYXNzTmFtZUZvck5vZGU9e2xhYmVsQ2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgcm93Q2xhc3NOYW1lRm9yTm9kZT17cm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgZWxlbWVudFRvUmVuZGVyV2hlbkVtcHR5PXs8ZGl2Pk5vIGNoYW5nZXMgdG8gc2hvdzwvZGl2Pn1cbiAgICAgICAgb25LZWVwU2VsZWN0aW9uPXsoKSA9PiB7fX1cbiAgICAgICAgcmVmPVwidHJlZVwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfb25Db25maXJtU2VsZWN0aW9uKG5vZGU6IExhenlUcmVlTm9kZSk6IHZvaWQge1xuICAgIGNvbnN0IGVudHJ5OiBGaWxlQ2hhbmdlID0gbm9kZS5nZXRJdGVtKCk7XG4gICAgaWYgKCFlbnRyeS5zdGF0dXNDb2RlIHx8IGVudHJ5LmZpbGVQYXRoID09PSB0aGlzLnByb3BzLmFjdGl2ZUZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmRpZmZFbnRpdHkoe2ZpbGU6IGVudHJ5LmZpbGVQYXRofSk7XG4gIH1cbn1cbiJdfQ==