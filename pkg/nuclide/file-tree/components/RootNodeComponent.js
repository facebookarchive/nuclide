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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJvb3ROb2RlQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3JFLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDM0QsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O2VBSWhELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFGM0IsS0FBSyxZQUFMLEtBQUs7SUFDTCxRQUFRLFlBQVIsUUFBUTs7Z0JBRU0sT0FBTyxDQUFDLGlCQUFpQixDQUFDOztJQUFuQyxLQUFLLGFBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7SUFDVCxXQUFXLEdBQUksTUFBTSxDQUFyQixXQUFXOztJQUVaLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOzs7ZUFBakIsaUJBQWlCOztXQU1mLGtCQUFpQjtBQUNyQixVQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEMsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxRCxVQUFNLGlCQUFpQixHQUNyQjs7VUFBSSxTQUFTLEVBQUMsb0NBQW9DO1FBQy9DLFFBQVE7T0FDTixBQUNOLENBQUM7O0FBRUYsV0FBSyxDQUFDLHFDQUFxQyxFQUFFO0FBQzNDLHNEQUE4QyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQSxDQUFFLFFBQVEsRUFBRTtBQUM1RiwyREFBbUQsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtPQUNoRixDQUFDLENBQUM7O0FBRUgsYUFBTyxpQkFBaUIsQ0FBQztLQUMxQjs7O1dBRVUscUJBQUMsSUFBa0IsRUFBRSxXQUFtQixFQUF1Qjs7O0FBQ3hFLFVBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FDOUIsb0JBQUMsdUJBQXVCO0FBQ3RCLG1CQUFXLEVBQUUsV0FBVyxBQUFDO0FBQ3pCLGFBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEFBQUM7QUFDcEIsa0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEFBQUM7QUFDOUIsaUJBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEFBQUM7QUFDNUIsY0FBTSxFQUFFLFdBQVcsS0FBSyxDQUFDLEFBQUM7QUFDMUIsa0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEFBQUM7QUFDOUIsc0JBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEFBQUM7QUFDdEMscUJBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQUFBQztBQUN2QyxXQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUNsQixlQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUN0QixnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEFBQUM7QUFDeEIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDO0FBQ3hCLFdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxBQUFDO0FBQ2xCLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxBQUFDO0FBQ3RCLHFCQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEFBQUM7QUFDdkMsY0FBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxBQUFDO1FBQ2hDLEdBQ0Ysb0JBQUMsa0JBQWtCO0FBQ2pCLG1CQUFXLEVBQUUsV0FBVyxBQUFDO0FBQ3pCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxBQUFDO0FBQzlCLHNCQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxBQUFDO0FBQ3RDLHFCQUFhLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEFBQUM7QUFDdkMsV0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEFBQUM7QUFDbEIsZUFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEFBQUM7QUFDdEIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDO0FBQ3hCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQztBQUN4QixXQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUNsQixlQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQUFBQztBQUN0QixxQkFBYSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxBQUFDO0FBQ3ZDLGNBQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQUFBQztRQUNoQyxDQUNILENBQUM7QUFDRixVQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUNyQixZQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQ3hDLGtCQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUUsQ0FBQyxDQUFDO09BQ0o7QUFDRCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O1dBRXlCLG9DQUFDLE9BQWUsRUFBUTtBQUNoRCxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hDLFVBQUksSUFBSSxFQUFFO0FBQ1IsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztPQUNyRDtLQUNGOzs7V0F0RWtCO0FBQ2pCLGNBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDckMsYUFBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUNyQzs7OztTQUpHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTBFL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJSb290Tm9kZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IERpcmVjdG9yeUVudHJ5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9EaXJlY3RvcnlFbnRyeUNvbXBvbmVudCcpO1xuY29uc3QgRmlsZUVudHJ5Q29tcG9uZW50ID0gcmVxdWlyZSgnLi9GaWxlRW50cnlDb21wb25lbnQnKTtcbmNvbnN0IEZpbGVUcmVlTm9kZSA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZU5vZGUnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vYW5hbHl0aWNzJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCB7cGVyZm9ybWFuY2V9ID0gZ2xvYmFsO1xuXG5jbGFzcyBSb290Tm9kZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgcm9vdE5vZGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgcmVuZGVyU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3JlbmRlck5vZGUodGhpcy5wcm9wcy5yb290Tm9kZSwgMCk7XG4gICAgY29uc3Qgcm9vdE5vZGVDb21wb25lbnQgPSAoXG4gICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlblwiPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L29sPlxuICAgICk7XG5cbiAgICB0cmFjaygnZmlsZXRyZWUtcm9vdC1ub2RlLWNvbXBvbmVudC1yZW5kZXInLCB7XG4gICAgICAnZmlsZXRyZWUtcm9vdC1ub2RlLWNvbXBvbmVudC1yZW5kZXItZHVyYXRpb24nOiAocGVyZm9ybWFuY2Uubm93KCkgLSByZW5kZXJTdGFydCkudG9TdHJpbmcoKSxcbiAgICAgICdmaWxldHJlZS1yb290LW5vZGUtY29tcG9uZW50LXJlbmRlcmVkLWNoaWxkLWNvdW50JzogY2hpbGRyZW4ubGVuZ3RoLnRvU3RyaW5nKCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcm9vdE5vZGVDb21wb25lbnQ7XG4gIH1cblxuICBfcmVuZGVyTm9kZShub2RlOiBGaWxlVHJlZU5vZGUsIGluZGVudExldmVsOiBudW1iZXIpOiBBcnJheTxSZWFjdEVsZW1lbnQ+IHtcbiAgICBsZXQgZWxlbWVudHMgPSBbbm9kZS5pc0NvbnRhaW5lciA/XG4gICAgICA8RGlyZWN0b3J5RW50cnlDb21wb25lbnRcbiAgICAgICAgaW5kZW50TGV2ZWw9e2luZGVudExldmVsfVxuICAgICAgICBpc0N3ZD17bm9kZS5pc0N3ZCgpfVxuICAgICAgICBpc0V4cGFuZGVkPXtub2RlLmlzRXhwYW5kZWQoKX1cbiAgICAgICAgaXNMb2FkaW5nPXtub2RlLmlzTG9hZGluZygpfVxuICAgICAgICBpc1Jvb3Q9e2luZGVudExldmVsID09PSAwfVxuICAgICAgICBpc1NlbGVjdGVkPXtub2RlLmlzU2VsZWN0ZWQoKX1cbiAgICAgICAgdXNlUHJldmlld1RhYnM9e25vZGUudXNlUHJldmlld1RhYnMoKX1cbiAgICAgICAgdmNzU3RhdHVzQ29kZT17bm9kZS5nZXRWY3NTdGF0dXNDb2RlKCl9XG4gICAgICAgIGtleT17bm9kZS5oYXNoS2V5fVxuICAgICAgICBub2RlS2V5PXtub2RlLm5vZGVLZXl9XG4gICAgICAgIG5vZGVOYW1lPXtub2RlLm5vZGVOYW1lfVxuICAgICAgICBub2RlUGF0aD17bm9kZS5ub2RlUGF0aH1cbiAgICAgICAgcmVmPXtub2RlLm5vZGVLZXl9XG4gICAgICAgIHJvb3RLZXk9e25vZGUucm9vdEtleX1cbiAgICAgICAgY2hlY2tlZFN0YXR1cz17bm9kZS5nZXRDaGVja2VkU3RhdHVzKCl9XG4gICAgICAgIHNvZnRlbj17bm9kZS5zaG91bGRCZVNvZnRlbmVkKCl9XG4gICAgICAvPiA6XG4gICAgICA8RmlsZUVudHJ5Q29tcG9uZW50XG4gICAgICAgIGluZGVudExldmVsPXtpbmRlbnRMZXZlbH1cbiAgICAgICAgaXNTZWxlY3RlZD17bm9kZS5pc1NlbGVjdGVkKCl9XG4gICAgICAgIHVzZVByZXZpZXdUYWJzPXtub2RlLnVzZVByZXZpZXdUYWJzKCl9XG4gICAgICAgIHZjc1N0YXR1c0NvZGU9e25vZGUuZ2V0VmNzU3RhdHVzQ29kZSgpfVxuICAgICAgICBrZXk9e25vZGUuaGFzaEtleX1cbiAgICAgICAgbm9kZUtleT17bm9kZS5ub2RlS2V5fVxuICAgICAgICBub2RlTmFtZT17bm9kZS5ub2RlTmFtZX1cbiAgICAgICAgbm9kZVBhdGg9e25vZGUubm9kZVBhdGh9XG4gICAgICAgIHJlZj17bm9kZS5ub2RlS2V5fVxuICAgICAgICByb290S2V5PXtub2RlLnJvb3RLZXl9XG4gICAgICAgIGNoZWNrZWRTdGF0dXM9e25vZGUuZ2V0Q2hlY2tlZFN0YXR1cygpfVxuICAgICAgICBzb2Z0ZW49e25vZGUuc2hvdWxkQmVTb2Z0ZW5lZCgpfVxuICAgICAgLz4sXG4gICAgXTtcbiAgICBpZiAobm9kZS5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIG5vZGUuZ2V0Q2hpbGROb2RlcygpLmZvckVhY2goY2hpbGROb2RlID0+IHtcbiAgICAgICAgZWxlbWVudHMgPSBlbGVtZW50cy5jb25jYXQodGhpcy5fcmVuZGVyTm9kZShjaGlsZE5vZGUsIGluZGVudExldmVsICsgMSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50cztcbiAgfVxuXG4gIHNjcm9sbE5vZGVJbnRvVmlld0lmTmVlZGVkKG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLnJlZnNbbm9kZUtleV07XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKG5vZGUpLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb290Tm9kZUNvbXBvbmVudDtcbiJdfQ==