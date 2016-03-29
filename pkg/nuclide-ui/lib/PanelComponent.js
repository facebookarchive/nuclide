Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;
var PropTypes = React.PropTypes;

var MINIMUM_LENGTH = 100;

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
      hidden: PropTypes.bool.isRequired,
      initialLength: PropTypes.number.isRequired,
      onResize: PropTypes.func.isRequired,
      overflowX: PropTypes.string
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      hidden: false,
      initialLength: 200,
      onResize: function onResize(width) {}
    },
    enumerable: true
  }]);

  function PanelComponent(props) {
    _classCallCheck(this, PanelComponent);

    _get(Object.getPrototypeOf(PanelComponent.prototype), 'constructor', this).call(this, props);
    this._isMounted = false;
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
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._isMounted = true;
      // Note: This method is called via `requestAnimationFrame` rather than `process.nextTick` like
      // Atom's tree-view does because this does not have a guarantee a paint will have already
      // happened when `componentDidMount` gets called the first time.
      window.requestAnimationFrame(this._repaint.bind(this));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._isMounted = false;
    }

    /**
     * Forces the potentially scrollable region to redraw so its scrollbars are drawn with styles from
     * the active theme. This mimics the login in Atom's tree-view [`onStylesheetChange`][1].
     *
     * [1] https://github.com/atom/tree-view/blob/v0.201.5/lib/tree-view.coffee#L722
     */
  }, {
    key: '_repaint',
    value: function _repaint() {
      // Normally an ugly pattern, but calls to `requestAnimationFrame` cannot be canceled. Must guard
      // against an unmounted component here.
      if (!this._isMounted) {
        return;
      }

      var element = ReactDOM.findDOMNode(this);
      var isVisible = window.getComputedStyle(element, null).getPropertyValue('visibility');

      if (isVisible) {
        // Force a redraw so the scrollbars are styled correctly based on the theme
        element.style.display = 'none';
        element.offsetWidth;
        element.style.display = '';
      }
    }
  }, {
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

      // Use the `tree-view-resizer` class from Atom's [tree-view][1] because it is targeted by some
      // themes, like [spacegray-dark-ui][2], to customize the scroll bar in the tree-view. Use this
      // inside `PanelComponent` rather than just file-tree so any scrollable panels created with this
      // component are styled accordingly.
      //
      // [1] https://github.com/atom/tree-view/blob/v0.201.5/lib/tree-view.coffee#L28
      // [2] https://github.com/cannikin/spacegray-dark-ui/blob/v0.12.0/styles/tree-view.less#L21
      return React.createElement(
        'div',
        {
          className: 'nuclide-ui-panel-component tree-view-resizer ' + this.props.dock,
          hidden: this.props.hidden,
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
      ReactDOM.findDOMNode(this.refs['child']).focus();
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
      var containerEl = ReactDOM.findDOMNode(this.refs['container']);
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
        var childNode = ReactDOM.findDOMNode(_this2.refs['child']);
        var handle = ReactDOM.findDOMNode(_this2.refs['handle']);
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

exports.PanelComponent = PanelComponent;
//# sourceMappingURL=data:application/json;base64,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UyIsImZpbGUiOiJQYW5lbENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IE1JTklNVU1fTEVOR1RIID0gMTAwO1xuXG50eXBlIFN0YXRlID0ge1xuICBpc1Jlc2l6aW5nOiBib29sZWFuO1xuICBsZW5ndGg6IG51bWJlcjtcbn07XG5cbi8qKlxuICogQSBjb250YWluZXIgZm9yIGNlbnRyYWxpemluZyB0aGUgbG9naWMgZm9yIG1ha2luZyBwYW5lbHMgc2Nyb2xsYWJsZSxcbiAqIHJlc2l6ZWFibGUsIGRvY2thYmxlLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYW5lbENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX2lzTW91bnRlZDogYm9vbGVhbjtcbiAgX3Jlc2l6ZVN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGU6IFN0YXRlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2hpbGRyZW46IFByb3BUeXBlcy5lbGVtZW50LmlzUmVxdWlyZWQsXG4gICAgZG9jazogUHJvcFR5cGVzLm9uZU9mKFsnbGVmdCcsICdib3R0b20nLCAncmlnaHQnXSkuaXNSZXF1aXJlZCxcbiAgICBoaWRkZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaW5pdGlhbExlbmd0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG92ZXJmbG93WDogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGhpZGRlbjogZmFsc2UsXG4gICAgaW5pdGlhbExlbmd0aDogMjAwLFxuICAgIG9uUmVzaXplOiB3aWR0aCA9PiB7fSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpc1Jlc2l6aW5nOiBmYWxzZSxcbiAgICAgIGxlbmd0aDogdGhpcy5wcm9wcy5pbml0aWFsTGVuZ3RoLFxuICAgIH07XG5cbiAgICAvLyBCaW5kIG1haW4gZXZlbnRzIHRvIHRoaXMgb2JqZWN0LiBfdXBkYXRlU2l6ZSBpcyBvbmx5IGV2ZXIgYm91bmQgd2l0aGluIHRoZXNlLlxuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEb3VibGVDbGljayA9IHRoaXMuX2hhbmRsZURvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdXNlRG93biA9IHRoaXMuX2hhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3VzZU1vdmUgPSB0aGlzLl9oYW5kbGVNb3VzZU1vdmUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW91c2VVcCA9IHRoaXMuX2hhbmRsZU1vdXNlVXAuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgLy8gTm90ZTogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHZpYSBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCByYXRoZXIgdGhhbiBgcHJvY2Vzcy5uZXh0VGlja2AgbGlrZVxuICAgIC8vIEF0b20ncyB0cmVlLXZpZXcgZG9lcyBiZWNhdXNlIHRoaXMgZG9lcyBub3QgaGF2ZSBhIGd1YXJhbnRlZSBhIHBhaW50IHdpbGwgaGF2ZSBhbHJlYWR5XG4gICAgLy8gaGFwcGVuZWQgd2hlbiBgY29tcG9uZW50RGlkTW91bnRgIGdldHMgY2FsbGVkIHRoZSBmaXJzdCB0aW1lLlxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fcmVwYWludC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX2lzTW91bnRlZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlcyB0aGUgcG90ZW50aWFsbHkgc2Nyb2xsYWJsZSByZWdpb24gdG8gcmVkcmF3IHNvIGl0cyBzY3JvbGxiYXJzIGFyZSBkcmF3biB3aXRoIHN0eWxlcyBmcm9tXG4gICAqIHRoZSBhY3RpdmUgdGhlbWUuIFRoaXMgbWltaWNzIHRoZSBsb2dpbiBpbiBBdG9tJ3MgdHJlZS12aWV3IFtgb25TdHlsZXNoZWV0Q2hhbmdlYF1bMV0uXG4gICAqXG4gICAqIFsxXSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS90cmVlLXZpZXcvYmxvYi92MC4yMDEuNS9saWIvdHJlZS12aWV3LmNvZmZlZSNMNzIyXG4gICAqL1xuICBfcmVwYWludCgpIHtcbiAgICAvLyBOb3JtYWxseSBhbiB1Z2x5IHBhdHRlcm4sIGJ1dCBjYWxscyB0byBgcmVxdWVzdEFuaW1hdGlvbkZyYW1lYCBjYW5ub3QgYmUgY2FuY2VsZWQuIE11c3QgZ3VhcmRcbiAgICAvLyBhZ2FpbnN0IGFuIHVubW91bnRlZCBjb21wb25lbnQgaGVyZS5cbiAgICBpZiAoIXRoaXMuX2lzTW91bnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBpc1Zpc2libGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCd2aXNpYmlsaXR5Jyk7XG5cbiAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAvLyBGb3JjZSBhIHJlZHJhdyBzbyB0aGUgc2Nyb2xsYmFycyBhcmUgc3R5bGVkIGNvcnJlY3RseSBiYXNlZCBvbiB0aGUgdGhlbWVcbiAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBXZSBjcmVhdGUgYW4gb3ZlcmxheSB0byBhbHdheXMgZGlzcGxheSB0aGUgcmVzaXplIGN1cnNvciB3aGlsZSB0aGUgdXNlclxuICAgIC8vIGlzIHJlc2l6aW5nIHRoZSBwYW5lbCwgZXZlbiBpZiB0aGVpciBtb3VzZSBsZWF2ZXMgdGhlIGhhbmRsZS5cbiAgICBsZXQgcmVzaXplQ3Vyc29yT3ZlcmxheSA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNSZXNpemluZykge1xuICAgICAgcmVzaXplQ3Vyc29yT3ZlcmxheSA9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWN1cnNvci1vdmVybGF5ICR7dGhpcy5wcm9wcy5kb2NrfWB9IC8+O1xuICAgIH1cblxuICAgIGxldCBjb250YWluZXJTdHlsZTtcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnbGVmdCcgfHwgdGhpcy5wcm9wcy5kb2NrID09PSAncmlnaHQnKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgd2lkdGg6IHRoaXMuc3RhdGUubGVuZ3RoLFxuICAgICAgICBtaW5XaWR0aDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICAgIGhlaWdodDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbkhlaWdodDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBSZWFjdC5jbG9uZUVsZW1lbnQoXG4gICAgICBSZWFjdC5DaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pLFxuICAgICAge3JlZjogJ2NoaWxkJ30pO1xuXG4gICAgY29uc3Qgc2Nyb2xsZXJTdHlsZSA9IHt9O1xuICAgIGlmICh0aGlzLnByb3BzLm92ZXJmbG93WCkge1xuICAgICAgc2Nyb2xsZXJTdHlsZS5vdmVyZmxvd1ggPSB0aGlzLnByb3BzLm92ZXJmbG93WDtcbiAgICB9XG5cbiAgICAvLyBVc2UgdGhlIGB0cmVlLXZpZXctcmVzaXplcmAgY2xhc3MgZnJvbSBBdG9tJ3MgW3RyZWUtdmlld11bMV0gYmVjYXVzZSBpdCBpcyB0YXJnZXRlZCBieSBzb21lXG4gICAgLy8gdGhlbWVzLCBsaWtlIFtzcGFjZWdyYXktZGFyay11aV1bMl0sIHRvIGN1c3RvbWl6ZSB0aGUgc2Nyb2xsIGJhciBpbiB0aGUgdHJlZS12aWV3LiBVc2UgdGhpc1xuICAgIC8vIGluc2lkZSBgUGFuZWxDb21wb25lbnRgIHJhdGhlciB0aGFuIGp1c3QgZmlsZS10cmVlIHNvIGFueSBzY3JvbGxhYmxlIHBhbmVscyBjcmVhdGVkIHdpdGggdGhpc1xuICAgIC8vIGNvbXBvbmVudCBhcmUgc3R5bGVkIGFjY29yZGluZ2x5LlxuICAgIC8vXG4gICAgLy8gWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMS41L2xpYi90cmVlLXZpZXcuY29mZmVlI0wyOFxuICAgIC8vIFsyXSBodHRwczovL2dpdGh1Yi5jb20vY2FubmlraW4vc3BhY2VncmF5LWRhcmstdWkvYmxvYi92MC4xMi4wL3N0eWxlcy90cmVlLXZpZXcubGVzcyNMMjFcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudCB0cmVlLXZpZXctcmVzaXplciAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICBoaWRkZW49e3RoaXMucHJvcHMuaGlkZGVufVxuICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXJlc2l6ZS1oYW5kbGUgJHt0aGlzLnByb3BzLmRvY2t9YH1cbiAgICAgICAgICByZWY9XCJoYW5kbGVcIlxuICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9oYW5kbGVNb3VzZURvd259XG4gICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5faGFuZGxlRG91YmxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtc2Nyb2xsZXJcIiBzdHlsZT17c2Nyb2xsZXJTdHlsZX0+XG4gICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7cmVzaXplQ3Vyc29yT3ZlcmxheX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCByZXNpemFibGUgbGVuZ3RoLlxuICAgKlxuICAgKiBGb3IgcGFuZWxzIGRvY2tlZCBsZWZ0IG9yIHJpZ2h0LCB0aGUgbGVuZ3RoIGlzIHRoZSB3aWR0aC4gRm9yIHBhbmVsc1xuICAgKiBkb2NrZWQgdG9wIG9yIGJvdHRvbSwgaXQncyB0aGUgaGVpZ2h0LlxuICAgKi9cbiAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKS5mb2N1cygpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb21wb25lbnQoKTogUmVhY3RDb21wb25lbnQge1xuICAgIHJldHVybiB0aGlzLnJlZnMuY2hpbGQ7XG4gIH1cblxuICBfaGFuZGxlTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKSxcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCk7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5hZGQoe1xuICAgICAgZGlzcG9zZTogKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKSxcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IHRydWV9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXJFbCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY29udGFpbmVyJ10pO1xuICAgIGxldCBsZW5ndGggPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0Jykge1xuICAgICAgbGVuZ3RoID0gZXZlbnQucGFnZVggLSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIC0gZXZlbnQucGFnZVk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGxlbmd0aCA9IGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gZXZlbnQucGFnZVg7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVNpemUobGVuZ3RoKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZVVwKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgcGFuZSB0byBmaXQgaXRzIGNvbnRlbnRzLlxuICAgKi9cbiAgX2hhbmRsZURvdWJsZUNsaWNrKCk6IHZvaWQge1xuICAgIC8vIFJlc2V0IHNpemUgdG8gMCBhbmQgcmVhZCB0aGUgY29udGVudCdzIG5hdHVyYWwgd2lkdGggKGFmdGVyIHJlLWxheW91dClcbiAgICAvLyB0byBkZXRlcm1pbmUgdGhlIHNpemUgdG8gc2NhbGUgdG8uXG4gICAgdGhpcy5zZXRTdGF0ZSh7bGVuZ3RoOiAwfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgoKSA9PiB7XG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGNvbnN0IGNoaWxkTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY2hpbGQnXSk7XG4gICAgICBjb25zdCBoYW5kbGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2hhbmRsZSddKTtcbiAgICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldFdpZHRoICsgaGFuZGxlLm9mZnNldFdpZHRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICAgIGxlbmd0aCA9IGNoaWxkTm9kZS5vZmZzZXRIZWlnaHQgKyBoYW5kbGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmhhbmRsZWQgZG9jaycpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2hldGhlciB0aGlzIGlzIHdpZHRoIG9yIGhlaWdodCBkZXBlbmRzIG9uIHRoZSBvcmllbnRhdGlvbiBvZiB0aGlzIHBhbmVsLlxuICBfdXBkYXRlU2l6ZShuZXdTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IG5ld1NpemV9KTtcbiAgICB0aGlzLnByb3BzLm9uUmVzaXplLmNhbGwobnVsbCwgbmV3U2l6ZSk7XG4gIH1cbn1cbiJdfQ==