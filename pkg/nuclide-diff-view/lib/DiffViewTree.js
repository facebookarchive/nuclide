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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FDakYsQ0FBQztXQUNIO1NBQ0Y7T0FDRjtBQUNELGFBQU8sdUJBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFbUIsZ0NBQVM7QUFDM0IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1dBRUssa0JBQUc7QUFDUCxhQUNFO0FBQ0Usb0JBQVksRUFBRSxFQUFFLEFBQUM7QUFDakIsNEJBQW9CLEVBQUMseUJBQXlCO0FBQzlDLDBCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQUFBQztBQUM3Qyw2QkFBcUIsRUFBRSxxQkFBcUIsQUFBQztBQUM3QywyQkFBbUIsRUFBRSxtQkFBbUIsQUFBQztBQUN6QyxnQ0FBd0IsRUFBRTs7OztTQUE2QixBQUFDO0FBQ3hELHVCQUFlLEVBQUUsWUFBTSxFQUFFLEFBQUM7QUFDMUIsV0FBRyxFQUFDLE1BQU07UUFDVixDQUNGO0tBQ0g7OztXQUVrQiw2QkFBQyxJQUFrQixFQUFRO0FBQzVDLFVBQU0sS0FBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRTtBQUNyRSxlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7S0FDekQ7OztTQWxKa0IsWUFBWTtHQUFTLG9CQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6IkRpZmZWaWV3VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtMYXp5VHJlZU5vZGV9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0xhenlUcmVlTm9kZSc7XG5pbXBvcnQgdHlwZSB7RmlsZUNoYW5nZSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIERpZmZWaWV3TW9kZWwgZnJvbSAnLi9EaWZmVmlld01vZGVsJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7VHJlZVJvb3RDb21wb25lbnR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL1RyZWVSb290Q29tcG9uZW50JztcbmltcG9ydCBEaWZmVmlld1RyZWVOb2RlIGZyb20gJy4vRGlmZlZpZXdUcmVlTm9kZSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge0ZpbGVDaGFuZ2VTdGF0dXN9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7Z2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50fSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0UGF0aCwgYmFzZW5hbWV9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuXG5mdW5jdGlvbiBsYWJlbENsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogc3RyaW5nIHtcbiAgY29uc3QgY2xhc3NPYmogPSB7XG4gICAgJ2ljb24nOiB0cnVlLFxuICAgICduYW1lJzogdHJ1ZSxcbiAgfTtcblxuICBpZiAobm9kZS5pc0NvbnRhaW5lcigpKSB7XG4gICAgY2xhc3NPYmpbYGljb24tZmlsZS1kaXJlY3RvcnlgXSA9IHRydWU7XG4gIH0gZWxzZSBpZiAobm9kZS5nZXRJdGVtKCkuc3RhdHVzQ29kZSkge1xuICAgIGNsYXNzT2JqW2ZpbGVUeXBlQ2xhc3Mobm9kZS5nZXRMYWJlbCgpKV0gPSB0cnVlO1xuICB9XG4gIHJldHVybiBjbGFzc25hbWVzKGNsYXNzT2JqKTtcbn1cblxuZnVuY3Rpb24gcm93Q2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpIHtcbiAgY29uc3QgdmNzQ2xhc3NOYW1lID0gdmNzQ2xhc3NOYW1lRm9yRW50cnkobm9kZS5nZXRJdGVtKCkpO1xuICByZXR1cm4gY2xhc3NuYW1lcyh7XG4gICAgW3Zjc0NsYXNzTmFtZV06IHZjc0NsYXNzTmFtZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHZjc0NsYXNzTmFtZUZvckVudHJ5KGVudHJ5OiBGaWxlQ2hhbmdlKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RhdHVzQ29kZURlZmluZWQgPSBlbnRyeS5zdGF0dXNDb2RlICE9IG51bGw7XG4gIGNvbnN0IGNsYXNzT2JqZWN0OiBPYmplY3QgPSB7XG4gICAgJ3Jvb3QnOiAhc3RhdHVzQ29kZURlZmluZWQsXG4gICAgJ2ZpbGUtY2hhbmdlJzogc3RhdHVzQ29kZURlZmluZWQsXG4gIH07XG4gIHN3aXRjaCAoZW50cnkuc3RhdHVzQ29kZSkge1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5BRERFRDpcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuVU5UUkFDS0VEOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1hZGRlZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NT0RJRklFRDpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtbW9kaWZpZWQnXSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuUkVNT1ZFRDpcbiAgICBjYXNlIEZpbGVDaGFuZ2VTdGF0dXMuTUlTU0lORzpcbiAgICAgIGNsYXNzT2JqZWN0WydzdGF0dXMtcmVtb3ZlZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBjbGFzc25hbWVzKGNsYXNzT2JqZWN0KTtcbn1cblxudHlwZSBQcm9wcyA9IHtcbiAgYWN0aXZlRmlsZVBhdGg6ID9OdWNsaWRlVXJpO1xuICBkaWZmTW9kZWw6IERpZmZWaWV3TW9kZWw7XG4gIGZpbGVDaGFuZ2VzOiBNYXA8TnVjbGlkZVVyaSwgRmlsZUNoYW5nZVN0YXR1c1ZhbHVlPjtcbiAgc2hvd05vbkhnUmVwb3M6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmVmlld1RyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNvbmZpcm1TZWxlY3Rpb24gPSB0aGlzLl9vbkNvbmZpcm1TZWxlY3Rpb24uYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IFByb3BzKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucHJvcHMuYWN0aXZlRmlsZVBhdGggIT09IG5leHRQcm9wcy5hY3RpdmVGaWxlUGF0aCB8fFxuICAgICAgdGhpcy5wcm9wcy5maWxlQ2hhbmdlcyAhPT0gbmV4dFByb3BzLmZpbGVDaGFuZ2VzXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnOiBbXG4gICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0dvdG8gRmlsZScsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi10cmVlOmdvdG8tZmlsZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0NvcHkgRmlsZSBOYW1lJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1maWxlLW5hbWUnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdDb3B5IEZ1bGwgUGF0aCcsXG4gICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZnVsbC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgIF0sXG4gICAgfSkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXRyZWU6Z290by1maWxlJyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCAmJiBmaWxlUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGdldFBhdGgoZmlsZVBhdGggfHwgJycpKTtcbiAgICAgIH1cbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICcubnVjbGlkZS1kaWZmLXZpZXctdHJlZSAuZW50cnkuZmlsZS1jaGFuZ2UnLFxuICAgICAgJ251Y2xpZGUtZGlmZi10cmVlOmNvcHktZmlsZS1uYW1lJyxcbiAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnQoZXZlbnQpO1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShiYXNlbmFtZShmaWxlUGF0aCB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3RzID0gYXJyYXkuY29tcGFjdChcbiAgICAgIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4ge1xuICAgICAgICBjb25zdCByb290UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChyb290UGF0aCk7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5zaG93Tm9uSGdSZXBvcyAmJiAocmVwb3NpdG9yeSA9PSBudWxsIHx8IHJlcG9zaXRvcnkuZ2V0VHlwZSgpICE9PSAnaGcnKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgRGlmZlZpZXdUcmVlTm9kZShcbiAgICAgICAgICB7ZmlsZVBhdGg6IHJvb3RQYXRofSxcbiAgICAgICAgICBudWxsLCAvKiBudWxsIHBhcmVudCBmb3Igcm9vdHMgKi9cbiAgICAgICAgICB0cnVlLCAvKiBpc0NvbnRhaW5lciAqL1xuICAgICAgICAgIHRoaXMuX3Jvb3RDaGlsZHJlbkZldGNoZXIuYmluZCh0aGlzKSwgLyogcm9vdCBjaGlsZHJlbiBmZXRjaGVyICovXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICk7XG4gICAgY29uc3QgdHJlZVJvb3QgPSB0aGlzLnJlZnNbJ3RyZWUnXTtcbiAgICBjb25zdCBub09wID0gKCkgPT4ge307XG4gICAgY29uc3Qgc2VsZWN0RmlsZU5vZGUgPSAoKSA9PiB7XG4gICAgICB0cmVlUm9vdC5zZWxlY3ROb2RlS2V5KHRoaXMucHJvcHMuYWN0aXZlRmlsZVBhdGgpLnRoZW4obm9PcCwgbm9PcCk7XG4gICAgfTtcbiAgICB0cmVlUm9vdC5zZXRSb290cyhyb290cykudGhlbihzZWxlY3RGaWxlTm9kZSwgc2VsZWN0RmlsZU5vZGUpO1xuICB9XG5cbiAgLy8gVE9ETyhtb3N0KTogbW92ZSBhc3luYyBjb2RlIG91dCBvZiB0aGUgUmVhY3QgY29tcG9uZW50IGNsYXNzLlxuICBhc3luYyBfcm9vdENoaWxkcmVuRmV0Y2hlcihyb290Tm9kZTogTGF6eVRyZWVOb2RlKTogUHJvbWlzZTxJbW11dGFibGUuTGlzdDxMYXp5VHJlZU5vZGU+PiB7XG4gICAgY29uc3Qgbm9DaGlsZHJlbkZldGNoZXIgPSBhc3luYyAoKSA9PiBJbW11dGFibGUuTGlzdC5vZigpO1xuICAgIGNvbnN0IHtmaWxlUGF0aDogcm9vdFBhdGh9ID0gcm9vdE5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBbXTtcblxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChyb290UGF0aCk7XG4gICAgaWYgKHJlcG9zaXRvcnkgPT0gbnVsbCB8fCByZXBvc2l0b3J5LmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgY29uc3Qgbm9kZU5hbWUgPSBgW1hdIE5vbi1NZXJjdXJpYWwgUmVwb3NpdG9yeWA7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgIG5ldyBEaWZmVmlld1RyZWVOb2RlKHtmaWxlUGF0aDogbm9kZU5hbWV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge2ZpbGVDaGFuZ2VzfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBmaWxlUGF0aHMgPSBhcnJheS5mcm9tKGZpbGVDaGFuZ2VzLmtleXMoKSlcbiAgICAgICAgLnNvcnQoKGZpbGVQYXRoMSwgZmlsZVBhdGgyKSA9PlxuICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDEpLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShcbiAgICAgICAgICAgIHJlbW90ZVVyaS5iYXNlbmFtZShmaWxlUGF0aDIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChyb290UGF0aCkpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gZmlsZUNoYW5nZXMuZ2V0KGZpbGVQYXRoKTtcbiAgICAgICAgICBjaGlsZE5vZGVzLnB1c2goXG4gICAgICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGgsIHN0YXR1c0NvZGV9LCByb290Tm9kZSwgZmFsc2UsIG5vQ2hpbGRyZW5GZXRjaGVyKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEltbXV0YWJsZS5MaXN0KGNoaWxkTm9kZXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUcmVlUm9vdENvbXBvbmVudFxuICAgICAgICBpbml0aWFsUm9vdHM9e1tdfVxuICAgICAgICBldmVudEhhbmRsZXJTZWxlY3Rvcj1cIi5udWNsaWRlLWRpZmYtdmlldy10cmVlXCJcbiAgICAgICAgb25Db25maXJtU2VsZWN0aW9uPXt0aGlzLl9vbkNvbmZpcm1TZWxlY3Rpb259XG4gICAgICAgIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZT17bGFiZWxDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXtyb3dDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9ezxkaXY+Tm8gY2hhbmdlcyB0byBzaG93PC9kaXY+fVxuICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICByZWY9XCJ0cmVlXCJcbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNvbmZpcm1TZWxlY3Rpb24obm9kZTogTGF6eVRyZWVOb2RlKTogdm9pZCB7XG4gICAgY29uc3QgZW50cnk6IEZpbGVDaGFuZ2UgPSBub2RlLmdldEl0ZW0oKTtcbiAgICBpZiAoIWVudHJ5LnN0YXR1c0NvZGUgfHwgZW50cnkuZmlsZVBhdGggPT09IHRoaXMucHJvcHMuYWN0aXZlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuZGlmZkVudGl0eSh7ZmlsZTogZW50cnkuZmlsZVBhdGh9KTtcbiAgfVxufVxuIl19