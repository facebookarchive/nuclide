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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhbmVsQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFXOEIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBQ1YsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLGFBQUwsS0FBSztJQUVMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQzs7QUFFM0IsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxHQUFTLEVBQUUsQ0FBQzs7Ozs7OztJQU16QixjQUFjO1lBQWQsY0FBYzs7ZUFBZCxjQUFjOztXQUlDO0FBQ2pCLGNBQVEsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVU7QUFDdEMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVTtBQUM3RCxtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ25DLGVBQVMsRUFBRSxTQUFTLENBQUMsTUFBTTtLQUM1Qjs7OztXQUVxQjtBQUNwQixtQkFBYSxFQUFFLEdBQUc7QUFDbEIsY0FBUSxFQUFFLGFBQWE7S0FDeEI7Ozs7QUFFVSxXQWpCUCxjQUFjLENBaUJOLEtBQWEsRUFBRTswQkFqQnZCLGNBQWM7O0FBa0JoQiwrQkFsQkUsY0FBYyw2Q0FrQlYsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGdCQUFVLEVBQUUsS0FBSztBQUNqQixZQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0tBQ2pDLENBQUM7OztBQUdGLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdEQ7O2VBN0JHLGNBQWM7O1dBK0JaLGtCQUFpQjs7O0FBR3JCLFVBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7QUFDekIsMkJBQW1CLEdBQ2pCLDZCQUFLLFNBQVMsd0RBQXNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxBQUFHLEdBQUcsQ0FBQztPQUM3Rjs7QUFFRCxVQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtBQUM3RCxzQkFBYyxHQUFHO0FBQ2YsZUFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUN4QixrQkFBUSxFQUFFLGNBQWM7U0FDekIsQ0FBQztPQUNILE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdkMsc0JBQWMsR0FBRztBQUNmLGdCQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQ3pCLG1CQUFTLEVBQUUsY0FBYztTQUMxQixDQUFDO09BQ0g7O0FBRUQsVUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FDaEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDeEMsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQzs7QUFFbEIsVUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDeEIscUJBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7T0FDaEQ7O0FBRUQsYUFDRTs7O0FBQ0UsbUJBQVMsa0NBQWdDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxBQUFHO0FBQzNELGFBQUcsRUFBQyxXQUFXO0FBQ2YsZUFBSyxFQUFFLGNBQWMsQUFBQztRQUN0Qiw2QkFBSyxTQUFTLGdEQUE4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBRztBQUM1RSxhQUFHLEVBQUMsUUFBUTtBQUNaLHFCQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixBQUFDO0FBQ25DLHVCQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDO1VBQ3ZDO1FBQ0Y7O1lBQUssU0FBUyxFQUFDLHFDQUFxQyxFQUFDLEtBQUssRUFBRSxhQUFhLEFBQUM7VUFDdkUsT0FBTztTQUNKO1FBQ0wsbUJBQW1CO09BQ2hCLENBQ047S0FDSDs7Ozs7Ozs7OztXQVFRLHFCQUFXO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7S0FDMUI7OztXQUVJLGlCQUFTO0FBQ1osV0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDL0M7OztXQUVnQiw2QkFBbUI7QUFDbEMsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztLQUN4Qjs7O1dBRWUsMEJBQUMsS0FBMEIsRUFBUTs7O0FBQ2pELFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O0FBRXRELFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztBQUM1QixlQUFPLEVBQUU7aUJBQU0sTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxNQUFLLGdCQUFnQixDQUFDO1NBQUE7T0FDOUUsQ0FBQyxDQUFDOztBQUVILFlBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUM7QUFDNUIsZUFBTyxFQUFFO2lCQUFNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsTUFBSyxjQUFjLENBQUM7U0FBQTtPQUMxRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQ25DOzs7V0FFZSwwQkFBQyxLQUEwQixFQUFRO0FBQ2pELFVBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQzlELFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQzlCLGNBQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQztPQUNqRSxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3ZDLGNBQU0sR0FBRyxXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztPQUNuRSxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO0FBQ3RDLGNBQU0sR0FBRyxXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztPQUNsRTtBQUNELFVBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUI7OztXQUVhLHdCQUFDLEtBQTBCLEVBQVE7QUFDL0MsVUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7QUFDN0IsWUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3JDO0FBQ0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQ3BDOzs7Ozs7O1dBS2lCLDhCQUFTOzs7OztBQUd6QixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFNO0FBQ3JCLFlBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLFlBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUN4RCxZQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDdEQsWUFBSSxPQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLE9BQUssS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7QUFDN0QsZ0JBQU0sR0FBRyxTQUFTLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDckQsTUFBTSxJQUFJLE9BQUssS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDdkMsZ0JBQU0sR0FBRyxTQUFTLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7U0FDdkQsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDbkM7QUFDRCxlQUFLLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUMxQixDQUFDLENBQUM7S0FDSjs7Ozs7V0FHVSxxQkFBQyxPQUFlLEVBQVE7QUFDakMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDekM7OztTQWhLRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBbUs1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJQYW5lbENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBNSU5JTVVNX0xFTkdUSCA9IDEwMDtcblxuY29uc3QgZW1wdHlGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEEgY29udGFpbmVyIGZvciBjZW50cmFsaXppbmcgdGhlIGxvZ2ljIGZvciBtYWtpbmcgcGFuZWxzIHNjcm9sbGFibGUsXG4gKiByZXNpemVhYmxlLCBkb2NrYWJsZSwgZXRjLlxuICovXG5jbGFzcyBQYW5lbENvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3Jlc2l6ZVN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLmVsZW1lbnQuaXNSZXF1aXJlZCxcbiAgICBkb2NrOiBQcm9wVHlwZXMub25lT2YoWydsZWZ0JywgJ2JvdHRvbScsICdyaWdodCddKS5pc1JlcXVpcmVkLFxuICAgIGluaXRpYWxMZW5ndGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvblJlc2l6ZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvdmVyZmxvd1g6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBpbml0aWFsTGVuZ3RoOiAyMDAsXG4gICAgb25SZXNpemU6IGVtcHR5RnVuY3Rpb24sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgaXNSZXNpemluZzogZmFsc2UsXG4gICAgICBsZW5ndGg6IHRoaXMucHJvcHMuaW5pdGlhbExlbmd0aCxcbiAgICB9O1xuXG4gICAgLy8gQmluZCBtYWluIGV2ZW50cyB0byB0aGlzIG9iamVjdC4gX3VwZGF0ZVNpemUgaXMgb25seSBldmVyIGJvdW5kIHdpdGhpbiB0aGVzZS5cbiAgICB0aGlzLl9oYW5kbGVEb3VibGVDbGljayA9IHRoaXMuX2hhbmRsZURvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlTW91c2VEb3duID0gdGhpcy5faGFuZGxlTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlTW91c2VNb3ZlID0gdGhpcy5faGFuZGxlTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlTW91c2VVcCA9IHRoaXMuX2hhbmRsZU1vdXNlVXAuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFdlIGNyZWF0ZSBhbiBvdmVybGF5IHRvIGFsd2F5cyBkaXNwbGF5IHRoZSByZXNpemUgY3Vyc29yIHdoaWxlIHRoZSB1c2VyXG4gICAgLy8gaXMgcmVzaXppbmcgdGhlIHBhbmVsLCBldmVuIGlmIHRoZWlyIG1vdXNlIGxlYXZlcyB0aGUgaGFuZGxlLlxuICAgIGxldCByZXNpemVDdXJzb3JPdmVybGF5ID0gbnVsbDtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc1Jlc2l6aW5nKSB7XG4gICAgICByZXNpemVDdXJzb3JPdmVybGF5ID1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1yZXNpemUtY3Vyc29yLW92ZXJsYXkgJHt0aGlzLnByb3BzLmRvY2t9YH0gLz47XG4gICAgfVxuXG4gICAgbGV0IGNvbnRhaW5lclN0eWxlO1xuICAgIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdsZWZ0JyB8fCB0aGlzLnByb3BzLmRvY2sgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgICB3aWR0aDogdGhpcy5zdGF0ZS5sZW5ndGgsXG4gICAgICAgIG1pbldpZHRoOiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBjb250YWluZXJTdHlsZSA9IHtcbiAgICAgICAgaGVpZ2h0OiB0aGlzLnN0YXRlLmxlbmd0aCxcbiAgICAgICAgbWluSGVpZ2h0OiBNSU5JTVVNX0xFTkdUSCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IFJlYWN0LmNsb25lRWxlbWVudChcbiAgICAgIFJlYWN0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbiksXG4gICAgICB7cmVmOiAnY2hpbGQnfSk7XG5cbiAgICBjb25zdCBzY3JvbGxlclN0eWxlID0ge307XG4gICAgaWYgKHRoaXMucHJvcHMub3ZlcmZsb3dYKSB7XG4gICAgICBzY3JvbGxlclN0eWxlLm92ZXJmbG93WCA9IHRoaXMucHJvcHMub3ZlcmZsb3dYO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YG51Y2xpZGUtdWktcGFuZWwtY29tcG9uZW50ICR7dGhpcy5wcm9wcy5kb2NrfWB9XG4gICAgICAgIHJlZj1cImNvbnRhaW5lclwiXG4gICAgICAgIHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgbnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQtcmVzaXplLWhhbmRsZSAke3RoaXMucHJvcHMuZG9ja31gfVxuICAgICAgICAgIHJlZj1cImhhbmRsZVwiXG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2hhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9oYW5kbGVEb3VibGVDbGlja31cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudC1zY3JvbGxlclwiIHN0eWxlPXtzY3JvbGxlclN0eWxlfT5cbiAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtyZXNpemVDdXJzb3JPdmVybGF5fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJlc2l6YWJsZSBsZW5ndGguXG4gICAqXG4gICAqIEZvciBwYW5lbHMgZG9ja2VkIGxlZnQgb3IgcmlnaHQsIHRoZSBsZW5ndGggaXMgdGhlIHdpZHRoLiBGb3IgcGFuZWxzXG4gICAqIGRvY2tlZCB0b3Agb3IgYm90dG9tLCBpdCdzIHRoZSBoZWlnaHQuXG4gICAqL1xuICBnZXRMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sZW5ndGg7XG4gIH1cblxuICBmb2N1cygpOiB2b2lkIHtcbiAgICBSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2NoaWxkJ10pLmZvY3VzKCk7XG4gIH1cblxuICBnZXRDaGlsZENvbXBvbmVudCgpOiBSZWFjdENvbXBvbmVudCB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy5jaGlsZDtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpO1xuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbnMuYWRkKHtcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVNb3VzZU1vdmUpLFxuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVNb3VzZVVwKTtcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb25zLmFkZCh7XG4gICAgICBkaXNwb3NlOiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2hhbmRsZU1vdXNlVXApLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNSZXNpemluZzogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlTW92ZShldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lckVsID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydjb250YWluZXInXSk7XG4gICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnKSB7XG4gICAgICBsZW5ndGggPSBldmVudC5wYWdlWCAtIGNvbnRhaW5lckVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmRvY2sgPT09ICdib3R0b20nKSB7XG4gICAgICBsZW5ndGggPSBjb250YWluZXJFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gLSBldmVudC5wYWdlWTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgbGVuZ3RoID0gY29udGFpbmVyRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSBldmVudC5wYWdlWDtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlU2l6ZShsZW5ndGgpO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlVXAoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fcmVzaXplU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVzaXppbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIHRoZSBwYW5lIHRvIGZpdCBpdHMgY29udGVudHMuXG4gICAqL1xuICBfaGFuZGxlRG91YmxlQ2xpY2soKTogdm9pZCB7XG4gICAgLy8gUmVzZXQgc2l6ZSB0byAwIGFuZCByZWFkIHRoZSBjb250ZW50J3MgbmF0dXJhbCB3aWR0aCAoYWZ0ZXIgcmUtbGF5b3V0KVxuICAgIC8vIHRvIGRldGVybWluZSB0aGUgc2l6ZSB0byBzY2FsZSB0by5cbiAgICB0aGlzLnNldFN0YXRlKHtsZW5ndGg6IDB9KTtcbiAgICB0aGlzLmZvcmNlVXBkYXRlKCgpID0+IHtcbiAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgY29uc3QgY2hpbGROb2RlID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydjaGlsZCddKTtcbiAgICAgIGNvbnN0IGhhbmRsZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snaGFuZGxlJ10pO1xuICAgICAgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2xlZnQnIHx8IHRoaXMucHJvcHMuZG9jayA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBsZW5ndGggPSBjaGlsZE5vZGUub2Zmc2V0V2lkdGggKyBoYW5kbGUub2Zmc2V0V2lkdGg7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZG9jayA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgbGVuZ3RoID0gY2hpbGROb2RlLm9mZnNldEhlaWdodCArIGhhbmRsZS5vZmZzZXRIZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuaGFuZGxlZCBkb2NrJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVTaXplKGxlbmd0aCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBXaGV0aGVyIHRoaXMgaXMgd2lkdGggb3IgaGVpZ2h0IGRlcGVuZHMgb24gdGhlIG9yaWVudGF0aW9uIG9mIHRoaXMgcGFuZWwuXG4gIF91cGRhdGVTaXplKG5ld1NpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe2xlbmd0aDogbmV3U2l6ZX0pO1xuICAgIHRoaXMucHJvcHMub25SZXNpemUuY2FsbChudWxsLCBuZXdTaXplKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVsQ29tcG9uZW50O1xuIl19