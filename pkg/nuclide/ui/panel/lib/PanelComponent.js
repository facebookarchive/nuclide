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
//# sourceMappingURL=data:application/json;base64,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V0FHVSxxQkFBQyxPQUFlLEVBQVE7QUFDakMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDekM7OztTQWhLRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBbUs1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJQYW5lbENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IE1JTklNVU1fTEVOR1RIID0gMTAwO1xuXG5jb25zdCBlbXB0eUZ1bmN0aW9uID0gKCkgPT4ge307XG5cbi8qKlxuICogQSBjb250YWluZXIgZm9yIGNlbnRyYWxpemluZyB0aGUgbG9naWMgZm9yIG1ha2luZyBwYW5lbHMgc2Nyb2xsYWJsZSxcbiAqIHJlc2l6ZWFibGUsIGRvY2thYmxlLCBldGMuXG4gKi9cbmNsYXNzIFBhbmVsQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfcmVzaXplU3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIGRvY2s6IFByb3BUeXBlcy5vbmVPZihbJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0J10pLmlzUmVxdWlyZWQsXG4gICAgaW5pdGlhbExlbmd0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uUmVzaXplOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG92ZXJmbG93WDogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGluaXRpYWxMZW5ndGg6IDIwMCxcbiAgICBvblJlc2l6ZTogZW1wdHlGdW5jdGlvbixcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpc1Jlc2l6aW5nOiBmYWxzZSxcbiAgICAgIGxlbmd0aDogdGhpcy5wcm9wcy5pbml0aWFsTGVuZ3RoLFxuICAgIH07XG5cbiAgICAvLyBCaW5kIG1haW4gZXZlbnRzIHRvIHRoaXMgb2JqZWN0LiBfdXBkYXRlU2l6ZSBpcyBvbmx5IGV2ZXIgYm91bmQgd2l0aGluIHRoZXNlLlxuICAgIHRoaXMuX2hhbmRsZURvdWJsZUNsaWNrID0gdGhpcy5faGFuZGxlRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVNb3VzZURvd24gPSB0aGlzLl9oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVNb3VzZU1vdmUgPSB0aGlzLl9oYW5kbGVNb3VzZU1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVNb3VzZVVwID0gdGhpcy5faGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gV2UgY3JlYXRlIGFuIG92ZXJsYXkgdG8gYWx3YXlzIGRpc3BsYXkgdGhlIHJlc2l6ZSBjdXJzb3Igd2hpbGUgdGhlIHVzZXJcbiAgICAvLyBpcyByZXNpemluZyB0aGUgcGFuZWwsIGV2ZW4gaWYgdGhlaXIgbW91c2UgbGVhdmVzIHRoZSBoYW5kbGUuXG4gICAgbGV0IHJlc2l6ZUN1cnNvck92ZXJsYXkgPSBudWxsO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzUmVzaXppbmcpIHtcbiAgICAgIHJlc2l6ZUN1cnNvck92ZXJsYXkgPVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXJlc2l6ZS1jdXJzb3Itb3ZlcmxheSAke3RoaXMucHJvcHMuZG9ja31gfSAvPjtcbiAgICB9XG5cbiAgICBsZXQgY29udGFpbmVyU3R5bGU7XG4gICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnIHx8IHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgY29udGFpbmVyU3R5bGUgPSB7XG4gICAgICAgIHdpZHRoOiB0aGlzLnN0YXRlLmxlbmd0aCxcbiAgICAgICAgbWluV2lkdGg6IE1JTklNVU1fTEVOR1RILFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgICBoZWlnaHQ6IHRoaXMuc3RhdGUubGVuZ3RoLFxuICAgICAgICBtaW5IZWlnaHQ6IE1JTklNVU1fTEVOR1RILFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gUmVhY3QuY2xvbmVFbGVtZW50KFxuICAgICAgUmVhY3QuQ2hpbGRyZW4ub25seSh0aGlzLnByb3BzLmNoaWxkcmVuKSxcbiAgICAgIHtyZWY6ICdjaGlsZCd9KTtcblxuICAgIGNvbnN0IHNjcm9sbGVyU3R5bGUgPSB7fTtcbiAgICBpZiAodGhpcy5wcm9wcy5vdmVyZmxvd1gpIHtcbiAgICAgIHNjcm9sbGVyU3R5bGUub3ZlcmZsb3dYID0gdGhpcy5wcm9wcy5vdmVyZmxvd1g7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQgJHt0aGlzLnByb3BzLmRvY2t9YH1cbiAgICAgICAgcmVmPVwiY29udGFpbmVyXCJcbiAgICAgICAgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1yZXNpemUtaGFuZGxlICR7dGhpcy5wcm9wcy5kb2NrfWB9XG4gICAgICAgICAgcmVmPVwiaGFuZGxlXCJcbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5faGFuZGxlTW91c2VEb3dufVxuICAgICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuX2hhbmRsZURvdWJsZUNsaWNrfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50LXNjcm9sbGVyXCIgc3R5bGU9e3Njcm9sbGVyU3R5bGV9PlxuICAgICAgICAgIHtjb250ZW50fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3Jlc2l6ZUN1cnNvck92ZXJsYXl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgcmVzaXphYmxlIGxlbmd0aC5cbiAgICpcbiAgICogRm9yIHBhbmVscyBkb2NrZWQgbGVmdCBvciByaWdodCwgdGhlIGxlbmd0aCBpcyB0aGUgd2lkdGguIEZvciBwYW5lbHNcbiAgICogZG9ja2VkIHRvcCBvciBib3R0b20sIGl0J3MgdGhlIGhlaWdodC5cbiAgICovXG4gIGdldExlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmxlbmd0aDtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snY2hpbGQnXSkuZm9jdXMoKTtcbiAgfVxuXG4gIGdldENoaWxkQ29tcG9uZW50KCk6IFJlYWN0Q29tcG9uZW50IHtcbiAgICByZXR1cm4gdGhpcy5yZWZzLmNoaWxkO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlRG93bihldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSk7XG4gICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5hZGQoe1xuICAgICAgZGlzcG9zZTogKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2hhbmRsZU1vdXNlTW92ZSksXG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApO1xuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuYWRkKHtcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlTW91c2VVcCksXG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtpc1Jlc2l6aW5nOiB0cnVlfSk7XG4gIH1cblxuICBfaGFuZGxlTW91c2VNb3ZlKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY29udGFpbmVyRWwgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2NvbnRhaW5lciddKTtcbiAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnbGVmdCcpIHtcbiAgICAgIGxlbmd0aCA9IGV2ZW50LnBhZ2VYIC0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIGxlbmd0aCA9IGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSAtIGV2ZW50LnBhZ2VZO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAncmlnaHQnKSB7XG4gICAgICBsZW5ndGggPSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodCAtIGV2ZW50LnBhZ2VYO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGVTaXplKGxlbmd0aCk7XG4gIH1cblxuICBfaGFuZGxlTW91c2VVcChldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNSZXNpemluZzogZmFsc2V9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNpemUgdGhlIHBhbmUgdG8gZml0IGl0cyBjb250ZW50cy5cbiAgICovXG4gIF9oYW5kbGVEb3VibGVDbGljaygpOiB2b2lkIHtcbiAgICAvLyBSZXNldCBzaXplIHRvIDAgYW5kIHJlYWQgdGhlIGNvbnRlbnQncyBuYXR1cmFsIHdpZHRoIChhZnRlciByZS1sYXlvdXQpXG4gICAgLy8gdG8gZGV0ZXJtaW5lIHRoZSBzaXplIHRvIHNjYWxlIHRvLlxuICAgIHRoaXMuc2V0U3RhdGUoe2xlbmd0aDogMH0pO1xuICAgIHRoaXMuZm9yY2VVcGRhdGUoKCkgPT4ge1xuICAgICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgICBjb25zdCBjaGlsZE5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2NoaWxkJ10pO1xuICAgICAgY29uc3QgaGFuZGxlID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydoYW5kbGUnXSk7XG4gICAgICBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnbGVmdCcgfHwgdGhpcy5wcm9wcy5kb2NrID09PSAncmlnaHQnKSB7XG4gICAgICAgIGxlbmd0aCA9IGNoaWxkTm9kZS5vZmZzZXRXaWR0aCArIGhhbmRsZS5vZmZzZXRXaWR0aDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5kb2NrID09PSAnYm90dG9tJykge1xuICAgICAgICBsZW5ndGggPSBjaGlsZE5vZGUub2Zmc2V0SGVpZ2h0ICsgaGFuZGxlLm9mZnNldEhlaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5oYW5kbGVkIGRvY2snKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3VwZGF0ZVNpemUobGVuZ3RoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdoZXRoZXIgdGhpcyBpcyB3aWR0aCBvciBoZWlnaHQgZGVwZW5kcyBvbiB0aGUgb3JpZW50YXRpb24gb2YgdGhpcyBwYW5lbC5cbiAgX3VwZGF0ZVNpemUobmV3U2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bGVuZ3RoOiBuZXdTaXplfSk7XG4gICAgdGhpcy5wcm9wcy5vblJlc2l6ZS5jYWxsKG51bGwsIG5ld1NpemUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZWxDb21wb25lbnQ7XG4iXX0=