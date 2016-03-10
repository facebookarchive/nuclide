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

var _require2 = require('../../analytics');

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
        isExpanded: node.isExpanded(),
        isLoading: node.isLoading(),
        isRoot: indentLevel === 0,
        isSelected: node.isSelected(),
        usePreviewTabs: node.usePreviewTabs(),
        vcsStatusCode: node.getVcsStatusCode(),
        key: node.nodeKey,
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
        key: node.nodeKey,
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
//# sourceMappingURL=data:application/json;base64,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Y2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBEaXJlY3RvcnlFbnRyeUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlyZWN0b3J5RW50cnlDb21wb25lbnQnKTtcbmNvbnN0IEZpbGVFbnRyeUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRmlsZUVudHJ5Q29tcG9uZW50Jyk7XG5jb25zdCBGaWxlVHJlZU5vZGUgPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVOb2RlJyk7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3Qge3BlcmZvcm1hbmNlfSA9IGdsb2JhbDtcblxuY2xhc3MgUm9vdE5vZGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHJvb3ROb2RlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgcm9vdEtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHJlbmRlclN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9yZW5kZXJOb2RlKHRoaXMucHJvcHMucm9vdE5vZGUsIDApO1xuICAgIGNvbnN0IHJvb3ROb2RlQ29tcG9uZW50ID0gKFxuICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW5cIj5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9vbD5cbiAgICApO1xuXG4gICAgdHJhY2soJ2ZpbGV0cmVlLXJvb3Qtbm9kZS1jb21wb25lbnQtcmVuZGVyJywge1xuICAgICAgJ2ZpbGV0cmVlLXJvb3Qtbm9kZS1jb21wb25lbnQtcmVuZGVyLWR1cmF0aW9uJzogKHBlcmZvcm1hbmNlLm5vdygpIC0gcmVuZGVyU3RhcnQpLnRvU3RyaW5nKCksXG4gICAgICAnZmlsZXRyZWUtcm9vdC1ub2RlLWNvbXBvbmVudC1yZW5kZXJlZC1jaGlsZC1jb3VudCc6IGNoaWxkcmVuLmxlbmd0aC50b1N0cmluZygpLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJvb3ROb2RlQ29tcG9uZW50O1xuICB9XG5cbiAgX3JlbmRlck5vZGUobm9kZTogRmlsZVRyZWVOb2RlLCBpbmRlbnRMZXZlbDogbnVtYmVyKTogQXJyYXk8UmVhY3RFbGVtZW50PiB7XG4gICAgbGV0IGVsZW1lbnRzID0gW25vZGUuaXNDb250YWluZXIgP1xuICAgICAgPERpcmVjdG9yeUVudHJ5Q29tcG9uZW50XG4gICAgICAgIGluZGVudExldmVsPXtpbmRlbnRMZXZlbH1cbiAgICAgICAgaXNFeHBhbmRlZD17bm9kZS5pc0V4cGFuZGVkKCl9XG4gICAgICAgIGlzTG9hZGluZz17bm9kZS5pc0xvYWRpbmcoKX1cbiAgICAgICAgaXNSb290PXtpbmRlbnRMZXZlbCA9PT0gMH1cbiAgICAgICAgaXNTZWxlY3RlZD17bm9kZS5pc1NlbGVjdGVkKCl9XG4gICAgICAgIHVzZVByZXZpZXdUYWJzPXtub2RlLnVzZVByZXZpZXdUYWJzKCl9XG4gICAgICAgIHZjc1N0YXR1c0NvZGU9e25vZGUuZ2V0VmNzU3RhdHVzQ29kZSgpfVxuICAgICAgICBrZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZUtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlTmFtZT17bm9kZS5ub2RlTmFtZX1cbiAgICAgICAgbm9kZVBhdGg9e25vZGUubm9kZVBhdGh9XG4gICAgICAgIHJlZj17bm9kZS5ub2RlS2V5fVxuICAgICAgICByb290S2V5PXtub2RlLnJvb3RLZXl9XG4gICAgICAgIGNoZWNrZWRTdGF0dXM9e25vZGUuZ2V0Q2hlY2tlZFN0YXR1cygpfVxuICAgICAgICBzb2Z0ZW49e25vZGUuc2hvdWxkQmVTb2Z0ZW5lZCgpfVxuICAgICAgLz4gOlxuICAgICAgPEZpbGVFbnRyeUNvbXBvbmVudFxuICAgICAgICBpbmRlbnRMZXZlbD17aW5kZW50TGV2ZWx9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e25vZGUuaXNTZWxlY3RlZCgpfVxuICAgICAgICB1c2VQcmV2aWV3VGFicz17bm9kZS51c2VQcmV2aWV3VGFicygpfVxuICAgICAgICB2Y3NTdGF0dXNDb2RlPXtub2RlLmdldFZjc1N0YXR1c0NvZGUoKX1cbiAgICAgICAga2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVLZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZU5hbWU9e25vZGUubm9kZU5hbWV9XG4gICAgICAgIG5vZGVQYXRoPXtub2RlLm5vZGVQYXRofVxuICAgICAgICByZWY9e25vZGUubm9kZUtleX1cbiAgICAgICAgcm9vdEtleT17bm9kZS5yb290S2V5fVxuICAgICAgICBjaGVja2VkU3RhdHVzPXtub2RlLmdldENoZWNrZWRTdGF0dXMoKX1cbiAgICAgICAgc29mdGVuPXtub2RlLnNob3VsZEJlU29mdGVuZWQoKX1cbiAgICAgIC8+LFxuICAgIF07XG4gICAgaWYgKG5vZGUuaXNFeHBhbmRlZCgpKSB7XG4gICAgICBub2RlLmdldENoaWxkTm9kZXMoKS5mb3JFYWNoKGNoaWxkTm9kZSA9PiB7XG4gICAgICAgIGVsZW1lbnRzID0gZWxlbWVudHMuY29uY2F0KHRoaXMuX3JlbmRlck5vZGUoY2hpbGROb2RlLCBpbmRlbnRMZXZlbCArIDEpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudHM7XG4gIH1cblxuICBzY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5yZWZzW25vZGVLZXldO1xuICAgIGlmIChub2RlKSB7XG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZShub2RlKS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUm9vdE5vZGVDb21wb25lbnQ7XG4iXX0=