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

var _require2 = require('./PanelComponentScroller');

var PanelComponentScroller = _require2.PanelComponentScroller;

var _require3 = require('react-for-atom');

var React = _require3.React;
var ReactDOM = _require3.ReactDOM;
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
      /*
       * When `true`, this component does not wrap its children in a scrolling container and instead
       * provides a simple container with visible (the default in CSS) overflow. Default: false.
       */
      noScroll: PropTypes.bool.isRequired,
      onResize: PropTypes.func.isRequired,
      overflowX: PropTypes.string
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      hidden: false,
      initialLength: 200,
      noScroll: false,
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

      var wrappedContent = undefined;
      if (this.props.noScroll) {
        wrappedContent = content;
      } else {
        wrappedContent = React.createElement(
          PanelComponentScroller,
          { overflowX: this.props.overflowX },
          content
        );
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
        wrappedContent,
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
//# sourceMappingURL=data:application/json;base64,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QUFNLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3pDOzs7U0E1TlUsY0FBYztHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IlBhbmVsQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50U2Nyb2xsZXJ9ID0gcmVxdWlyZSgnLi9QYW5lbENvbXBvbmVudFNjcm9sbGVyJyk7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBNSU5JTVVNX0xFTkdUSCA9IDEwMDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaXNSZXNpemluZzogYm9vbGVhbjtcbiAgbGVuZ3RoOiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgY29udGFpbmVyIGZvciBjZW50cmFsaXppbmcgdGhlIGxvZ2ljIGZvciBtYWtpbmcgcGFuZWxzIHNjcm9sbGFibGUsXG4gKiByZXNpemVhYmxlLCBkb2NrYWJsZSwgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF9pc01vdW50ZWQ6IGJvb2xlYW47XG4gIF9yZXNpemVTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRlOiBTdGF0ZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIGRvY2s6IFByb3BUeXBlcy5vbmVPZihbJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0J10pLmlzUmVxdWlyZWQsXG4gICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGluaXRpYWxMZW5ndGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAvKlxuICAgICAqIFdoZW4gYHRydWVgLCB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCB3cmFwIGl0cyBjaGlsZHJlbiBpbiBhIHNjcm9sbGluZyBjb250YWluZXIgYW5kIGluc3RlYWRcbiAgICAgKiBwcm92aWRlcyBhIHNpbXBsZSBjb250YWluZXIgd2l0aCB2aXNpYmxlICh0aGUgZGVmYXVsdCBpbiBDU1MpIG92ZXJmbG93LiBEZWZhdWx0OiBmYWxzZS5cbiAgICAgKi9cbiAgICBub1Njcm9sbDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvdmVyZmxvd1g6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBoaWRkZW46IGZhbHNlLFxuICAgIGluaXRpYWxMZW5ndGg6IDIwMCxcbiAgICBub1Njcm9sbDogZmFsc2UsXG4gICAgb25SZXNpemU6IHdpZHRoID0+IHt9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGlzUmVzaXppbmc6IGZhbHNlLFxuICAgICAgbGVuZ3RoOiB0aGlzLnByb3BzLmluaXRpYWxMZW5ndGgsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgbWFpbiBldmVudHMgdG8gdGhpcyBvYmplY3QuIF91cGRhdGVTaXplIGlzIG9ubHkgZXZlciBib3VuZCB3aXRoaW4gdGhlc2UuXG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURvdWJsZUNsaWNrID0gdGhpcy5faGFuZGxlRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW91c2VEb3duID0gdGhpcy5faGFuZGxlTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdXNlTW92ZSA9IHRoaXMuX2hhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3VzZVVwID0gdGhpcy5faGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICAvLyBOb3RlOiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgdmlhIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHJhdGhlciB0aGFuIGBwcm9jZXNzLm5leHRUaWNrYCBsaWtlXG4gICAgLy8gQXRvbSdzIHRyZWUtdmlldyBkb2VzIGJlY2F1c2UgdGhpcyBkb2VzIG5vdCBoYXZlIGEgZ3VhcmFudGVlIGEgcGFpbnQgd2lsbCBoYXZlIGFscmVhZHlcbiAgICAvLyBoYXBwZW5lZCB3aGVuIGBjb21wb25lbnREaWRNb3VudGAgZ2V0cyBjYWxsZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9yZXBhaW50LmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2VzIHRoZSBwb3RlbnRpYWxseSBzY3JvbGxhYmxlIHJlZ2lvbiB0byByZWRyYXcgc28gaXRzIHNjcm9sbGJhcnMgYXJlIGRyYXduIHdpdGggc3R5bGVzIGZyb21cbiAgICogdGhlIGFjdGl2ZSB0aGVtZS4gVGhpcyBtaW1pY3MgdGhlIGxvZ2luIGluIEF0b20ncyB0cmVlLXZpZXcgW2BvblN0eWxlc2hlZXRDaGFuZ2VgXVsxXS5cbiAgICpcbiAgICogWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMS41L2xpYi90cmVlLXZpZXcuY29mZmVlI0w3MjJcbiAgICovXG4gIF9yZXBhaW50KCkge1xuICAgIC8vIE5vcm1hbGx5IGFuIHVnbHkgcGF0dGVybiwgYnV0IGNhbGxzIHRvIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGNhbm5vdCBiZSBjYW5jZWxlZC4gTXVzdCBndWFyZFxuICAgIC8vIGFnYWluc3QgYW4gdW5tb3VudGVkIGNvbXBvbmVudCBoZXJlLlxuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IGlzVmlzaWJsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ3Zpc2liaWxpdHknKTtcblxuICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgIC8vIEZvcmNlIGEgcmVkcmF3IHNvIHRoZSBzY3JvbGxiYXJzIGFyZSBzdHlsZWQgY29ycmVjdGx5IGJhc2VkIG9uIHRoZSB0aGVtZVxuICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICAvLyBXZSBjcmVhdGUgYW4gb3ZlcmxheSB0byBhbHdheXMgZGlzcGxheSB0aGUgcmVzaXplIGN1cnNvciB3aGlsZSB0aGUgdXNlclxuICAgIC8vIGlzIHJlc2l6aW5nIHRoZSBwYW5lbCwgZXZlbiBpZiB0aGVpciBtb3VzZSBsZWF2ZXMgdGhlIGhhbmRsZS5cbiAgICBsZXQgcmVzaXplQ3Vyc29yT3ZlcmxheSA9IG51bGw7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNSZXNpemluZykge1xuICAgICAgcmVzaXplQ3Vyc29yT3ZlcmxheSA9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWN1cnNvci1vdmVybGF5ICR7dGhpcy5wcm9wcy5kb2NrfWB9IC8+O1xuICAgIH1cblxuICAgIGxldCBjb250YWluZXJTdHlsZTtcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnbGVmdCcgfHwgdGhpcy5wcm9wcy5kb2NrID09PSAncmlnaHQnKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgd2lkdGg6IHRoaXMuc3RhdGUubGVuZ3RoLFxuICAgICAgICBtaW5XaWR0aDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICAgIGhlaWdodDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbkhlaWdodDogTUlOSU1VTV9MRU5HVEgsXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBSZWFjdC5jbG9uZUVsZW1lbnQoXG4gICAgICBSZWFjdC5DaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pLFxuICAgICAge3JlZjogJ2NoaWxkJ30pO1xuXG4gICAgbGV0IHdyYXBwZWRDb250ZW50O1xuICAgIGlmICh0aGlzLnByb3BzLm5vU2Nyb2xsKSB7XG4gICAgICB3cmFwcGVkQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdyYXBwZWRDb250ZW50ID0gKFxuICAgICAgICA8UGFuZWxDb21wb25lbnRTY3JvbGxlciBvdmVyZmxvd1g9e3RoaXMucHJvcHMub3ZlcmZsb3dYfT5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9QYW5lbENvbXBvbmVudFNjcm9sbGVyPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgdGhlIGB0cmVlLXZpZXctcmVzaXplcmAgY2xhc3MgZnJvbSBBdG9tJ3MgW3RyZWUtdmlld11bMV0gYmVjYXVzZSBpdCBpcyB0YXJnZXRlZCBieSBzb21lXG4gICAgLy8gdGhlbWVzLCBsaWtlIFtzcGFjZWdyYXktZGFyay11aV1bMl0sIHRvIGN1c3RvbWl6ZSB0aGUgc2Nyb2xsIGJhciBpbiB0aGUgdHJlZS12aWV3LiBVc2UgdGhpc1xuICAgIC8vIGluc2lkZSBgUGFuZWxDb21wb25lbnRgIHJhdGhlciB0aGFuIGp1c3QgZmlsZS10cmVlIHNvIGFueSBzY3JvbGxhYmxlIHBhbmVscyBjcmVhdGVkIHdpdGggdGhpc1xuICAgIC8vIGNvbXBvbmVudCBhcmUgc3R5bGVkIGFjY29yZGluZ2x5LlxuICAgIC8vXG4gICAgLy8gWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMS41L2xpYi90cmVlLXZpZXcuY29mZmVlI0wyOFxuICAgIC8vIFsyXSBodHRwczovL2dpdGh1Yi5jb20vY2FubmlraW4vc3BhY2VncmF5LWRhcmstdWkvYmxvYi92MC4xMi4wL3N0eWxlcy90cmVlLXZpZXcubGVzcyNMMjFcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudCB0cmVlLXZpZXctcmVzaXplciAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICBoaWRkZW49e3RoaXMucHJvcHMuaGlkZGVufVxuICAgICAgICByZWY9XCJjb250YWluZXJcIlxuICAgICAgICBzdHlsZT17Y29udGFpbmVyU3R5bGV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXJlc2l6ZS1oYW5kbGUgJHt0aGlzLnByb3BzLmRvY2t9YH1cbiAgICAgICAgICByZWY9XCJoYW5kbGVcIlxuICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9oYW5kbGVNb3VzZURvd259XG4gICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5faGFuZGxlRG91YmxlQ2xpY2t9XG4gICAgICAgIC8+XG4gICAgICAgIHt3cmFwcGVkQ29udGVudH1cbiAgICAgICAge3Jlc2l6ZUN1cnNvck92ZXJsYXl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgcmVzaXphYmxlIGxlbmd0aC5cbiAgICpcbiAgICogRm9yIHBhbmVscyBkb2NrZWQgbGVmdCBvciByaWdodCwgdGhlIGxlbmd0aCBpcyB0aGUgd2lkdGguIEZvciBwYW5lbHNcbiAgICogZG9ja2VkIHRvcCBvciBib3R0b20sIGl0J3MgdGhlIGhlaWdodC5cbiAgICovXG4gIGdldExlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmxlbmd0aDtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY2hpbGQnXSkuZm9jdXMoKTtcbiAgfVxuXG4gIGdldENoaWxkQ29tcG9uZW50KCk6IFJlYWN0LkNvbXBvbmVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy5jaGlsZDtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpO1xuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuYWRkKHtcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpLFxuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNSZXNpemluZzogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlTW92ZShldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckVsID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjb250YWluZXInXSk7XG4gICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnKSB7XG4gICAgICBsZW5ndGggPSBldmVudC5wYWdlWCAtIGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBsZW5ndGggPSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gLSBldmVudC5wYWdlWTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBldmVudC5wYWdlWDtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlVXAoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIHRoZSBwYW5lIHRvIGZpdCBpdHMgY29udGVudHMuXG4gICAqL1xuICBfaGFuZGxlRG91YmxlQ2xpY2soKTogdm9pZCB7XG4gICAgLy8gUmVzZXQgc2l6ZSB0byAwIGFuZCByZWFkIHRoZSBjb250ZW50J3MgbmF0dXJhbCB3aWR0aCAoYWZ0ZXIgcmUtbGF5b3V0KVxuICAgIC8vIHRvIGRldGVybWluZSB0aGUgc2l6ZSB0byBzY2FsZSB0by5cbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IDB9KTtcbiAgICB0aGlzLmZvcmNlVXBkYXRlKCgpID0+IHtcbiAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgY29uc3QgY2hpbGROb2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKTtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snaGFuZGxlJ10pO1xuICAgICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnIHx8IHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBsZW5ndGggPSBjaGlsZE5vZGUub2Zmc2V0V2lkdGggKyBoYW5kbGUub2Zmc2V0V2lkdGg7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldEhlaWdodCArIGhhbmRsZS5vZmZzZXRIZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZCBkb2NrJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTaXplKGxlbmd0aCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBXaGV0aGVyIHRoaXMgaXMgd2lkdGggb3IgaGVpZ2h0IGRlcGVuZHMgb24gdGhlIG9yaWVudGF0aW9uIG9mIHRoaXMgcGFuZWwuXG4gIF91cGRhdGVTaXplKG5ld1NpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe2xlbmd0aDogbmV3U2l6ZX0pO1xuICAgIHRoaXMucHJvcHMub25SZXNpemUuY2FsbChudWxsLCBuZXdTaXplKTtcbiAgfVxufVxuIl19