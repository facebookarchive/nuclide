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
//# sourceMappingURL=data:application/json;base64,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QUFNLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3pDOzs7U0E1TlUsY0FBYztHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IlBhbmVsQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1BhbmVsQ29tcG9uZW50U2Nyb2xsZXJ9ID0gcmVxdWlyZSgnLi9QYW5lbENvbXBvbmVudFNjcm9sbGVyJyk7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBNSU5JTVVNX0xFTkdUSCA9IDEwMDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaXNSZXNpemluZzogYm9vbGVhbjtcbiAgbGVuZ3RoOiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgY29udGFpbmVyIGZvciBjZW50cmFsaXppbmcgdGhlIGxvZ2ljIGZvciBtYWtpbmcgcGFuZWxzIHNjcm9sbGFibGUsXG4gKiByZXNpemVhYmxlLCBkb2NrYWJsZSwgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgUGFuZWxDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF9pc01vdW50ZWQ6IGJvb2xlYW47XG4gIF9yZXNpemVTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRlOiBTdGF0ZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIGRvY2s6IFByb3BUeXBlcy5vbmVPZihbJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0J10pLmlzUmVxdWlyZWQsXG4gICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGluaXRpYWxMZW5ndGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAvKlxuICAgICAqIFdoZW4gYHRydWVgLCB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCB3cmFwIGl0cyBjaGlsZHJlbiBpbiBhIHNjcm9sbGluZyBjb250YWluZXIgYW5kIGluc3RlYWRcbiAgICAgKiBwcm92aWRlcyBhIHNpbXBsZSBjb250YWluZXIgd2l0aCB2aXNpYmxlICh0aGUgZGVmYXVsdCBpbiBDU1MpIG92ZXJmbG93LiBEZWZhdWx0OiBmYWxzZS5cbiAgICAgKi9cbiAgICBub1Njcm9sbDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvdmVyZmxvd1g6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBoaWRkZW46IGZhbHNlLFxuICAgIGluaXRpYWxMZW5ndGg6IDIwMCxcbiAgICBub1Njcm9sbDogZmFsc2UsXG4gICAgb25SZXNpemU6IHdpZHRoID0+IHt9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGlzUmVzaXppbmc6IGZhbHNlLFxuICAgICAgbGVuZ3RoOiB0aGlzLnByb3BzLmluaXRpYWxMZW5ndGgsXG4gICAgfTtcblxuICAgIC8vIEJpbmQgbWFpbiBldmVudHMgdG8gdGhpcyBvYmplY3QuIF91cGRhdGVTaXplIGlzIG9ubHkgZXZlciBib3VuZCB3aXRoaW4gdGhlc2UuXG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURvdWJsZUNsaWNrID0gdGhpcy5faGFuZGxlRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW91c2VEb3duID0gdGhpcy5faGFuZGxlTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdXNlTW92ZSA9IHRoaXMuX2hhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3VzZVVwID0gdGhpcy5faGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gdHJ1ZTtcbiAgICAvLyBOb3RlOiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgdmlhIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIHJhdGhlciB0aGFuIGBwcm9jZXNzLm5leHRUaWNrYCBsaWtlXG4gICAgLy8gQXRvbSdzIHRyZWUtdmlldyBkb2VzIGJlY2F1c2UgdGhpcyBkb2VzIG5vdCBoYXZlIGEgZ3VhcmFudGVlIGEgcGFpbnQgd2lsbCBoYXZlIGFscmVhZHlcbiAgICAvLyBoYXBwZW5lZCB3aGVuIGBjb21wb25lbnREaWRNb3VudGAgZ2V0cyBjYWxsZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9yZXBhaW50LmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5faXNNb3VudGVkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2VzIHRoZSBwb3RlbnRpYWxseSBzY3JvbGxhYmxlIHJlZ2lvbiB0byByZWRyYXcgc28gaXRzIHNjcm9sbGJhcnMgYXJlIGRyYXduIHdpdGggc3R5bGVzIGZyb21cbiAgICogdGhlIGFjdGl2ZSB0aGVtZS4gVGhpcyBtaW1pY3MgdGhlIGxvZ2luIGluIEF0b20ncyB0cmVlLXZpZXcgW2BvblN0eWxlc2hlZXRDaGFuZ2VgXVsxXS5cbiAgICpcbiAgICogWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMS41L2xpYi90cmVlLXZpZXcuY29mZmVlI0w3MjJcbiAgICovXG4gIF9yZXBhaW50KCkge1xuICAgIC8vIE5vcm1hbGx5IGFuIHVnbHkgcGF0dGVybiwgYnV0IGNhbGxzIHRvIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGNhbm5vdCBiZSBjYW5jZWxlZC4gTXVzdCBndWFyZFxuICAgIC8vIGFnYWluc3QgYW4gdW5tb3VudGVkIGNvbXBvbmVudCBoZXJlLlxuICAgIGlmICghdGhpcy5faXNNb3VudGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IGlzVmlzaWJsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ3Zpc2liaWxpdHknKTtcblxuICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgIC8vIEZvcmNlIGEgcmVkcmF3IHNvIHRoZSBzY3JvbGxiYXJzIGFyZSBzdHlsZWQgY29ycmVjdGx5IGJhc2VkIG9uIHRoZSB0aGVtZVxuICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFdlIGNyZWF0ZSBhbiBvdmVybGF5IHRvIGFsd2F5cyBkaXNwbGF5IHRoZSByZXNpemUgY3Vyc29yIHdoaWxlIHRoZSB1c2VyXG4gICAgLy8gaXMgcmVzaXppbmcgdGhlIHBhbmVsLCBldmVuIGlmIHRoZWlyIG1vdXNlIGxlYXZlcyB0aGUgaGFuZGxlLlxuICAgIGxldCByZXNpemVDdXJzb3JPdmVybGF5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc1Jlc2l6aW5nKSB7XG4gICAgICByZXNpemVDdXJzb3JPdmVybGF5ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1yZXNpemUtY3Vyc29yLW92ZXJsYXkgJHt0aGlzLnByb3BzLmRvY2t9YH0gLz47XG4gICAgfVxuXG4gICAgbGV0IGNvbnRhaW5lclN0eWxlO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgICB3aWR0aDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbldpZHRoOiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YXRlLmxlbmd0aCxcbiAgICAgICAgbWluSGVpZ2h0OiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IFJlYWN0LmNsb25lRWxlbWVudChcbiAgICAgIFJlYWN0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbiksXG4gICAgICB7cmVmOiAnY2hpbGQnfSk7XG5cbiAgICBsZXQgd3JhcHBlZENvbnRlbnQ7XG4gICAgaWYgKHRoaXMucHJvcHMubm9TY3JvbGwpIHtcbiAgICAgIHdyYXBwZWRDb250ZW50ID0gY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgd3JhcHBlZENvbnRlbnQgPSAoXG4gICAgICAgIDxQYW5lbENvbXBvbmVudFNjcm9sbGVyIG92ZXJmbG93WD17dGhpcy5wcm9wcy5vdmVyZmxvd1h9PlxuICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICA8L1BhbmVsQ29tcG9uZW50U2Nyb2xsZXI+XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFVzZSB0aGUgYHRyZWUtdmlldy1yZXNpemVyYCBjbGFzcyBmcm9tIEF0b20ncyBbdHJlZS12aWV3XVsxXSBiZWNhdXNlIGl0IGlzIHRhcmdldGVkIGJ5IHNvbWVcbiAgICAvLyB0aGVtZXMsIGxpa2UgW3NwYWNlZ3JheS1kYXJrLXVpXVsyXSwgdG8gY3VzdG9taXplIHRoZSBzY3JvbGwgYmFyIGluIHRoZSB0cmVlLXZpZXcuIFVzZSB0aGlzXG4gICAgLy8gaW5zaWRlIGBQYW5lbENvbXBvbmVudGAgcmF0aGVyIHRoYW4ganVzdCBmaWxlLXRyZWUgc28gYW55IHNjcm9sbGFibGUgcGFuZWxzIGNyZWF0ZWQgd2l0aCB0aGlzXG4gICAgLy8gY29tcG9uZW50IGFyZSBzdHlsZWQgYWNjb3JkaW5nbHkuXG4gICAgLy9cbiAgICAvLyBbMV0gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdHJlZS12aWV3L2Jsb2IvdjAuMjAxLjUvbGliL3RyZWUtdmlldy5jb2ZmZWUjTDI4XG4gICAgLy8gWzJdIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW5uaWtpbi9zcGFjZWdyYXktZGFyay11aS9ibG9iL3YwLjEyLjAvc3R5bGVzL3RyZWUtdmlldy5sZXNzI0wyMVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50IHRyZWUtdmlldy1yZXNpemVyICR7dGhpcy5wcm9wcy5kb2NrfWB9XG4gICAgICAgIGhpZGRlbj17dGhpcy5wcm9wcy5oaWRkZW59XG4gICAgICAgIHJlZj1cImNvbnRhaW5lclwiXG4gICAgICAgIHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWhhbmRsZSAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICAgIHJlZj1cImhhbmRsZVwiXG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2hhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9oYW5kbGVEb3VibGVDbGlja31cbiAgICAgICAgLz5cbiAgICAgICAge3dyYXBwZWRDb250ZW50fVxuICAgICAgICB7cmVzaXplQ3Vyc29yT3ZlcmxheX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCByZXNpemFibGUgbGVuZ3RoLlxuICAgKlxuICAgKiBGb3IgcGFuZWxzIGRvY2tlZCBsZWZ0IG9yIHJpZ2h0LCB0aGUgbGVuZ3RoIGlzIHRoZSB3aWR0aC4gRm9yIHBhbmVsc1xuICAgKiBkb2NrZWQgdG9wIG9yIGJvdHRvbSwgaXQncyB0aGUgaGVpZ2h0LlxuICAgKi9cbiAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUubGVuZ3RoO1xuICB9XG5cbiAgZm9jdXMoKTogdm9pZCB7XG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKS5mb2N1cygpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb21wb25lbnQoKTogUmVhY3RDb21wb25lbnQge1xuICAgIHJldHVybiB0aGlzLnJlZnMuY2hpbGQ7XG4gIH1cblxuICBfaGFuZGxlTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlTW91c2VNb3ZlKSxcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCk7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5hZGQoe1xuICAgICAgZGlzcG9zZTogKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKSxcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IHRydWV9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXJFbCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY29udGFpbmVyJ10pO1xuICAgIGxldCBsZW5ndGggPSAwO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0Jykge1xuICAgICAgbGVuZ3RoID0gZXZlbnQucGFnZVggLSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tIC0gZXZlbnQucGFnZVk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGxlbmd0aCA9IGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gZXZlbnQucGFnZVg7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZVNpemUobGVuZ3RoKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZVVwKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiBmYWxzZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgcGFuZSB0byBmaXQgaXRzIGNvbnRlbnRzLlxuICAgKi9cbiAgX2hhbmRsZURvdWJsZUNsaWNrKCk6IHZvaWQge1xuICAgIC8vIFJlc2V0IHNpemUgdG8gMCBhbmQgcmVhZCB0aGUgY29udGVudCdzIG5hdHVyYWwgd2lkdGggKGFmdGVyIHJlLWxheW91dClcbiAgICAvLyB0byBkZXRlcm1pbmUgdGhlIHNpemUgdG8gc2NhbGUgdG8uXG4gICAgdGhpcy5zZXRTdGF0ZSh7bGVuZ3RoOiAwfSk7XG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgoKSA9PiB7XG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGNvbnN0IGNoaWxkTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY2hpbGQnXSk7XG4gICAgICBjb25zdCBoYW5kbGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2hhbmRsZSddKTtcbiAgICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldFdpZHRoICsgaGFuZGxlLm9mZnNldFdpZHRoO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICAgIGxlbmd0aCA9IGNoaWxkTm9kZS5vZmZzZXRIZWlnaHQgKyBoYW5kbGUub2Zmc2V0SGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmhhbmRsZWQgZG9jaycpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2hldGhlciB0aGlzIGlzIHdpZHRoIG9yIGhlaWdodCBkZXBlbmRzIG9uIHRoZSBvcmllbnRhdGlvbiBvZiB0aGlzIHBhbmVsLlxuICBfdXBkYXRlU2l6ZShuZXdTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IG5ld1NpemV9KTtcbiAgICB0aGlzLnByb3BzLm9uUmVzaXplLmNhbGwobnVsbCwgbmV3U2l6ZSk7XG4gIH1cbn1cbiJdfQ==