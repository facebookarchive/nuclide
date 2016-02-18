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

exports.createOutlineViewClass = createOutlineViewClass;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function createOutlineViewClass(outlines) {
  return (function (_React$Component) {
    _inherits(OutlineView, _React$Component);

    _createClass(OutlineView, null, [{
      key: 'gadgetId',
      value: 'nuclide-outline-view',
      enumerable: true
    }, {
      key: 'defaultLocation',
      value: 'right',
      enumerable: true
    }]);

    function OutlineView(props) {
      _classCallCheck(this, OutlineView);

      _get(Object.getPrototypeOf(OutlineView.prototype), 'constructor', this).call(this, props);
      this.state = { outline: null };
    }

    _createClass(OutlineView, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        (0, _assert2['default'])(this.subscription == null);
        this.subscription = outlines.subscribe(function (outline) {
          // If the outline view has focus, we don't want to re-render anything.
          if (_this !== atom.workspace.getActivePaneItem()) {
            _this.setState({ outline: outline });
          }
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        (0, _assert2['default'])(this.subscription != null);
        this.subscription.dispose();
        this.subscription = null;
      }
    }, {
      key: 'render',
      value: function render() {
        var contents = undefined;
        if (this.state.outline == null) {
          contents = _reactForAtom.React.createElement(
            'span',
            null,
            'No outline available'
          );
        } else {
          contents = _reactForAtom.React.createElement(OutlineViewComponent, { outline: this.state.outline });
        }
        return _reactForAtom.React.createElement(
          'div',
          { className: 'pane-item padded nuclide-outline-view' },
          contents
        );
      }
    }, {
      key: 'getTitle',
      value: function getTitle() {
        return 'Outline View';
      }
    }, {
      key: 'getIconName',
      value: function getIconName() {
        return 'list-unordered';
      }
    }]);

    return OutlineView;
  })(_reactForAtom.React.Component);
}

var OutlineViewComponent = (function (_React$Component2) {
  _inherits(OutlineViewComponent, _React$Component2);

  function OutlineViewComponent() {
    _classCallCheck(this, OutlineViewComponent);

    _get(Object.getPrototypeOf(OutlineViewComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(OutlineViewComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        null,
        this.props.outline.outlineTrees.map(this._renderTree.bind(this))
      );
    }
  }, {
    key: '_renderTree',
    value: function _renderTree(outline) {
      var _this2 = this;

      var onClick = function onClick() {
        var editor = _this2.props.outline.editor;
        var pane = atom.workspace.paneForItem(editor);
        if (pane == null) {
          return;
        }
        pane.activate();
        pane.activateItem(editor);
        editor.setCursorBufferPosition(outline.startPosition);
      };
      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        _reactForAtom.React.createElement(
          'li',
          { className: 'list-nested-item' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'list-item nuclide-outline-view-item', onClick: onClick },
            outline.displayText
          ),
          outline.children.map(this._renderTree.bind(this))
        )
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      outline: _reactForAtom.React.PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return OutlineViewComponent;
})(_reactForAtom.React.Component);
//# sourceMappingURL=data:application/json;base64,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O1FBQ3ZCOztZQUFJLFNBQVMsRUFBQyxrQkFBa0I7VUFDOUI7O2NBQUssU0FBUyxFQUFDLHFDQUFxQyxFQUFDLE9BQU8sRUFBRSxPQUFPLEFBQUM7WUFDbkUsT0FBTyxDQUFDLFdBQVc7V0FDaEI7VUFDTCxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQztPQUNGLENBQ0w7S0FDSDs7O1dBakNrQjtBQUNqQixhQUFPLEVBQUUsb0JBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQzNDOzs7O1NBSEcsb0JBQW9CO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJPdXRsaW5lVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgdHlwZSB7T3V0bGluZUZvclVpLCBPdXRsaW5lVHJlZX0gZnJvbSAnLi9tYWluJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPdXRsaW5lVmlld0NsYXNzKFxuICBvdXRsaW5lczogT2JzZXJ2YWJsZTw/T3V0bGluZUZvclVpPlxuKTogdHlwZW9mIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJldHVybiBjbGFzcyBPdXRsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtb3V0bGluZS12aWV3JztcbiAgICBzdGF0aWMgZGVmYXVsdExvY2F0aW9uID0gJ3JpZ2h0JztcblxuICAgIHN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7b3V0bGluZTogbnVsbH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG91dGxpbmVzLnN1YnNjcmliZShvdXRsaW5lID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIG91dGxpbmUgdmlldyBoYXMgZm9jdXMsIHdlIGRvbid0IHdhbnQgdG8gcmUtcmVuZGVyIGFueXRoaW5nLlxuICAgICAgICBpZiAodGhpcyAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe291dGxpbmV9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gIT0gbnVsbCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgICAgbGV0IGNvbnRlbnRzO1xuICAgICAgaWYgKHRoaXMuc3RhdGUub3V0bGluZSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnRlbnRzID0gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTm8gb3V0bGluZSBhdmFpbGFibGVcbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50cyA9IChcbiAgICAgICAgICA8T3V0bGluZVZpZXdDb21wb25lbnQgb3V0bGluZT17dGhpcy5zdGF0ZS5vdXRsaW5lfSAvPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtb3V0bGluZS12aWV3XCI+XG4gICAgICAgICAge2NvbnRlbnRzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnT3V0bGluZSBWaWV3JztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdsaXN0LXVub3JkZXJlZCc7XG4gICAgfVxuICB9O1xufVxuXG5jbGFzcyBPdXRsaW5lVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgb3V0bGluZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7dGhpcy5wcm9wcy5vdXRsaW5lLm91dGxpbmVUcmVlcy5tYXAodGhpcy5fcmVuZGVyVHJlZS5iaW5kKHRoaXMpKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZShvdXRsaW5lOiBPdXRsaW5lVHJlZSk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yID0gdGhpcy5wcm9wcy5vdXRsaW5lLmVkaXRvcjtcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpO1xuICAgICAgaWYgKHBhbmUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwYW5lLmFjdGl2YXRlKCk7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG91dGxpbmUuc3RhcnRQb3NpdGlvbik7XG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtIG51Y2xpZGUtb3V0bGluZS12aWV3LWl0ZW1cIiBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICAgIHtvdXRsaW5lLmRpc3BsYXlUZXh0fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvdXRsaW5lLmNoaWxkcmVuLm1hcCh0aGlzLl9yZW5kZXJUcmVlLmJpbmQodGhpcykpfVxuICAgICAgICA8L2xpPlxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG4iXX0=