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
var ReactDOM = _require.ReactDOM;
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
//# sourceMappingURL=data:application/json;base64,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T0FBTyxDQUFDLENBQUM7QUFDaEMsVUFBSSxJQUFJLEVBQUU7QUFDUixnQkFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO09BQ3JEO0tBQ0Y7OztXQXhEa0I7QUFDakIsY0FBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNyQyxhQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQ3JDOzs7O1NBSkcsaUJBQWlCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNEQvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IlJvb3ROb2RlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgPSByZXF1aXJlKCcuL0RpcmVjdG9yeUVudHJ5Q29tcG9uZW50Jyk7XG5jb25zdCBGaWxlRW50cnlDb21wb25lbnQgPSByZXF1aXJlKCcuL0ZpbGVFbnRyeUNvbXBvbmVudCcpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVOb2RlIGZyb20gJy4uL2xpYi9GaWxlVHJlZU5vZGUnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jbGFzcyBSb290Tm9kZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcm9vdE5vZGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LXRyZWUgaGFzLWNvbGxhcHNhYmxlLWNoaWxkcmVuXCI+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJOb2RlKHRoaXMucHJvcHMucm9vdE5vZGUsIDApfVxuICAgICAgPC9vbD5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlck5vZGUobm9kZTogRmlsZVRyZWVOb2RlLCBpbmRlbnRMZXZlbDogbnVtYmVyKTogQXJyYXk8UmVhY3RFbGVtZW50PiB7XG4gICAgbGV0IGVsZW1lbnRzID0gW25vZGUuaXNDb250YWluZXIgP1xuICAgICAgPERpcmVjdG9yeUVudHJ5Q29tcG9uZW50XG4gICAgICAgIGluZGVudExldmVsPXtpbmRlbnRMZXZlbH1cbiAgICAgICAgaXNFeHBhbmRlZD17bm9kZS5pc0V4cGFuZGVkKCl9XG4gICAgICAgIGlzTG9hZGluZz17bm9kZS5pc0xvYWRpbmcoKX1cbiAgICAgICAgaXNSb290PXtpbmRlbnRMZXZlbCA9PT0gMH1cbiAgICAgICAgaXNTZWxlY3RlZD17bm9kZS5pc1NlbGVjdGVkKCl9XG4gICAgICAgIHVzZVByZXZpZXdUYWJzPXtub2RlLnVzZVByZXZpZXdUYWJzKCl9XG4gICAgICAgIHZjc1N0YXR1c0NvZGU9e25vZGUuZ2V0VmNzU3RhdHVzQ29kZSgpfVxuICAgICAgICBrZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZUtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlTmFtZT17bm9kZS5ub2RlTmFtZX1cbiAgICAgICAgbm9kZVBhdGg9e25vZGUubm9kZVBhdGh9XG4gICAgICAgIHJlZj17bm9kZS5ub2RlS2V5fVxuICAgICAgICByb290S2V5PXtub2RlLnJvb3RLZXl9XG4gICAgICAvPiA6XG4gICAgICA8RmlsZUVudHJ5Q29tcG9uZW50XG4gICAgICAgIGluZGVudExldmVsPXtpbmRlbnRMZXZlbH1cbiAgICAgICAgaXNTZWxlY3RlZD17bm9kZS5pc1NlbGVjdGVkKCl9XG4gICAgICAgIHVzZVByZXZpZXdUYWJzPXtub2RlLnVzZVByZXZpZXdUYWJzKCl9XG4gICAgICAgIHZjc1N0YXR1c0NvZGU9e25vZGUuZ2V0VmNzU3RhdHVzQ29kZSgpfVxuICAgICAgICBrZXk9e25vZGUubm9kZUtleX1cbiAgICAgICAgbm9kZUtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlTmFtZT17bm9kZS5ub2RlTmFtZX1cbiAgICAgICAgbm9kZVBhdGg9e25vZGUubm9kZVBhdGh9XG4gICAgICAgIHJlZj17bm9kZS5ub2RlS2V5fVxuICAgICAgICByb290S2V5PXtub2RlLnJvb3RLZXl9XG4gICAgICAvPixcbiAgICBdO1xuICAgIGlmIChub2RlLmlzRXhwYW5kZWQoKSkge1xuICAgICAgbm9kZS5nZXRDaGlsZE5vZGVzKCkuZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICBlbGVtZW50cyA9IGVsZW1lbnRzLmNvbmNhdCh0aGlzLl9yZW5kZXJOb2RlKGNoaWxkTm9kZSwgaW5kZW50TGV2ZWwgKyAxKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnRzO1xuICB9XG5cbiAgc2Nyb2xsTm9kZUludG9WaWV3SWZOZWVkZWQobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMucmVmc1tub2RlS2V5XTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUobm9kZSkuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb3ROb2RlQ29tcG9uZW50O1xuIl19