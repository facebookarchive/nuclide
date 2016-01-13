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
var React = require('react-for-atom');

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
  }]);

  return RootNodeComponent;
})(React.Component);

RootNodeComponent.propTypes = {
  rootNode: PropTypes.object.isRequired,
  rootKey: PropTypes.string.isRequired
};

module.exports = RootNodeComponent;
//# sourceMappingURL=data:application/json;base64,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VUFBSSxJQUFJLEVBQUU7QUFDUixhQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUM7T0FDbEQ7S0FDRjs7O1NBcERHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXVEL0MsaUJBQWlCLENBQUMsU0FBUyxHQUFHO0FBQzVCLFVBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDckMsU0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtDQUNyQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiUm9vdE5vZGVDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBEaXJlY3RvcnlFbnRyeUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRGlyZWN0b3J5RW50cnlDb21wb25lbnQnKTtcbmNvbnN0IEZpbGVFbnRyeUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vRmlsZUVudHJ5Q29tcG9uZW50Jyk7XG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlTm9kZSBmcm9tICcuLi9saWIvRmlsZVRyZWVOb2RlJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY2xhc3MgUm9vdE5vZGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtdHJlZSBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW5cIj5cbiAgICAgICAge3RoaXMuX3JlbmRlck5vZGUodGhpcy5wcm9wcy5yb290Tm9kZSwgMCl9XG4gICAgICA8L29sPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyTm9kZShub2RlOiBGaWxlVHJlZU5vZGUsIGluZGVudExldmVsOiBudW1iZXIpOiBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBsZXQgZWxlbWVudHMgPSBbbm9kZS5pc0NvbnRhaW5lciA/XG4gICAgICA8RGlyZWN0b3J5RW50cnlDb21wb25lbnRcbiAgICAgICAgaW5kZW50TGV2ZWw9e2luZGVudExldmVsfVxuICAgICAgICBpc0V4cGFuZGVkPXtub2RlLmlzRXhwYW5kZWQoKX1cbiAgICAgICAgaXNMb2FkaW5nPXtub2RlLmlzTG9hZGluZygpfVxuICAgICAgICBpc1Jvb3Q9e2luZGVudExldmVsID09PSAwfVxuICAgICAgICBpc1NlbGVjdGVkPXtub2RlLmlzU2VsZWN0ZWQoKX1cbiAgICAgICAgdXNlUHJldmlld1RhYnM9e25vZGUudXNlUHJldmlld1RhYnMoKX1cbiAgICAgICAgdmNzU3RhdHVzQ29kZT17bm9kZS5nZXRWY3NTdGF0dXNDb2RlKCl9XG4gICAgICAgIGtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlS2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVOYW1lPXtub2RlLm5vZGVOYW1lfVxuICAgICAgICBub2RlUGF0aD17bm9kZS5ub2RlUGF0aH1cbiAgICAgICAgcmVmPXtub2RlLm5vZGVLZXl9XG4gICAgICAgIHJvb3RLZXk9e25vZGUucm9vdEtleX1cbiAgICAgIC8+IDpcbiAgICAgIDxGaWxlRW50cnlDb21wb25lbnRcbiAgICAgICAgaW5kZW50TGV2ZWw9e2luZGVudExldmVsfVxuICAgICAgICBpc1NlbGVjdGVkPXtub2RlLmlzU2VsZWN0ZWQoKX1cbiAgICAgICAgdXNlUHJldmlld1RhYnM9e25vZGUudXNlUHJldmlld1RhYnMoKX1cbiAgICAgICAgdmNzU3RhdHVzQ29kZT17bm9kZS5nZXRWY3NTdGF0dXNDb2RlKCl9XG4gICAgICAgIGtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlS2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVOYW1lPXtub2RlLm5vZGVOYW1lfVxuICAgICAgICBub2RlUGF0aD17bm9kZS5ub2RlUGF0aH1cbiAgICAgICAgcmVmPXtub2RlLm5vZGVLZXl9XG4gICAgICAgIHJvb3RLZXk9e25vZGUucm9vdEtleX1cbiAgICAgIC8+LFxuICAgIF07XG4gICAgaWYgKG5vZGUuaXNFeHBhbmRlZCgpKSB7XG4gICAgICBub2RlLmdldENoaWxkTm9kZXMoKS5mb3JFYWNoKGNoaWxkTm9kZSA9PiB7XG4gICAgICAgIGVsZW1lbnRzID0gZWxlbWVudHMuY29uY2F0KHRoaXMuX3JlbmRlck5vZGUoY2hpbGROb2RlLCBpbmRlbnRMZXZlbCArIDEpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudHM7XG4gIH1cblxuICBzY3JvbGxOb2RlSW50b1ZpZXdJZk5lZWRlZChub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5yZWZzW25vZGVLZXldO1xuICAgIGlmIChub2RlKSB7XG4gICAgICBSZWFjdC5maW5kRE9NTm9kZShub2RlKS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gICAgfVxuICB9XG59XG5cblJvb3ROb2RlQ29tcG9uZW50LnByb3BUeXBlcyA9IHtcbiAgcm9vdE5vZGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgcm9vdEtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb290Tm9kZUNvbXBvbmVudDtcbiJdfQ==