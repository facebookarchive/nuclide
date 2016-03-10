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
        atom.clipboard.write((0, _remoteUri.getPath)(filePath || ''));
      }));
      this._subscriptions.add(atom.commands.add('.nuclide-diff-view-tree .entry.file-change', 'nuclide-diff-tree:copy-file-name', function (event) {
        var filePath = (0, _utils.getFileTreePathFromTargetEvent)(event);
        atom.clipboard.write((0, _remoteUri.basename)(filePath || ''));
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

      var _require = require('../../hg-git-bridge');

      var repositoryForPath = _require.repositoryForPath;

      var repository = repositoryForPath(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        var nodeName = '[X] Non-Mercurial Repository';
        childNodes.push(new _DiffViewTreeNode2['default']({ filePath: nodeName }, rootNode, false, noChildrenFetcher));
      } else {
        var _fileChanges = this.props.fileChanges;

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
      this._subscriptions.dispose();
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
      if (!entry.statusCode || entry.filePath === this.props.activateFilePath) {
        return;
      }
      this.props.diffModel.activateFile(entry.filePath);
    }
  }]);

  return DiffViewTree;
})(_reactForAtom.React.Component);

exports['default'] = DiffViewTree;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Q0Usb0JBQVksRUFBRSxFQUFFLEFBQUM7QUFDakIsNEJBQW9CLEVBQUMseUJBQXlCO0FBQzlDLDBCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQUFBQztBQUM3Qyw2QkFBcUIsRUFBRSxxQkFBcUIsQUFBQztBQUM3QywyQkFBbUIsRUFBRSxtQkFBbUIsQUFBQztBQUN6QyxnQ0FBd0IsRUFBRTs7OztTQUE2QixBQUFDO0FBQ3hELHVCQUFlLEVBQUUsWUFBTSxFQUFFLEFBQUM7QUFDMUIsV0FBRyxFQUFDLE1BQU07UUFDVixDQUNGO0tBQ0g7OztXQUVrQiw2QkFBQyxJQUFrQixFQUFRO0FBQzVDLFVBQU0sS0FBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZFLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkQ7OztTQTFJa0IsWUFBWTtHQUFTLG9CQUFNLFNBQVM7O3FCQUFwQyxZQUFZIiwiZmlsZSI6IkRpZmZWaWV3VHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIExhenlUcmVlTm9kZSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCB0eXBlIHtGaWxlQ2hhbmdlLCBGaWxlQ2hhbmdlU3RhdHVzVmFsdWV9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgRGlmZlZpZXdNb2RlbCBmcm9tICcuL0RpZmZWaWV3TW9kZWwnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL2F0b20taGVscGVycyc7XG5pbXBvcnQge1RyZWVSb290Q29tcG9uZW50fSBmcm9tICcuLi8uLi91aS90cmVlJztcbmltcG9ydCBEaWZmVmlld1RyZWVOb2RlIGZyb20gJy4vRGlmZlZpZXdUcmVlTm9kZSc7XG5pbXBvcnQgcmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtGaWxlQ2hhbmdlU3RhdHVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtnZXRGaWxlVHJlZVBhdGhGcm9tVGFyZ2V0RXZlbnR9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtnZXRQYXRoLCBiYXNlbmFtZX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmZ1bmN0aW9uIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBjbGFzc09iaiA9IHtcbiAgICAnaWNvbic6IHRydWUsXG4gICAgJ25hbWUnOiB0cnVlLFxuICB9O1xuXG4gIGlmIChub2RlLmlzQ29udGFpbmVyKCkpIHtcbiAgICBjbGFzc09ialtgaWNvbi1maWxlLWRpcmVjdG9yeWBdID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChub2RlLmdldEl0ZW0oKS5zdGF0dXNDb2RlKSB7XG4gICAgY2xhc3NPYmpbZmlsZVR5cGVDbGFzcyhub2RlLmdldExhYmVsKCkpXSA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZXMoY2xhc3NPYmopO1xufVxuXG5mdW5jdGlvbiByb3dDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSkge1xuICBjb25zdCB2Y3NDbGFzc05hbWUgPSB2Y3NDbGFzc05hbWVGb3JFbnRyeShub2RlLmdldEl0ZW0oKSk7XG4gIHJldHVybiBjbGFzc25hbWVzKHtcbiAgICBbdmNzQ2xhc3NOYW1lXTogdmNzQ2xhc3NOYW1lLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmNzQ2xhc3NOYW1lRm9yRW50cnkoZW50cnk6IEZpbGVDaGFuZ2UpOiBzdHJpbmcge1xuICBjb25zdCBzdGF0dXNDb2RlRGVmaW5lZCA9IGVudHJ5LnN0YXR1c0NvZGUgIT0gbnVsbDtcbiAgY29uc3QgY2xhc3NPYmplY3Q6IE9iamVjdCA9IHtcbiAgICAncm9vdCc6ICFzdGF0dXNDb2RlRGVmaW5lZCxcbiAgICAnZmlsZS1jaGFuZ2UnOiBzdGF0dXNDb2RlRGVmaW5lZCxcbiAgfTtcbiAgc3dpdGNoIChlbnRyeS5zdGF0dXNDb2RlKSB7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLkFEREVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5VTlRSQUNLRUQ6XG4gICAgICBjbGFzc09iamVjdFsnc3RhdHVzLWFkZGVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBGaWxlQ2hhbmdlU3RhdHVzLk1PRElGSUVEOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1tb2RpZmllZCddID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5SRU1PVkVEOlxuICAgIGNhc2UgRmlsZUNoYW5nZVN0YXR1cy5NSVNTSU5HOlxuICAgICAgY2xhc3NPYmplY3RbJ3N0YXR1cy1yZW1vdmVkJ10gPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGNsYXNzbmFtZXMoY2xhc3NPYmplY3QpO1xufVxuXG50eXBlIFByb3BzID0ge1xuICBmaWxlQ2hhbmdlczogTWFwPE51Y2xpZGVVcmksIEZpbGVDaGFuZ2VTdGF0dXNWYWx1ZT47XG4gIGFjdGl2ZUZpbGVQYXRoOiA/TnVjbGlkZVVyaTtcbiAgZGlmZk1vZGVsOiBEaWZmVmlld01vZGVsO1xufTtcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZlZpZXdUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ29uZmlybVNlbGVjdGlvbiA9IHRoaXMuX29uQ29uZmlybVNlbGVjdGlvbi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogUHJvcHMpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5wcm9wcy5hY3RpdmVGaWxlUGF0aCAhPT0gbmV4dFByb3BzLmFjdGl2ZUZpbGVQYXRoIHx8XG4gICAgICB0aGlzLnByb3BzLmZpbGVDaGFuZ2VzICE9PSBuZXh0UHJvcHMuZmlsZUNoYW5nZXNcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZSc6IFtcbiAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR290byBGaWxlJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Z290by1maWxlJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29weSBGaWxlIE5hbWUnLFxuICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZpbGUtbmFtZScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0NvcHkgRnVsbCBQYXRoJyxcbiAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgXSxcbiAgICB9KSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpnb3RvLWZpbGUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGlmIChmaWxlUGF0aCAhPSBudWxsICYmIGZpbGVQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnLm51Y2xpZGUtZGlmZi12aWV3LXRyZWUgLmVudHJ5LmZpbGUtY2hhbmdlJyxcbiAgICAgICdudWNsaWRlLWRpZmYtdHJlZTpjb3B5LWZ1bGwtcGF0aCcsXG4gICAgICBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZ2V0RmlsZVRyZWVQYXRoRnJvbVRhcmdldEV2ZW50KGV2ZW50KTtcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoZ2V0UGF0aChmaWxlUGF0aCB8fCAnJykpO1xuICAgICAgfVxuICAgICkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJy5udWNsaWRlLWRpZmYtdmlldy10cmVlIC5lbnRyeS5maWxlLWNoYW5nZScsXG4gICAgICAnbnVjbGlkZS1kaWZmLXRyZWU6Y29weS1maWxlLW5hbWUnLFxuICAgICAgZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGdldEZpbGVUcmVlUGF0aEZyb21UYXJnZXRFdmVudChldmVudCk7XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGJhc2VuYW1lKGZpbGVQYXRoIHx8ICcnKSk7XG4gICAgICB9XG4gICAgKSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoZGlyZWN0b3J5ID0+IHtcbiAgICAgIHJldHVybiBuZXcgRGlmZlZpZXdUcmVlTm9kZShcbiAgICAgICAge2ZpbGVQYXRoOiBkaXJlY3RvcnkuZ2V0UGF0aCgpfSxcbiAgICAgICAgbnVsbCwgLyogbnVsbCBwYXJlbnQgZm9yIHJvb3RzICovXG4gICAgICAgIHRydWUsIC8qIGlzQ29udGFpbmVyICovXG4gICAgICAgIHRoaXMuX3Jvb3RDaGlsZHJlbkZldGNoZXIuYmluZCh0aGlzKSwgLyogcm9vdCBjaGlsZHJlbiBmZXRjaGVyICovXG4gICAgICApO1xuICAgIH0pO1xuICAgIGNvbnN0IHRyZWVSb290ID0gdGhpcy5yZWZzWyd0cmVlJ107XG4gICAgY29uc3Qgbm9PcCA9ICgpID0+IHt9O1xuICAgIGNvbnN0IHNlbGVjdEZpbGVOb2RlID0gKCkgPT4ge1xuICAgICAgdHJlZVJvb3Quc2VsZWN0Tm9kZUtleSh0aGlzLnByb3BzLmFjdGl2ZUZpbGVQYXRoKS50aGVuKG5vT3AsIG5vT3ApO1xuICAgIH07XG4gICAgdHJlZVJvb3Quc2V0Um9vdHMocm9vdHMpLnRoZW4oc2VsZWN0RmlsZU5vZGUsIHNlbGVjdEZpbGVOb2RlKTtcbiAgfVxuXG4gIC8vIFRPRE8obW9zdCk6IG1vdmUgYXN5bmMgY29kZSBvdXQgb2YgdGhlIFJlYWN0IGNvbXBvbmVudCBjbGFzcy5cbiAgYXN5bmMgX3Jvb3RDaGlsZHJlbkZldGNoZXIocm9vdE5vZGU6IExhenlUcmVlTm9kZSk6IFByb21pc2U8SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPj4ge1xuICAgIGNvbnN0IG5vQ2hpbGRyZW5GZXRjaGVyID0gYXN5bmMgKCkgPT4gSW1tdXRhYmxlLkxpc3Qub2YoKTtcbiAgICBjb25zdCB7ZmlsZVBhdGg6IHJvb3RQYXRofSA9IHJvb3ROb2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gW107XG4gICAgY29uc3Qge3JlcG9zaXRvcnlGb3JQYXRofSA9IHJlcXVpcmUoJy4uLy4uL2hnLWdpdC1icmlkZ2UnKTtcbiAgICBjb25zdCByZXBvc2l0b3J5ID0gcmVwb3NpdG9yeUZvclBhdGgocm9vdFBhdGgpO1xuICAgIGlmIChyZXBvc2l0b3J5ID09IG51bGwgfHwgcmVwb3NpdG9yeS5nZXRUeXBlKCkgIT09ICdoZycpIHtcbiAgICAgIGNvbnN0IG5vZGVOYW1lID0gYFtYXSBOb24tTWVyY3VyaWFsIFJlcG9zaXRvcnlgO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICBuZXcgRGlmZlZpZXdUcmVlTm9kZSh7ZmlsZVBhdGg6IG5vZGVOYW1lfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtmaWxlQ2hhbmdlc30gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgZmlsZVBhdGhzID0gYXJyYXkuZnJvbShmaWxlQ2hhbmdlcy5rZXlzKCkpXG4gICAgICAgIC5zb3J0KChmaWxlUGF0aDEsIGZpbGVQYXRoMikgPT5cbiAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgxKS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgICByZW1vdGVVcmkuYmFzZW5hbWUoZmlsZVBhdGgyKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgaWYgKGZpbGVQYXRoLnN0YXJ0c1dpdGgocm9vdFBhdGgpKSB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IGZpbGVDaGFuZ2VzLmdldChmaWxlUGF0aCk7XG4gICAgICAgICAgY2hpbGROb2Rlcy5wdXNoKFxuICAgICAgICAgICAgbmV3IERpZmZWaWV3VHJlZU5vZGUoe2ZpbGVQYXRoLCBzdGF0dXNDb2RlfSwgcm9vdE5vZGUsIGZhbHNlLCBub0NoaWxkcmVuRmV0Y2hlcilcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJbW11dGFibGUuTGlzdChjaGlsZE5vZGVzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8VHJlZVJvb3RDb21wb25lbnRcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS1kaWZmLXZpZXctdHJlZVwiXG4gICAgICAgIG9uQ29uZmlybVNlbGVjdGlvbj17dGhpcy5fb25Db25maXJtU2VsZWN0aW9ufVxuICAgICAgICBsYWJlbENsYXNzTmFtZUZvck5vZGU9e2xhYmVsQ2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgcm93Q2xhc3NOYW1lRm9yTm9kZT17cm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgZWxlbWVudFRvUmVuZGVyV2hlbkVtcHR5PXs8ZGl2Pk5vIGNoYW5nZXMgdG8gc2hvdzwvZGl2Pn1cbiAgICAgICAgb25LZWVwU2VsZWN0aW9uPXsoKSA9PiB7fX1cbiAgICAgICAgcmVmPVwidHJlZVwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfb25Db25maXJtU2VsZWN0aW9uKG5vZGU6IExhenlUcmVlTm9kZSk6IHZvaWQge1xuICAgIGNvbnN0IGVudHJ5OiBGaWxlQ2hhbmdlID0gbm9kZS5nZXRJdGVtKCk7XG4gICAgaWYgKCFlbnRyeS5zdGF0dXNDb2RlIHx8IGVudHJ5LmZpbGVQYXRoID09PSB0aGlzLnByb3BzLmFjdGl2YXRlRmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5kaWZmTW9kZWwuYWN0aXZhdGVGaWxlKGVudHJ5LmZpbGVQYXRoKTtcbiAgfVxufVxuIl19