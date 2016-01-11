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

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var React = require('react-for-atom');

var PropTypes = React.PropTypes;

var MINIMUM_LENGTH = 100;

var emptyFunction = function emptyFunction() {};

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */

var PanelComponent = (function (_React$Component) {
  _inherits(PanelComponent, _React$Component);

  _createClass(PanelComponent, null, [{
    key: 'propTypes',
    value: {
      children: PropTypes.element.isRequired,
      dock: PropTypes.oneOf(['left', 'bottom', 'right']).isRequired,
      initialLength: PropTypes.number.isRequired,
      onResize: PropTypes.func.isRequired,
      overflowX: PropTypes.string
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      initialLength: 200,
      onResize: emptyFunction
    },
    enumerable: true
  }]);

  function PanelComponent(props) {
    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      isResizing: false,
      length: this.props.initialLength
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
  }

  _createClass(PanelComponent, [{
    key: 'render',
    value: function render() {
      // We create an overlay to always display the resize cursor while the user
      // is resizing the panel, even if their mouse leaves the handle.
      var resizeCursorOverlay = null;
      if (this.state.isResizing) {
        resizeCursorOverlay = React.createElement('div', { className: 'nuclide-ui-panel-component-resize-cursor-overlay ' + this.props.dock });
      }

      var containerStyle = undefined;
      if (this.props.dock === 'left' || this.props.dock === 'right') {
        containerStyle = {
          width: this.state.length,
          minWidth: MINIMUM_LENGTH
        };
      } else if (this.props.dock === 'bottom') {
        containerStyle = {
          height: this.state.length,
          minHeight: MINIMUM_LENGTH
        };
      }

      var content = React.cloneElement(React.Children.only(this.props.children), { ref: 'child' });

      var scrollerStyle = {};
      if (this.props.overflowX) {
        scrollerStyle.overflowX = this.props.overflowX;
      }

      return React.createElement(
        'div',
        {
          className: 'nuclide-ui-panel-component ' + this.props.dock,
          ref: 'container',
          style: containerStyle },
        React.createElement('div', { className: 'nuclide-ui-panel-component-resize-handle ' + this.props.dock,
          ref: 'handle',
          onMouseDown: this._handleMouseDown,
          onDoubleClick: this._handleDoubleClick
        }),
        React.createElement(
          'div',
          { className: 'nuclide-ui-panel-component-scroller', style: scrollerStyle },
          content
        ),
        resizeCursorOverlay
      );
    }

    /**
     * Returns the current resizable length.
     *
     * For panels docked left or right, the length is the width. For panels
     * docked top or bottom, it's the height.
     */
  }, {
    key: 'getLength',
    value: function getLength() {
      return this.state.length;
    }
  }, {
    key: 'focus',
    value: function focus() {
      React.findDOMNode(this.refs['child']).focus();
    }
  }, {
    key: 'getChildComponent',
    value: function getChildComponent() {
      return this.refs.child;
    }
  }, {
    key: '_handleMouseDown',
    value: function _handleMouseDown(event) {
      var _this = this;

      this._resizeSubscriptions = new CompositeDisposable();

      window.addEventListener('mousemove', this._handleMouseMove);
      this._resizeSubscriptions.add({
        dispose: function dispose() {
          return window.removeEventListener('mousemove', _this._handleMouseMove);
        }
      });

      window.addEventListener('mouseup', this._handleMouseUp);
      this._resizeSubscriptions.add({
        dispose: function dispose() {
          return window.removeEventListener('mouseup', _this._handleMouseUp);
        }
      });

      this.setState({ isResizing: true });
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      var containerEl = React.findDOMNode(this.refs['container']);
      var length = 0;
      if (this.props.dock === 'left') {
        length = event.pageX - containerEl.getBoundingClientRect().left;
      } else if (this.props.dock === 'bottom') {
        length = containerEl.getBoundingClientRect().bottom - event.pageY;
      } else if (this.props.dock === 'right') {
        length = containerEl.getBoundingClientRect().right - event.pageX;
      }
      this._updateSize(length);
    }
  }, {
    key: '_handleMouseUp',
    value: function _handleMouseUp(event) {
      if (this._resizeSubscriptions) {
        this._resizeSubscriptions.dispose();
      }
      this.setState({ isResizing: false });
    }

    /**
     * Resize the pane to fit its contents.
     */
  }, {
    key: '_handleDoubleClick',
    value: function _handleDoubleClick() {
      var _this2 = this;

      // Reset size to 0 and read the content's natural width (after re-layout)
      // to determine the size to scale to.
      this.setState({ length: 0 });
      this.forceUpdate(function () {
        var length = 0;
        var childNode = React.findDOMNode(_this2.refs['child']);
        var handle = React.findDOMNode(_this2.refs['handle']);
        if (_this2.props.dock === 'left' || _this2.props.dock === 'right') {
          length = childNode.offsetWidth + handle.offsetWidth;
        } else if (_this2.props.dock === 'bottom') {
          length = childNode.offsetHeight + handle.offsetHeight;
        } else {
          throw new Error('unhandled dock');
        }
        _this2._updateSize(length);
      });
    }

    // Whether this is width or height depends on the orientation of this panel.
  }, {
    key: '_updateSize',
    value: function _updateSize(newSize) {
      this.setState({ length: newSize });
      this.props.onResize.call(null, newSize);
    }
  }]);

  return PanelComponent;
})(React.Component);

module.exports = PanelComponent;
//# sourceMappingURL=data:application/json;base64,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QUFDakMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDekM7OztTQWhLRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBbUs1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJQYW5lbENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgTUlOSU1VTV9MRU5HVEggPSAxMDA7XG5cbmNvbnN0IGVtcHR5RnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuLyoqXG4gKiBBIGNvbnRhaW5lciBmb3IgY2VudHJhbGl6aW5nIHRoZSBsb2dpYyBmb3IgbWFraW5nIHBhbmVscyBzY3JvbGxhYmxlLFxuICogcmVzaXplYWJsZSwgZG9ja2FibGUsIGV0Yy5cbiAqL1xuY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF9yZXNpemVTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5lbGVtZW50LmlzUmVxdWlyZWQsXG4gICAgZG9jazogUHJvcFR5cGVzLm9uZU9mKFsnbGVmdCcsICdib3R0b20nLCAncmlnaHQnXSkuaXNSZXF1aXJlZCxcbiAgICBpbml0aWFsTGVuZ3RoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25SZXNpemU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb3ZlcmZsb3dYOiBQcm9wVHlwZXMuc3RyaW5nLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgaW5pdGlhbExlbmd0aDogMjAwLFxuICAgIG9uUmVzaXplOiBlbXB0eUZ1bmN0aW9uLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGlzUmVzaXppbmc6IGZhbHNlLFxuICAgICAgbGVuZ3RoOiB0aGlzLnByb3BzLmluaXRpYWxMZW5ndGgsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgbWFpbiBldmVudHMgdG8gdGhpcyBvYmplY3QuIF91cGRhdGVTaXplIGlzIG9ubHkgZXZlciBib3VuZCB3aXRoaW4gdGhlc2UuXG4gICAgdGhpcy5faGFuZGxlRG91YmxlQ2xpY2sgPSB0aGlzLl9oYW5kbGVEb3VibGVDbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZU1vdXNlRG93biA9IHRoaXMuX2hhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSA9IHRoaXMuX2hhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZU1vdXNlVXAgPSB0aGlzLl9oYW5kbGVNb3VzZVVwLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBXZSBjcmVhdGUgYW4gb3ZlcmxheSB0byBhbHdheXMgZGlzcGxheSB0aGUgcmVzaXplIGN1cnNvciB3aGlsZSB0aGUgdXNlclxuICAgIC8vIGlzIHJlc2l6aW5nIHRoZSBwYW5lbCwgZXZlbiBpZiB0aGVpciBtb3VzZSBsZWF2ZXMgdGhlIGhhbmRsZS5cbiAgICBsZXQgcmVzaXplQ3Vyc29yT3ZlcmxheSA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNSZXNpemluZykge1xuICAgICAgcmVzaXplQ3Vyc29yT3ZlcmxheSA9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWN1cnNvci1vdmVybGF5ICR7dGhpcy5wcm9wcy5kb2NrfWB9IC8+O1xuICAgIH1cblxuICAgIGxldCBjb250YWluZXJTdHlsZTtcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnbGVmdCcgfHwgdGhpcy5wcm9wcy5kb2NrID09PSAncmlnaHQnKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgd2lkdGg6IHRoaXMuc3RhdGUubGVuZ3RoLFxuICAgICAgICBtaW5XaWR0aDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICAgIGhlaWdodDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbkhlaWdodDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBSZWFjdC5jbG9uZUVsZW1lbnQoXG4gICAgICBSZWFjdC5DaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pLFxuICAgICAge3JlZjogJ2NoaWxkJ30pO1xuXG4gICAgY29uc3Qgc2Nyb2xsZXJTdHlsZSA9IHt9O1xuICAgIGlmICh0aGlzLnByb3BzLm92ZXJmbG93WCkge1xuICAgICAgc2Nyb2xsZXJTdHlsZS5vdmVyZmxvd1ggPSB0aGlzLnByb3BzLm92ZXJmbG93WDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudCAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXJlc2l6ZS1oYW5kbGUgJHt0aGlzLnByb3BzLmRvY2t9YH1cbiAgICAgICAgICByZWY9XCJoYW5kbGVcIlxuICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9oYW5kbGVNb3VzZURvd259XG4gICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5faGFuZGxlRG91YmxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtc2Nyb2xsZXJcIiBzdHlsZT17c2Nyb2xsZXJTdHlsZX0+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7cmVzaXplQ3Vyc29yT3ZlcmxheX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCByZXNpemFibGUgbGVuZ3RoLlxuICAgKlxuICAgKiBGb3IgcGFuZWxzIGRvY2tlZCBsZWZ0IG9yIHJpZ2h0LCB0aGUgbGVuZ3RoIGlzIHRoZSB3aWR0aC4gRm9yIHBhbmVsc1xuICAgKiBkb2NrZWQgdG9wIG9yIGJvdHRvbSwgaXQncyB0aGUgaGVpZ2h0LlxuICAgKi9cbiAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKS5mb2N1cygpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb21wb25lbnQoKTogUmVhY3RDb21wb25lbnQge1xuICAgIHJldHVybiB0aGlzLnJlZnMuY2hpbGQ7XG4gIH1cblxuICBfaGFuZGxlTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKSxcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCk7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5hZGQoe1xuICAgICAgZGlzcG9zZTogKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKSxcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IHRydWV9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXJFbCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snY29udGFpbmVyJ10pO1xuICAgIGxldCBsZW5ndGggPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0Jykge1xuICAgICAgbGVuZ3RoID0gZXZlbnQucGFnZVggLSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIC0gZXZlbnQucGFnZVk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGxlbmd0aCA9IGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gZXZlbnQucGFnZVg7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVNpemUobGVuZ3RoKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZVVwKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgcGFuZSB0byBmaXQgaXRzIGNvbnRlbnRzLlxuICAgKi9cbiAgX2hhbmRsZURvdWJsZUNsaWNrKCk6IHZvaWQge1xuICAgIC8vIFJlc2V0IHNpemUgdG8gMCBhbmQgcmVhZCB0aGUgY29udGVudCdzIG5hdHVyYWwgd2lkdGggKGFmdGVyIHJlLWxheW91dClcbiAgICAvLyB0byBkZXRlcm1pbmUgdGhlIHNpemUgdG8gc2NhbGUgdG8uXG4gICAgdGhpcy5zZXRTdGF0ZSh7bGVuZ3RoOiAwfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgoKSA9PiB7XG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGNvbnN0IGNoaWxkTm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snY2hpbGQnXSk7XG4gICAgICBjb25zdCBoYW5kbGUgPSBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2hhbmRsZSddKTtcbiAgICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldFdpZHRoICsgaGFuZGxlLm9mZnNldFdpZHRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICAgIGxlbmd0aCA9IGNoaWxkTm9kZS5vZmZzZXRIZWlnaHQgKyBoYW5kbGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmhhbmRsZWQgZG9jaycpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2hldGhlciB0aGlzIGlzIHdpZHRoIG9yIGhlaWdodCBkZXBlbmRzIG9uIHRoZSBvcmllbnRhdGlvbiBvZiB0aGlzIHBhbmVsLlxuICBfdXBkYXRlU2l6ZShuZXdTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IG5ld1NpemV9KTtcbiAgICB0aGlzLnByb3BzLm9uUmVzaXplLmNhbGwobnVsbCwgbmV3U2l6ZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYW5lbENvbXBvbmVudDtcbiJdfQ==