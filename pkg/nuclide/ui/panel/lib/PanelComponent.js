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

module.exports = PanelComponent;
//# sourceMappingURL=data:application/json;base64,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QVksQ0FBQztTQUN2RCxNQUFNO0FBQ0wsZ0JBQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNuQztBQUNELGVBQUssV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzFCLENBQUMsQ0FBQztLQUNKOzs7OztXQUdVLHFCQUFDLE9BQWUsRUFBUTtBQUNqQyxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN6Qzs7O1NBcEtHLGNBQWM7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUF1SzVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IlBhbmVsQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgTUlOSU1VTV9MRU5HVEggPSAxMDA7XG5cbmNvbnN0IGVtcHR5RnVuY3Rpb24gPSAoKSA9PiB7fTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgaXNSZXNpemluZzogYm9vbGVhbjtcbiAgbGVuZ3RoOiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgY29udGFpbmVyIGZvciBjZW50cmFsaXppbmcgdGhlIGxvZ2ljIGZvciBtYWtpbmcgcGFuZWxzIHNjcm9sbGFibGUsXG4gKiByZXNpemVhYmxlLCBkb2NrYWJsZSwgZXRjLlxuICovXG5jbGFzcyBQYW5lbENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3Jlc2l6ZVN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIGRvY2s6IFByb3BUeXBlcy5vbmVPZihbJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0J10pLmlzUmVxdWlyZWQsXG4gICAgaGlkZGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGluaXRpYWxMZW5ndGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvdmVyZmxvd1g6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBoaWRkZW46IGZhbHNlLFxuICAgIGluaXRpYWxMZW5ndGg6IDIwMCxcbiAgICBvblJlc2l6ZTogZW1wdHlGdW5jdGlvbixcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpc1Jlc2l6aW5nOiBmYWxzZSxcbiAgICAgIGxlbmd0aDogdGhpcy5wcm9wcy5pbml0aWFsTGVuZ3RoLFxuICAgIH07XG5cbiAgICAvLyBCaW5kIG1haW4gZXZlbnRzIHRvIHRoaXMgb2JqZWN0LiBfdXBkYXRlU2l6ZSBpcyBvbmx5IGV2ZXIgYm91bmQgd2l0aGluIHRoZXNlLlxuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEb3VibGVDbGljayA9IHRoaXMuX2hhbmRsZURvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdXNlRG93biA9IHRoaXMuX2hhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3VzZU1vdmUgPSB0aGlzLl9oYW5kbGVNb3VzZU1vdmUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW91c2VVcCA9IHRoaXMuX2hhbmRsZU1vdXNlVXAuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFdlIGNyZWF0ZSBhbiBvdmVybGF5IHRvIGFsd2F5cyBkaXNwbGF5IHRoZSByZXNpemUgY3Vyc29yIHdoaWxlIHRoZSB1c2VyXG4gICAgLy8gaXMgcmVzaXppbmcgdGhlIHBhbmVsLCBldmVuIGlmIHRoZWlyIG1vdXNlIGxlYXZlcyB0aGUgaGFuZGxlLlxuICAgIGxldCByZXNpemVDdXJzb3JPdmVybGF5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc1Jlc2l6aW5nKSB7XG4gICAgICByZXNpemVDdXJzb3JPdmVybGF5ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1yZXNpemUtY3Vyc29yLW92ZXJsYXkgJHt0aGlzLnByb3BzLmRvY2t9YH0gLz47XG4gICAgfVxuXG4gICAgbGV0IGNvbnRhaW5lclN0eWxlO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgICB3aWR0aDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbldpZHRoOiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YXRlLmxlbmd0aCxcbiAgICAgICAgbWluSGVpZ2h0OiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IFJlYWN0LmNsb25lRWxlbWVudChcbiAgICAgIFJlYWN0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbiksXG4gICAgICB7cmVmOiAnY2hpbGQnfSk7XG5cbiAgICBjb25zdCBzY3JvbGxlclN0eWxlID0ge307XG4gICAgaWYgKHRoaXMucHJvcHMub3ZlcmZsb3dYKSB7XG4gICAgICBzY3JvbGxlclN0eWxlLm92ZXJmbG93WCA9IHRoaXMucHJvcHMub3ZlcmZsb3dYO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50ICR7dGhpcy5wcm9wcy5kb2NrfWB9XG4gICAgICAgIGhpZGRlbj17dGhpcy5wcm9wcy5oaWRkZW59XG4gICAgICAgIHJlZj1cImNvbnRhaW5lclwiXG4gICAgICAgIHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWhhbmRsZSAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICAgIHJlZj1cImhhbmRsZVwiXG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2hhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9oYW5kbGVEb3VibGVDbGlja31cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1zY3JvbGxlclwiIHN0eWxlPXtzY3JvbGxlclN0eWxlfT5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtyZXNpemVDdXJzb3JPdmVybGF5fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJlc2l6YWJsZSBsZW5ndGguXG4gICAqXG4gICAqIEZvciBwYW5lbHMgZG9ja2VkIGxlZnQgb3IgcmlnaHQsIHRoZSBsZW5ndGggaXMgdGhlIHdpZHRoLiBGb3IgcGFuZWxzXG4gICAqIGRvY2tlZCB0b3Agb3IgYm90dG9tLCBpdCdzIHRoZSBoZWlnaHQuXG4gICAqL1xuICBnZXRMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sZW5ndGg7XG4gIH1cblxuICBmb2N1cygpOiB2b2lkIHtcbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2NoaWxkJ10pLmZvY3VzKCk7XG4gIH1cblxuICBnZXRDaGlsZENvbXBvbmVudCgpOiBSZWFjdENvbXBvbmVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy5jaGlsZDtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpO1xuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuYWRkKHtcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpLFxuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNSZXNpemluZzogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlTW92ZShldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckVsID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjb250YWluZXInXSk7XG4gICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnKSB7XG4gICAgICBsZW5ndGggPSBldmVudC5wYWdlWCAtIGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBsZW5ndGggPSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gLSBldmVudC5wYWdlWTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBldmVudC5wYWdlWDtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlVXAoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIHRoZSBwYW5lIHRvIGZpdCBpdHMgY29udGVudHMuXG4gICAqL1xuICBfaGFuZGxlRG91YmxlQ2xpY2soKTogdm9pZCB7XG4gICAgLy8gUmVzZXQgc2l6ZSB0byAwIGFuZCByZWFkIHRoZSBjb250ZW50J3MgbmF0dXJhbCB3aWR0aCAoYWZ0ZXIgcmUtbGF5b3V0KVxuICAgIC8vIHRvIGRldGVybWluZSB0aGUgc2l6ZSB0byBzY2FsZSB0by5cbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IDB9KTtcbiAgICB0aGlzLmZvcmNlVXBkYXRlKCgpID0+IHtcbiAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgY29uc3QgY2hpbGROb2RlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKTtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snaGFuZGxlJ10pO1xuICAgICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnIHx8IHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBsZW5ndGggPSBjaGlsZE5vZGUub2Zmc2V0V2lkdGggKyBoYW5kbGUub2Zmc2V0V2lkdGg7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldEhlaWdodCArIGhhbmRsZS5vZmZzZXRIZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZCBkb2NrJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTaXplKGxlbmd0aCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBXaGV0aGVyIHRoaXMgaXMgd2lkdGggb3IgaGVpZ2h0IGRlcGVuZHMgb24gdGhlIG9yaWVudGF0aW9uIG9mIHRoaXMgcGFuZWwuXG4gIF91cGRhdGVTaXplKG5ld1NpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe2xlbmd0aDogbmV3U2l6ZX0pO1xuICAgIHRoaXMucHJvcHMub25SZXNpemUuY2FsbChudWxsLCBuZXdTaXplKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsQ29tcG9uZW50O1xuIl19