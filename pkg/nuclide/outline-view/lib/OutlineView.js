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
  // TODO(matthewwithanm): Should be subclass of `Class<React.Component>`
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
//# sourceMappingURL=data:application/json;base64,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VztRQUN2Qjs7WUFBSSxTQUFTLEVBQUMsa0JBQWtCO1VBQzlCOztjQUFLLFNBQVMsRUFBQyxxQ0FBcUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDO1lBQ25FLE9BQU8sQ0FBQyxXQUFXO1dBQ2hCO1VBQ0wsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDL0M7T0FDRixDQUNMO0tBQ0g7OztXQWpDa0I7QUFDakIsYUFBTyxFQUFFLG9CQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUMzQzs7OztTQUhHLG9CQUFvQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiT3V0bGluZVZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuaW1wb3J0IHR5cGUge091dGxpbmVGb3JVaSwgT3V0bGluZVRyZWV9IGZyb20gJy4vbWFpbic7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxudHlwZSBTdGF0ZSA9IHtcbiAgb3V0bGluZTogP09iamVjdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPdXRsaW5lVmlld0NsYXNzKFxuICBvdXRsaW5lczogT2JzZXJ2YWJsZTw/T3V0bGluZUZvclVpPlxuKTogQ2xhc3M8YW55PiB7IC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBTaG91bGQgYmUgc3ViY2xhc3Mgb2YgYENsYXNzPFJlYWN0LkNvbXBvbmVudD5gXG4gIHJldHVybiBjbGFzcyBPdXRsaW5lVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGU6IFN0YXRlO1xuXG4gICAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtb3V0bGluZS12aWV3JztcbiAgICBzdGF0aWMgZGVmYXVsdExvY2F0aW9uID0gJ3JpZ2h0JztcblxuICAgIHN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7b3V0bGluZTogbnVsbH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG91dGxpbmVzLnN1YnNjcmliZShvdXRsaW5lID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIG91dGxpbmUgdmlldyBoYXMgZm9jdXMsIHdlIGRvbid0IHdhbnQgdG8gcmUtcmVuZGVyIGFueXRoaW5nLlxuICAgICAgICBpZiAodGhpcyAhPT0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSkge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe291dGxpbmV9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5zdWJzY3JpcHRpb24gIT0gbnVsbCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgICAgbGV0IGNvbnRlbnRzO1xuICAgICAgaWYgKHRoaXMuc3RhdGUub3V0bGluZSA9PSBudWxsKSB7XG4gICAgICAgIGNvbnRlbnRzID0gKFxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgTm8gb3V0bGluZSBhdmFpbGFibGVcbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50cyA9IChcbiAgICAgICAgICA8T3V0bGluZVZpZXdDb21wb25lbnQgb3V0bGluZT17dGhpcy5zdGF0ZS5vdXRsaW5lfSAvPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtb3V0bGluZS12aWV3XCI+XG4gICAgICAgICAge2NvbnRlbnRzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnT3V0bGluZSBWaWV3JztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdsaXN0LXVub3JkZXJlZCc7XG4gICAgfVxuICB9O1xufVxuXG5jbGFzcyBPdXRsaW5lVmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgb3V0bGluZTogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7dGhpcy5wcm9wcy5vdXRsaW5lLm91dGxpbmVUcmVlcy5tYXAodGhpcy5fcmVuZGVyVHJlZS5iaW5kKHRoaXMpKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyVHJlZShvdXRsaW5lOiBPdXRsaW5lVHJlZSk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yID0gdGhpcy5wcm9wcy5vdXRsaW5lLmVkaXRvcjtcbiAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShlZGl0b3IpO1xuICAgICAgaWYgKHBhbmUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwYW5lLmFjdGl2YXRlKCk7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG91dGxpbmUuc3RhcnRQb3NpdGlvbik7XG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICA8bGkgY2xhc3NOYW1lPVwibGlzdC1uZXN0ZWQtaXRlbVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGlzdC1pdGVtIG51Y2xpZGUtb3V0bGluZS12aWV3LWl0ZW1cIiBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgICAgICAgIHtvdXRsaW5lLmRpc3BsYXlUZXh0fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvdXRsaW5lLmNoaWxkcmVuLm1hcCh0aGlzLl9yZW5kZXJUcmVlLmJpbmQodGhpcykpfVxuICAgICAgICA8L2xpPlxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG59XG4iXX0=