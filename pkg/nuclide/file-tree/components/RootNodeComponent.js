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

var _require = require('react-for-atom');

var React = _require.React;
var PropTypes = React.PropTypes;

var RootNodeComponent = (function (_React$Component) {
  _inherits(RootNodeComponent, _React$Component);

  function RootNodeComponent() {
    _classCallCheck(this, RootNodeComponent);

    _get(Object.getPrototypeOf(RootNodeComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RootNodeComponent, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'ol',
        { className: 'list-tree has-collapsable-children' },
        this._renderNode(this.props.rootNode, 0)
      );
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
        rootKey: node.rootKey
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
        rootKey: node.rootKey
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
        React.findDOMNode(node).scrollIntoViewIfNeeded();
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
//# sourceMappingURL=data:application/json;base64,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LFVBQUksSUFBSSxFQUFFO0FBQ1IsYUFBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO09BQ2xEO0tBQ0Y7OztXQXhEa0I7QUFDakIsY0FBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNyQyxhQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQ3JDOzs7O1NBSkcsaUJBQWlCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNEQvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IlJvb3ROb2RlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpcmVjdG9yeUVudHJ5Q29tcG9uZW50Jyk7XG5jb25zdCBGaWxlRW50cnlDb21wb25lbnQgPSByZXF1aXJlKCcuL0ZpbGVFbnRyeUNvbXBvbmVudCcpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlTm9kZSBmcm9tICcuLi9saWIvRmlsZVRyZWVOb2RlJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY2xhc3MgUm9vdE5vZGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHJvb3ROb2RlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgcm9vdEtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlblwiPlxuICAgICAgICB7dGhpcy5fcmVuZGVyTm9kZSh0aGlzLnByb3BzLnJvb3ROb2RlLCAwKX1cbiAgICAgIDwvb2w+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZSwgaW5kZW50TGV2ZWw6IG51bWJlcik6IEFycmF5PFJlYWN0RWxlbWVudD4ge1xuICAgIGxldCBlbGVtZW50cyA9IFtub2RlLmlzQ29udGFpbmVyID9cbiAgICAgIDxEaXJlY3RvcnlFbnRyeUNvbXBvbmVudFxuICAgICAgICBpbmRlbnRMZXZlbD17aW5kZW50TGV2ZWx9XG4gICAgICAgIGlzRXhwYW5kZWQ9e25vZGUuaXNFeHBhbmRlZCgpfVxuICAgICAgICBpc0xvYWRpbmc9e25vZGUuaXNMb2FkaW5nKCl9XG4gICAgICAgIGlzUm9vdD17aW5kZW50TGV2ZWwgPT09IDB9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e25vZGUuaXNTZWxlY3RlZCgpfVxuICAgICAgICB1c2VQcmV2aWV3VGFicz17bm9kZS51c2VQcmV2aWV3VGFicygpfVxuICAgICAgICB2Y3NTdGF0dXNDb2RlPXtub2RlLmdldFZjc1N0YXR1c0NvZGUoKX1cbiAgICAgICAga2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVLZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZU5hbWU9e25vZGUubm9kZU5hbWV9XG4gICAgICAgIG5vZGVQYXRoPXtub2RlLm5vZGVQYXRofVxuICAgICAgICByZWY9e25vZGUubm9kZUtleX1cbiAgICAgICAgcm9vdEtleT17bm9kZS5yb290S2V5fVxuICAgICAgLz4gOlxuICAgICAgPEZpbGVFbnRyeUNvbXBvbmVudFxuICAgICAgICBpbmRlbnRMZXZlbD17aW5kZW50TGV2ZWx9XG4gICAgICAgIGlzU2VsZWN0ZWQ9e25vZGUuaXNTZWxlY3RlZCgpfVxuICAgICAgICB1c2VQcmV2aWV3VGFicz17bm9kZS51c2VQcmV2aWV3VGFicygpfVxuICAgICAgICB2Y3NTdGF0dXNDb2RlPXtub2RlLmdldFZjc1N0YXR1c0NvZGUoKX1cbiAgICAgICAga2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVLZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZU5hbWU9e25vZGUubm9kZU5hbWV9XG4gICAgICAgIG5vZGVQYXRoPXtub2RlLm5vZGVQYXRofVxuICAgICAgICByZWY9e25vZGUubm9kZUtleX1cbiAgICAgICAgcm9vdEtleT17bm9kZS5yb290S2V5fVxuICAgICAgLz4sXG4gICAgXTtcbiAgICBpZiAobm9kZS5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIG5vZGUuZ2V0Q2hpbGROb2RlcygpLmZvckVhY2goY2hpbGROb2RlID0+IHtcbiAgICAgICAgZWxlbWVudHMgPSBlbGVtZW50cy5jb25jYXQodGhpcy5fcmVuZGVyTm9kZShjaGlsZE5vZGUsIGluZGVudExldmVsICsgMSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50cztcbiAgfVxuXG4gIHNjcm9sbE5vZGVJbnRvVmlld0lmTmVlZGVkKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLnJlZnNbbm9kZUtleV07XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIFJlYWN0LmZpbmRET01Ob2RlKG5vZGUpLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb290Tm9kZUNvbXBvbmVudDtcbiJdfQ==