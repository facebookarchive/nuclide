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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
      return _reactForAtom2['default'].createElement(_uiTree.TreeRootComponent, {
        initialRoots: [],
        eventHandlerSelector: '.nuclide-diff-view-tree',
        onConfirmSelection: this._boundOnConfirmSelection,
        labelClassNameForNode: labelClassNameForNode,
        rowClassNameForNode: rowClassNameForNode,
        elementToRenderWhenEmpty: _reactForAtom2['default'].createElement(
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
})(_reactForAtom2['default'].Component);

exports['default'] = DiffViewTree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Q0FDakYsQ0FBQztXQUNIO1NBQ0Y7T0FDRjtBQUNELGFBQU8sdUJBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7T0FDNUI7S0FDRjs7O1dBRUssa0JBQUc7QUFDUCxhQUNFO0FBQ0Usb0JBQVksRUFBRSxFQUFFLEFBQUM7QUFDakIsNEJBQW9CLEVBQUMseUJBQXlCO0FBQzlDLDBCQUFrQixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQUFBQztBQUNsRCw2QkFBcUIsRUFBRSxxQkFBcUIsQUFBQztBQUM3QywyQkFBbUIsRUFBRSxtQkFBbUIsQUFBQztBQUN6QyxnQ0FBd0IsRUFBRTs7OztTQUE2QixBQUFDO0FBQ3hELHVCQUFlLEVBQUUsWUFBTSxFQUFFLEFBQUM7QUFDMUIsV0FBRyxFQUFDLE1BQU0sR0FBRyxDQUNmO0tBQ0g7OztXQUVrQiw2QkFBQyxJQUFrQixFQUFRO0FBQzVDLFVBQU0sS0FBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZFLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkQ7OztTQXpHa0IsWUFBWTtHQUFTLDBCQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6IkRpZmZWaWV3VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIExhenlUcmVlTm9kZSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlLCBGaWxlQ2hhbmdlU3RhdGV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuXG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1RyZWVSb290Q29tcG9uZW50fSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCBEaWZmVmlld1RyZWVOb2RlIGZyb20gJy4vRGlmZlZpZXdUcmVlTm9kZSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuZnVuY3Rpb24gbGFiZWxDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IGNsYXNzT2JqID0ge1xuICAgICdpY29uJzogdHJ1ZSxcbiAgICAnbmFtZSc6IHRydWUsXG4gIH07XG5cbiAgaWYgKG5vZGUuaXNDb250YWluZXIoKSkge1xuICAgIGNsYXNzT2JqW2BpY29uLWZpbGUtZGlyZWN0b3J5YF0gPSB0cnVlO1xuICB9IGVsc2UgaWYgKG5vZGUuZ2V0SXRlbSgpLnN0YXR1c0NvZGUpIHtcbiAgICBjbGFzc09ialtmaWxlVHlwZUNsYXNzKG5vZGUuZ2V0TGFiZWwoKSldID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gY2xhc3NuYW1lcyhjbGFzc09iaik7XG59XG5cbmZ1bmN0aW9uIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKSB7XG4gIGNvbnN0IHZjc0NsYXNzTmFtZSA9IHZjc0NsYXNzTmFtZUZvckVudHJ5KG5vZGUuZ2V0SXRlbSgpKTtcbiAgcmV0dXJuIGNsYXNzbmFtZXMoe1xuICAgIFt2Y3NDbGFzc05hbWVdOiB2Y3NDbGFzc05hbWUsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2Y3NDbGFzc05hbWVGb3JFbnRyeShlbnRyeTogRmlsZUNoYW5nZSk6IHN0cmluZyB7XG4gIGxldCBjbGFzc05hbWUgPSAnJztcbiAgc3dpdGNoIChlbnRyeS5zdGF0dXNDb2RlKSB7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQ6XG4gICAgICBjbGFzc05hbWUgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRDpcbiAgICAgIGNsYXNzTmFtZSA9ICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLlJFTU9WRUQ6XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLk1JU1NJTkc6XG4gICAgICBjbGFzc05hbWUgPSAnc3RhdHVzLXJlbW92ZWQnO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGNsYXNzTmFtZTtcbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfYm91bmRPbkNvbmZpcm1TZWxlY3Rpb246IEZ1bmN0aW9uO1xuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kT25Db25maXJtU2VsZWN0aW9uID0gdGhpcy5fb25Db25maXJtU2VsZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgY29uc3Qge2RpZmZNb2RlbH0gPSBwcm9wcztcbiAgICBjb25zdCB7ZmlsZVBhdGh9ID0gZGlmZk1vZGVsLmdldEFjdGl2ZUZpbGVTdGF0ZSgpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWxlQ2hhbmdlczogZGlmZk1vZGVsLmdldENvbXBhcmVGaWxlQ2hhbmdlcygpLFxuICAgICAgc2VsZWN0ZWRGaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHtkaWZmTW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlmZk1vZGVsLm9uRGlkQ2hhbmdlQ29tcGFyZVN0YXR1cyhmaWxlQ2hhbmdlcyA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtmaWxlQ2hhbmdlcywgc2VsZWN0ZWRGaWxlUGF0aDogdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRofSk7XG4gICAgfSkpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGRpZmZNb2RlbC5vbkFjdGl2ZUZpbGVVcGRhdGVzKChmaWxlU3RhdGU6IEZpbGVDaGFuZ2VTdGF0ZSkgPT4ge1xuICAgICAgY29uc3Qge2ZpbGVQYXRofSA9IGZpbGVTdGF0ZTtcbiAgICAgIGlmIChmaWxlUGF0aCAhPT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkRmlsZVBhdGg6IGZpbGVQYXRoLCBmaWxlQ2hhbmdlczogdGhpcy5zdGF0ZS5maWxlQ2hhbmdlc30pO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpOiB2b2lkIHtcbiAgICBjb25zdCByb290cyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEaWZmVmlld1RyZWVOb2RlKFxuICAgICAgICB7ZmlsZVBhdGg6IGRpcmVjdG9yeS5nZXRQYXRoKCl9LFxuICAgICAgICBudWxsLCAvKiBudWxsIHBhcmVudCBmb3Igcm9vdHMgKi9cbiAgICAgICAgdHJ1ZSwgLyogaXNDb250YWluZXIgKi9cbiAgICAgICAgdGhpcy5fcm9vdENoaWxkcmVuRmV0Y2hlci5iaW5kKHRoaXMpLCAvKiByb290IGNoaWxkcmVuIGZldGNoZXIgKi9cbiAgICAgICk7XG4gICAgfSk7XG4gICAgY29uc3QgdHJlZVJvb3QgPSB0aGlzLnJlZnNbJ3RyZWUnXTtcbiAgICBjb25zdCBub09wID0gKCkgPT4ge307XG4gICAgY29uc3Qgc2VsZWN0RmlsZU5vZGUgPSAoKSA9PiB7XG4gICAgICB0cmVlUm9vdC5zZWxlY3ROb2RlS2V5KHRoaXMuc3RhdGUuc2VsZWN0ZWRGaWxlUGF0aCkudGhlbihub09wLCBub09wKTtcbiAgICB9O1xuICAgIHRyZWVSb290LnNldFJvb3RzKHJvb3RzKS50aGVuKHNlbGVjdEZpbGVOb2RlLCBzZWxlY3RGaWxlTm9kZSk7XG4gIH1cblxuICBhc3luYyBfcm9vdENoaWxkcmVuRmV0Y2hlcihyb290Tm9kZTogTGF6eVRyZWVOb2RlKTogUHJvbWlzZTxJbW11dGFibGUuTGlzdDxMYXp5VHJlZU5vZGU+PiB7XG4gICAgY29uc3Qgbm9DaGlsZHJlbkZldGNoZXIgPSBhc3luYyAoKSA9PiBJbW11dGFibGUuTGlzdC5vZigpO1xuICAgIGNvbnN0IHtmaWxlUGF0aDogcm9vdFBhdGh9ID0gcm9vdE5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBbXTtcbiAgICBjb25zdCB7cmVwb3NpdG9yeUZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vaGctZ2l0LWJyaWRnZScpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChyb290UGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3Qgbm9kZU5hbWUgPSBgW1hdIE5vbi1NZXJjdXJpYWwgUmVwb3NpdG9yeWA7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgIG5ldyBEaWZmVmlld1RyZWVOb2RlKHtmaWxlUGF0aDogbm9kZU5hbWV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge2ZpbGVDaGFuZ2VzfSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCBmaWxlUGF0aHMgPSBhcnJheS5mcm9tKGZpbGVDaGFuZ2VzLmtleXMoKSlcbiAgICAgICAgLnNvcnQoKGZpbGVQYXRoMSwgZmlsZVBhdGgyKSA9PlxuICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDEpLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShcbiAgICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChyb290UGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gZmlsZUNoYW5nZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGgsIHN0YXR1c0NvZGV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEltbXV0YWJsZS5MaXN0KGNoaWxkTm9kZXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8VHJlZVJvb3RDb21wb25lbnRcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS1kaWZmLXZpZXctdHJlZVwiXG4gICAgICAgIG9uQ29uZmlybVNlbGVjdGlvbj17dGhpcy5fYm91bmRPbkNvbmZpcm1TZWxlY3Rpb259XG4gICAgICAgIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZT17bGFiZWxDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXtyb3dDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9ezxkaXY+Tm8gY2hhbmdlcyB0byBzaG93PC9kaXY+fVxuICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICByZWY9XCJ0cmVlXCIgLz5cbiAgICApO1xuICB9XG5cbiAgX29uQ29uZmlybVNlbGVjdGlvbihub2RlOiBMYXp5VHJlZU5vZGUpOiB2b2lkIHtcbiAgICBjb25zdCBlbnRyeTogRmlsZUNoYW5nZSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGlmICghZW50cnkuc3RhdHVzQ29kZSB8fCBlbnRyeS5maWxlUGF0aCA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucHJvcHMuZGlmZk1vZGVsLmFjdGl2YXRlRmlsZShlbnRyeS5maWxlUGF0aCk7XG4gIH1cbn1cbiJdfQ==