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

var _nuclideUiTree = require('../../nuclide-ui-tree');

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

      var roots = atom.project.getDirectories().map(function (directory) {
        return new _DiffViewTreeNode2['default']({ filePath: directory.getPath() }, null, /* null parent for roots */
        true, /* isContainer */
        _this._rootChildrenFetcher.bind(_this));
      });
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

      var _require = require('../../nuclide-hg-git-bridge');

      var repositoryForPath = _require.repositoryForPath;

      var repository = repositoryForPath(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        var nodeName = '[X] Non-Mercurial Repository';
        childNodes.push(new _DiffViewTreeNode2['default']({ filePath: nodeName }, rootNode, false, noChildrenFetcher));
      } else {
        var _fileChanges = this.props.fileChanges;

        var filePaths = _nuclideCommons.array.from(_fileChanges.keys()).sort(function (filePath1, filePath2) {
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
      return _reactForAtom.React.createElement(_nuclideUiTree.TreeRootComponent, {
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
      this.props.diffModel.activateFile(entry.filePath);
    }
  }]);

  return DiffViewTree;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewTree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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RTtBQUNFLG9CQUFZLEVBQUUsRUFBRSxBQUFDO0FBQ2pCLDRCQUFvQixFQUFDLHlCQUF5QjtBQUM5QywwQkFBa0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEFBQUM7QUFDN0MsNkJBQXFCLEVBQUUscUJBQXFCLEFBQUM7QUFDN0MsMkJBQW1CLEVBQUUsbUJBQW1CLEFBQUM7QUFDekMsZ0NBQXdCLEVBQUU7Ozs7U0FBNkIsQUFBQztBQUN4RCx1QkFBZSxFQUFFLFlBQU0sRUFBRSxBQUFDO0FBQzFCLFdBQUcsRUFBQyxNQUFNO1FBQ1YsQ0FDRjtLQUNIOzs7V0FFa0IsNkJBQUMsSUFBa0IsRUFBUTtBQUM1QyxVQUFNLEtBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDckUsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1NBM0lrQixZQUFZO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXBDLFlBQVkiLCJmaWxlIjoiRGlmZlZpZXdUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTGF6eVRyZWVOb2RlIGZyb20gJy4uLy4uL251Y2xpZGUtdWktdHJlZSc7XG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7VHJlZVJvb3RDb21wb25lbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWktdHJlZSc7XG5pbXBvcnQgRGlmZlZpZXdUcmVlTm9kZSBmcm9tICcuL0RpZmZWaWV3VHJlZU5vZGUnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge2dldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldFBhdGgsIGJhc2VuYW1lfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5mdW5jdGlvbiBsYWJlbENsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogc3RyaW5nIHtcbiAgY29uc3QgY2xhc3NPYmogPSB7XG4gICAgJ2ljb24nOiB0cnVlLFxuICAgICduYW1lJzogdHJ1ZSxcbiAgfTtcblxuICBpZiAobm9kZS5pc0NvbnRhaW5lcigpKSB7XG4gICAgY2xhc3NPYmpbYGljb24tZmlsZS1kaXJlY3RvcnlgXSA9IHRydWU7XG4gIH0gZWxzZSBpZiAobm9kZS5nZXRJdGVtKCkuc3RhdHVzQ29kZSkge1xuICAgIGNsYXNzT2JqW2ZpbGVUeXBlQ2xhc3Mobm9kZS5nZXRMYWJlbCgpKV0gPSB0cnVlO1xuICB9XG4gIHJldHVybiBjbGFzc25hbWVzKGNsYXNzT2JqKTtcbn1cblxuZnVuY3Rpb24gcm93Q2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpIHtcbiAgY29uc3QgdmNzQ2xhc3NOYW1lID0gdmNzQ2xhc3NOYW1lRm9yRW50cnkobm9kZS5nZXRJdGVtKCkpO1xuICByZXR1cm4gY2xhc3NuYW1lcyh7XG4gICAgW3Zjc0NsYXNzTmFtZV06IHZjc0NsYXNzTmFtZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHZjc0NsYXNzTmFtZUZvckVudHJ5KGVudHJ5OiBGaWxlQ2hhbmdlKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdHVzQ29kZURlZmluZWQgPSBlbnRyeS5zdGF0dXNDb2RlICE9IG51bGw7XG4gIGNvbnN0IGNsYXNzT2JqZWN0OiBPYmplY3QgPSB7XG4gICAgJ3Jvb3QnOiAhc3RhdHVzQ29kZURlZmluZWQsXG4gICAgJ2ZpbGUtY2hhbmdlJzogc3RhdHVzQ29kZURlZmluZWQsXG4gIH07XG4gIHN3aXRjaCAoZW50cnkuc3RhdHVzQ29kZSkge1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5BRERFRDpcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1hZGRlZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRDpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtbW9kaWZpZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuUkVNT1ZFRDpcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuTUlTU0lORzpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtcmVtb3ZlZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBjbGFzc25hbWVzKGNsYXNzT2JqZWN0KTtcbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgYWN0aXZlRmlsZVBhdGg6ID9OdWNsaWRlVXJpO1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmZWaWV3VHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ29uZmlybVNlbGVjdGlvbiA9IHRoaXMuX29uQ29uZmlybVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogUHJvcHMpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5wcm9wcy5hY3RpdmVGaWxlUGF0aCAhPT0gbmV4dFByb3BzLmFjdGl2ZUZpbGVQYXRoIHx8XG4gICAgICB0aGlzLnByb3BzLmZpbGVDaGFuZ2VzICE9PSBuZXh0UHJvcHMuZmlsZUNoYW5nZXNcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR290byBGaWxlJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Z290by1maWxlJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29weSBGaWxlIE5hbWUnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZpbGUtbmFtZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0NvcHkgRnVsbCBQYXRoJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpnb3RvLWZpbGUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAhPSBudWxsICYmIGZpbGVQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoZ2V0UGF0aChmaWxlUGF0aCB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1maWxlLW5hbWUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGJhc2VuYW1lKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGlmZlZpZXdUcmVlTm9kZShcbiAgICAgICAge2ZpbGVQYXRoOiBkaXJlY3RvcnkuZ2V0UGF0aCgpfSxcbiAgICAgICAgbnVsbCwgLyogbnVsbCBwYXJlbnQgZm9yIHJvb3RzICovXG4gICAgICAgIHRydWUsIC8qIGlzQ29udGFpbmVyICovXG4gICAgICAgIHRoaXMuX3Jvb3RDaGlsZHJlbkZldGNoZXIuYmluZCh0aGlzKSwgLyogcm9vdCBjaGlsZHJlbiBmZXRjaGVyICovXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnN0IHRyZWVSb290ID0gdGhpcy5yZWZzWyd0cmVlJ107XG4gICAgY29uc3Qgbm9PcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHNlbGVjdEZpbGVOb2RlID0gKCkgPT4ge1xuICAgICAgdHJlZVJvb3Quc2VsZWN0Tm9kZUtleSh0aGlzLnByb3BzLmFjdGl2ZUZpbGVQYXRoKS50aGVuKG5vT3AsIG5vT3ApO1xuICAgIH07XG4gICAgdHJlZVJvb3Quc2V0Um9vdHMocm9vdHMpLnRoZW4oc2VsZWN0RmlsZU5vZGUsIHNlbGVjdEZpbGVOb2RlKTtcbiAgfVxuXG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIFJlYWN0IGNvbXBvbmVudCBjbGFzcy5cbiAgYXN5bmMgX3Jvb3RDaGlsZHJlbkZldGNoZXIocm9vdE5vZGU6IExhenlUcmVlTm9kZSk6IFByb21pc2U8SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPj4ge1xuICAgIGNvbnN0IG5vQ2hpbGRyZW5GZXRjaGVyID0gYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IHJvb3RQYXRofSA9IHJvb3ROb2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gW107XG4gICAgY29uc3Qge3JlcG9zaXRvcnlGb3JQYXRofSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtaGctZ2l0LWJyaWRnZScpO1xuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChyb290UGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3Qgbm9kZU5hbWUgPSBgW1hdIE5vbi1NZXJjdXJpYWwgUmVwb3NpdG9yeWA7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgIG5ldyBEaWZmVmlld1RyZWVOb2RlKHtmaWxlUGF0aDogbm9kZU5hbWV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge2ZpbGVDaGFuZ2VzfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBmaWxlUGF0aHMgPSBhcnJheS5mcm9tKGZpbGVDaGFuZ2VzLmtleXMoKSlcbiAgICAgICAgLnNvcnQoKGZpbGVQYXRoMSwgZmlsZVBhdGgyKSA9PlxuICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDEpLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShcbiAgICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChyb290UGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gZmlsZUNoYW5nZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGgsIHN0YXR1c0NvZGV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEltbXV0YWJsZS5MaXN0KGNoaWxkTm9kZXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUcmVlUm9vdENvbXBvbmVudFxuICAgICAgICBpbml0aWFsUm9vdHM9e1tdfVxuICAgICAgICBldmVudEhhbmRsZXJTZWxlY3Rvcj1cIi5udWNsaWRlLWRpZmYtdmlldy10cmVlXCJcbiAgICAgICAgb25Db25maXJtU2VsZWN0aW9uPXt0aGlzLl9vbkNvbmZpcm1TZWxlY3Rpb259XG4gICAgICAgIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZT17bGFiZWxDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXtyb3dDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9ezxkaXY+Tm8gY2hhbmdlcyB0byBzaG93PC9kaXY+fVxuICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICByZWY9XCJ0cmVlXCJcbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNvbmZpcm1TZWxlY3Rpb24obm9kZTogTGF6eVRyZWVOb2RlKTogdm9pZCB7XG4gICAgY29uc3QgZW50cnk6IEZpbGVDaGFuZ2UgPSBub2RlLmdldEl0ZW0oKTtcbiAgICBpZiAoIWVudHJ5LnN0YXR1c0NvZGUgfHwgZW50cnkuZmlsZVBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuYWN0aXZhdGVGaWxlKGVudHJ5LmZpbGVQYXRoKTtcbiAgfVxufVxuIl19