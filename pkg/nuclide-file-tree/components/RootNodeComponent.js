var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DirectoryEntryComponent = require('./DirectoryEntryComponent');
var FileEntryComponent = require('./FileEntryComponent');
var FileTreeNode = require('../lib/FileTreeNode');

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;

var _require2 = require('../../nuclide-analytics');

var track = _require2.track;
var PropTypes = React.PropTypes;
var performance = global.performance;

var RootNodeComponent = (function (_React$Component) {
  _inherits(RootNodeComponent, _React$Component);

  function RootNodeComponent() {
    _classCallCheck(this, RootNodeComponent);

    _get(Object.getPrototypeOf(RootNodeComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RootNodeComponent, [{
    key: 'render',
    value: function render() {
      var renderStart = performance.now();
      var children = this._renderNode(this.props.rootNode, 0);
      var rootNodeComponent = React.createElement(
        'ol',
        { className: 'list-tree has-collapsable-children' },
        children
      );

      track('filetree-root-node-component-render', {
        'filetree-root-node-component-render-duration': (performance.now() - renderStart).toString(),
        'filetree-root-node-component-rendered-child-count': children.length.toString()
      });

      return rootNodeComponent;
    }
  }, {
    key: '_renderNode',
    value: function _renderNode(node, indentLevel) {
      var _this = this;

      var elements = [node.isContainer ? React.createElement(DirectoryEntryComponent, {
        indentLevel: indentLevel,
        isCwd: node.isCwd(),
        isExpanded: node.isExpanded(),
        isLoading: node.isLoading(),
        isRoot: indentLevel === 0,
        isSelected: node.isSelected(),
        usePreviewTabs: node.usePreviewTabs(),
        vcsStatusCode: node.getVcsStatusCode(),
        key: node.hashKey,
        nodeKey: node.nodeKey,
        nodeName: node.nodeName,
        nodePath: node.nodePath,
        ref: node.nodeKey,
        rootKey: node.rootKey,
        checkedStatus: node.getCheckedStatus(),
        soften: node.shouldBeSoftened()
      }) : React.createElement(FileEntryComponent, {
        indentLevel: indentLevel,
        isSelected: node.isSelected(),
        usePreviewTabs: node.usePreviewTabs(),
        vcsStatusCode: node.getVcsStatusCode(),
        key: node.hashKey,
        nodeKey: node.nodeKey,
        nodeName: node.nodeName,
        nodePath: node.nodePath,
        ref: node.nodeKey,
        rootKey: node.rootKey,
        checkedStatus: node.getCheckedStatus(),
        soften: node.shouldBeSoftened()
      })];
      if (node.isExpanded()) {
        node.getChildNodes().forEach(function (childNode) {
          elements = elements.concat(_this._renderNode(childNode, indentLevel + 1));
        });
      }
      return elements;
    }
  }, {
    key: 'scrollNodeIntoViewIfNeeded',
    value: function scrollNodeIntoViewIfNeeded(nodeKey) {
      var node = this.refs[nodeKey];
      if (node) {
        ReactDOM.findDOMNode(node).scrollIntoViewIfNeeded();
      }
    }
  }], [{
    key: 'propTypes',
    value: {
      rootNode: PropTypes.object.isRequired,
      rootKey: PropTypes.string.isRequired
    },
    enumerable: true
  }]);

  return RootNodeComponent;
})(React.Component);

module.exports = RootNodeComponent;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyIsImZpbGUiOiJSb290Tm9kZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERpcmVjdG9yeUVudHJ5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaXJlY3RvcnlFbnRyeUNvbXBvbmVudCcpO1xuY29uc3QgRmlsZUVudHJ5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9GaWxlRW50cnlDb21wb25lbnQnKTtcbmNvbnN0IEZpbGVUcmVlTm9kZSA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZU5vZGUnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmNvbnN0IHtwZXJmb3JtYW5jZX0gPSBnbG9iYWw7XG5cbmNsYXNzIFJvb3ROb2RlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICByb290Tm9kZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHJvb3RLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCByZW5kZXJTdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fcmVuZGVyTm9kZSh0aGlzLnByb3BzLnJvb3ROb2RlLCAwKTtcbiAgICBjb25zdCByb290Tm9kZUNvbXBvbmVudCA9IChcbiAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LXRyZWUgaGFzLWNvbGxhcHNhYmxlLWNoaWxkcmVuXCI+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvb2w+XG4gICAgKTtcblxuICAgIHRyYWNrKCdmaWxldHJlZS1yb290LW5vZGUtY29tcG9uZW50LXJlbmRlcicsIHtcbiAgICAgICdmaWxldHJlZS1yb290LW5vZGUtY29tcG9uZW50LXJlbmRlci1kdXJhdGlvbic6IChwZXJmb3JtYW5jZS5ub3coKSAtIHJlbmRlclN0YXJ0KS50b1N0cmluZygpLFxuICAgICAgJ2ZpbGV0cmVlLXJvb3Qtbm9kZS1jb21wb25lbnQtcmVuZGVyZWQtY2hpbGQtY291bnQnOiBjaGlsZHJlbi5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICB9KTtcblxuICAgIHJldHVybiByb290Tm9kZUNvbXBvbmVudDtcbiAgfVxuXG4gIF9yZW5kZXJOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZSwgaW5kZW50TGV2ZWw6IG51bWJlcik6IEFycmF5PFJlYWN0RWxlbWVudD4ge1xuICAgIGxldCBlbGVtZW50cyA9IFtub2RlLmlzQ29udGFpbmVyID9cbiAgICAgIDxEaXJlY3RvcnlFbnRyeUNvbXBvbmVudFxuICAgICAgICBpbmRlbnRMZXZlbD17aW5kZW50TGV2ZWx9XG4gICAgICAgIGlzQ3dkPXtub2RlLmlzQ3dkKCl9XG4gICAgICAgIGlzRXhwYW5kZWQ9e25vZGUuaXNFeHBhbmRlZCgpfVxuICAgICAgICBpc0xvYWRpbmc9e25vZGUuaXNMb2FkaW5nKCl9XG4gICAgICAgIGlzUm9vdD17aW5kZW50TGV2ZWwgPT09IDB9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e25vZGUuaXNTZWxlY3RlZCgpfVxuICAgICAgICB1c2VQcmV2aWV3VGFicz17bm9kZS51c2VQcmV2aWV3VGFicygpfVxuICAgICAgICB2Y3NTdGF0dXNDb2RlPXtub2RlLmdldFZjc1N0YXR1c0NvZGUoKX1cbiAgICAgICAga2V5PXtub2RlLmhhc2hLZXl9XG4gICAgICAgIG5vZGVLZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZU5hbWU9e25vZGUubm9kZU5hbWV9XG4gICAgICAgIG5vZGVQYXRoPXtub2RlLm5vZGVQYXRofVxuICAgICAgICByZWY9e25vZGUubm9kZUtleX1cbiAgICAgICAgcm9vdEtleT17bm9kZS5yb290S2V5fVxuICAgICAgICBjaGVja2VkU3RhdHVzPXtub2RlLmdldENoZWNrZWRTdGF0dXMoKX1cbiAgICAgICAgc29mdGVuPXtub2RlLnNob3VsZEJlU29mdGVuZWQoKX1cbiAgICAgIC8+IDpcbiAgICAgIDxGaWxlRW50cnlDb21wb25lbnRcbiAgICAgICAgaW5kZW50TGV2ZWw9e2luZGVudExldmVsfVxuICAgICAgICBpc1NlbGVjdGVkPXtub2RlLmlzU2VsZWN0ZWQoKX1cbiAgICAgICAgdXNlUHJldmlld1RhYnM9e25vZGUudXNlUHJldmlld1RhYnMoKX1cbiAgICAgICAgdmNzU3RhdHVzQ29kZT17bm9kZS5nZXRWY3NTdGF0dXNDb2RlKCl9XG4gICAgICAgIGtleT17bm9kZS5oYXNoS2V5fVxuICAgICAgICBub2RlS2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVOYW1lPXtub2RlLm5vZGVOYW1lfVxuICAgICAgICBub2RlUGF0aD17bm9kZS5ub2RlUGF0aH1cbiAgICAgICAgcmVmPXtub2RlLm5vZGVLZXl9XG4gICAgICAgIHJvb3RLZXk9e25vZGUucm9vdEtleX1cbiAgICAgICAgY2hlY2tlZFN0YXR1cz17bm9kZS5nZXRDaGVja2VkU3RhdHVzKCl9XG4gICAgICAgIHNvZnRlbj17bm9kZS5zaG91bGRCZVNvZnRlbmVkKCl9XG4gICAgICAvPixcbiAgICBdO1xuICAgIGlmIChub2RlLmlzRXhwYW5kZWQoKSkge1xuICAgICAgbm9kZS5nZXRDaGlsZE5vZGVzKCkuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICBlbGVtZW50cyA9IGVsZW1lbnRzLmNvbmNhdCh0aGlzLl9yZW5kZXJOb2RlKGNoaWxkTm9kZSwgaW5kZW50TGV2ZWwgKyAxKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuICB9XG5cbiAgc2Nyb2xsTm9kZUludG9WaWV3SWZOZWVkZWQobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMucmVmc1tub2RlS2V5XTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUobm9kZSkuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb3ROb2RlQ29tcG9uZW50O1xuIl19