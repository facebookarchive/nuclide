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
  var className = '';
  switch (entry.statusCode) {
    case _constants.FileChangeStatus.ADDED:
    case _constants.FileChangeStatus.UNTRACKED:
      className = 'status-added';
      break;
    case _constants.FileChangeStatus.MODIFIED:
      className = 'status-modified';
      break;
    case _constants.FileChangeStatus.REMOVED:
    case _constants.FileChangeStatus.MISSING:
      className = 'status-removed';
      break;
  }
  return className;
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
        var fileChanges = this.state.fileChanges;

        var filePaths = _commons.array.from(fileChanges.keys()).sort(function (filePath1, filePath2) {
          return _remoteUri2['default'].basename(filePath1).toLowerCase().localeCompare(_remoteUri2['default'].basename(filePath2).toLowerCase());
        });
        for (var filePath of filePaths) {
          if (filePath.startsWith(rootPath)) {
            var statusCode = fileChanges.get(filePath);
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
        ref: 'tree' });
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
//# sourceMappingURL=data:application/json;base64,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QUNqRixDQUFDO1dBQ0g7U0FDRjtPQUNGO0FBQ0QsYUFBTyx1QkFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDbkM7OztXQUVtQixnQ0FBUztBQUMzQixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztPQUM1QjtLQUNGOzs7V0FFSyxrQkFBRztBQUNQLGFBQ0U7QUFDRSxvQkFBWSxFQUFFLEVBQUUsQUFBQztBQUNqQiw0QkFBb0IsRUFBQyx5QkFBeUI7QUFDOUMsMEJBQWtCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixBQUFDO0FBQ2xELDZCQUFxQixFQUFFLHFCQUFxQixBQUFDO0FBQzdDLDJCQUFtQixFQUFFLG1CQUFtQixBQUFDO0FBQ3pDLGdDQUF3QixFQUFFOzs7O1NBQTZCLEFBQUM7QUFDeEQsdUJBQWUsRUFBRSxZQUFNLEVBQUUsQUFBQztBQUMxQixXQUFHLEVBQUMsTUFBTSxHQUFHLENBQ2Y7S0FDSDs7O1dBRWtCLDZCQUFDLElBQWtCLEVBQVE7QUFDNUMsVUFBTSxLQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDdkUsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1NBekdrQixZQUFZO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXBDLFlBQVkiLCJmaWxlIjoiRGlmZlZpZXdUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTGF6eVRyZWVOb2RlIGZyb20gJy4uLy4uL3VpL3RyZWUnO1xuaW1wb3J0IHR5cGUge0ZpbGVDaGFuZ2UsIEZpbGVDaGFuZ2VTdGF0ZX0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBEaWZmVmlld01vZGVsIGZyb20gJy4vRGlmZlZpZXdNb2RlbCc7XG5cbmltcG9ydCB7ZmlsZVR5cGVDbGFzc30gZnJvbSAnLi4vLi4vYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7VHJlZVJvb3RDb21wb25lbnR9IGZyb20gJy4uLy4uL3VpL3RyZWUnO1xuaW1wb3J0IERpZmZWaWV3VHJlZU5vZGUgZnJvbSAnLi9EaWZmVmlld1RyZWVOb2RlJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0ZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmZ1bmN0aW9uIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBjbGFzc09iaiA9IHtcbiAgICAnaWNvbic6IHRydWUsXG4gICAgJ25hbWUnOiB0cnVlLFxuICB9O1xuXG4gIGlmIChub2RlLmlzQ29udGFpbmVyKCkpIHtcbiAgICBjbGFzc09ialtgaWNvbi1maWxlLWRpcmVjdG9yeWBdID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChub2RlLmdldEl0ZW0oKS5zdGF0dXNDb2RlKSB7XG4gICAgY2xhc3NPYmpbZmlsZVR5cGVDbGFzcyhub2RlLmdldExhYmVsKCkpXSA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZXMoY2xhc3NPYmopO1xufVxuXG5mdW5jdGlvbiByb3dDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSkge1xuICBjb25zdCB2Y3NDbGFzc05hbWUgPSB2Y3NDbGFzc05hbWVGb3JFbnRyeShub2RlLmdldEl0ZW0oKSk7XG4gIHJldHVybiBjbGFzc25hbWVzKHtcbiAgICBbdmNzQ2xhc3NOYW1lXTogdmNzQ2xhc3NOYW1lLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmNzQ2xhc3NOYW1lRm9yRW50cnkoZW50cnk6IEZpbGVDaGFuZ2UpOiBzdHJpbmcge1xuICBsZXQgY2xhc3NOYW1lID0gJyc7XG4gIHN3aXRjaCAoZW50cnkuc3RhdHVzQ29kZSkge1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5BRERFRDpcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEOlxuICAgICAgY2xhc3NOYW1lID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuTU9ESUZJRUQ6XG4gICAgICBjbGFzc05hbWUgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5SRU1PVkVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NSVNTSU5HOlxuICAgICAgY2xhc3NOYW1lID0gJ3N0YXR1cy1yZW1vdmVkJztcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBjbGFzc05hbWU7XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGRpZmZNb2RlbDogRGlmZlZpZXdNb2RlbDtcbn07XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3VHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX2JvdW5kT25Db25maXJtU2VsZWN0aW9uOiBGdW5jdGlvbjtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZE9uQ29uZmlybVNlbGVjdGlvbiA9IHRoaXMuX29uQ29uZmlybVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gcHJvcHM7XG4gICAgY29uc3Qge2ZpbGVQYXRofSA9IGRpZmZNb2RlbC5nZXRBY3RpdmVGaWxlU3RhdGUoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZmlsZUNoYW5nZXM6IGRpZmZNb2RlbC5nZXRDb21wYXJlRmlsZUNoYW5nZXMoKSxcbiAgICAgIHNlbGVjdGVkRmlsZVBhdGg6IGZpbGVQYXRoLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCB7ZGlmZk1vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkRpZENoYW5nZUNvbXBhcmVTdGF0dXMoZmlsZUNoYW5nZXMgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZmlsZUNoYW5nZXMsIHNlbGVjdGVkRmlsZVBhdGg6IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aH0pO1xuICAgIH0pKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaWZmTW9kZWwub25BY3RpdmVGaWxlVXBkYXRlcygoZmlsZVN0YXRlOiBGaWxlQ2hhbmdlU3RhdGUpID0+IHtcbiAgICAgIGNvbnN0IHtmaWxlUGF0aH0gPSBmaWxlU3RhdGU7XG4gICAgICBpZiAoZmlsZVBhdGggIT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEZpbGVQYXRoOiBmaWxlUGF0aCwgZmlsZUNoYW5nZXM6IHRoaXMuc3RhdGUuZmlsZUNoYW5nZXN9KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGlmZlZpZXdUcmVlTm9kZShcbiAgICAgICAge2ZpbGVQYXRoOiBkaXJlY3RvcnkuZ2V0UGF0aCgpfSxcbiAgICAgICAgbnVsbCwgLyogbnVsbCBwYXJlbnQgZm9yIHJvb3RzICovXG4gICAgICAgIHRydWUsIC8qIGlzQ29udGFpbmVyICovXG4gICAgICAgIHRoaXMuX3Jvb3RDaGlsZHJlbkZldGNoZXIuYmluZCh0aGlzKSwgLyogcm9vdCBjaGlsZHJlbiBmZXRjaGVyICovXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnN0IHRyZWVSb290ID0gdGhpcy5yZWZzWyd0cmVlJ107XG4gICAgY29uc3Qgbm9PcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHNlbGVjdEZpbGVOb2RlID0gKCkgPT4ge1xuICAgICAgdHJlZVJvb3Quc2VsZWN0Tm9kZUtleSh0aGlzLnN0YXRlLnNlbGVjdGVkRmlsZVBhdGgpLnRoZW4obm9PcCwgbm9PcCk7XG4gICAgfTtcbiAgICB0cmVlUm9vdC5zZXRSb290cyhyb290cykudGhlbihzZWxlY3RGaWxlTm9kZSwgc2VsZWN0RmlsZU5vZGUpO1xuICB9XG5cbiAgYXN5bmMgX3Jvb3RDaGlsZHJlbkZldGNoZXIocm9vdE5vZGU6IExhenlUcmVlTm9kZSk6IFByb21pc2U8SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPj4ge1xuICAgIGNvbnN0IG5vQ2hpbGRyZW5GZXRjaGVyID0gYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IHJvb3RQYXRofSA9IHJvb3ROb2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gW107XG4gICAgY29uc3Qge3JlcG9zaXRvcnlGb3JQYXRofSA9IHJlcXVpcmUoJy4uLy4uL2hnLWdpdC1icmlkZ2UnKTtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdFBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IG5vZGVOYW1lID0gYFtYXSBOb24tTWVyY3VyaWFsIFJlcG9zaXRvcnlgO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGg6IG5vZGVOYW1lfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtmaWxlQ2hhbmdlc30gPSB0aGlzLnN0YXRlO1xuICAgICAgY29uc3QgZmlsZVBhdGhzID0gYXJyYXkuZnJvbShmaWxlQ2hhbmdlcy5rZXlzKCkpXG4gICAgICAgIC5zb3J0KChmaWxlUGF0aDEsIGZpbGVQYXRoMikgPT5cbiAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgxKS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgyKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgocm9vdFBhdGgpKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IGZpbGVDaGFuZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IERpZmZWaWV3VHJlZU5vZGUoe2ZpbGVQYXRoLCBzdGF0dXNDb2RlfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJbW11dGFibGUuTGlzdChjaGlsZE5vZGVzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFRyZWVSb290Q29tcG9uZW50XG4gICAgICAgIGluaXRpYWxSb290cz17W119XG4gICAgICAgIGV2ZW50SGFuZGxlclNlbGVjdG9yPVwiLm51Y2xpZGUtZGlmZi12aWV3LXRyZWVcIlxuICAgICAgICBvbkNvbmZpcm1TZWxlY3Rpb249e3RoaXMuX2JvdW5kT25Db25maXJtU2VsZWN0aW9ufVxuICAgICAgICBsYWJlbENsYXNzTmFtZUZvck5vZGU9e2xhYmVsQ2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgcm93Q2xhc3NOYW1lRm9yTm9kZT17cm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgZWxlbWVudFRvUmVuZGVyV2hlbkVtcHR5PXs8ZGl2Pk5vIGNoYW5nZXMgdG8gc2hvdzwvZGl2Pn1cbiAgICAgICAgb25LZWVwU2VsZWN0aW9uPXsoKSA9PiB7fX1cbiAgICAgICAgcmVmPVwidHJlZVwiIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNvbmZpcm1TZWxlY3Rpb24obm9kZTogTGF6eVRyZWVOb2RlKTogdm9pZCB7XG4gICAgY29uc3QgZW50cnk6IEZpbGVDaGFuZ2UgPSBub2RlLmdldEl0ZW0oKTtcbiAgICBpZiAoIWVudHJ5LnN0YXR1c0NvZGUgfHwgZW50cnkuZmlsZVBhdGggPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLmRpZmZNb2RlbC5hY3RpdmF0ZUZpbGUoZW50cnkuZmlsZVBhdGgpO1xuICB9XG59XG4iXX0=