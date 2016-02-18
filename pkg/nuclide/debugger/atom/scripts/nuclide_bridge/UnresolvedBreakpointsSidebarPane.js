var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var NuclideBridge = require('./NuclideBridge');
var React = require('react');
var ReactDOM = require('react-dom');
var path = require('path');
var url = require('url');

var WebInspector = window.WebInspector;

var UnresolvedBreakpointsComponent = React.createClass({
  displayName: 'UnresolvedBreakpointsComponent',

  _changeHandler: { dispose: function dispose() {} },

  componentWillMount: function componentWillMount() {
    this._changeHandler = NuclideBridge.onUnresolvedBreakpointsChanged(this._updateState);
  },

  componentWillUnmount: function componentWillUnmount() {
    this._changeHandler.dispose();
  },

  render: function render() {
    var _this = this;

    var children = this.state.breakpoints.map(function (breakpoint) {
      var _url$parse = url.parse(breakpoint.url);

      var pathname = _url$parse.pathname;

      (0, _assert2['default'])(pathname);
      var longRep = pathname + ':' + (breakpoint.line + 1);
      var shortRep = path.basename(pathname) + ':' + (breakpoint.line + 1);
      return React.createElement(
        'li',
        {
          key: longRep,
          className: 'cursor-pointer source-text',
          onClick: _this._onBreakpointClick.bind(_this, breakpoint),
          title: longRep },
        shortRep
      );
    });
    return React.createElement(
      'ol',
      { className: 'breakpoint-list' },
      this.state.breakpoints.length > 0 ? children : React.createElement(
        'div',
        { className: 'info' },
        'None'
      )
    );
  },

  _onBreakpointClick: function _onBreakpointClick(breakpoint) {
    NuclideBridge.sendOpenSourceLocation(breakpoint.url, breakpoint.line);
  },

  getInitialState: function getInitialState() {
    return this._getState();
  },

  _updateState: function _updateState() {
    this.setState(this._getState());
  },

  _getState: function _getState() {
    return {
      breakpoints: NuclideBridge.getUnresolvedBreakpointsList()
    };
  }
});

var UnresolvedBreakpointsSidebarPane = (function (_WebInspector$SidebarPane) {
  _inherits(UnresolvedBreakpointsSidebarPane, _WebInspector$SidebarPane);

  function UnresolvedBreakpointsSidebarPane() {
    _classCallCheck(this, UnresolvedBreakpointsSidebarPane);

    // WebInspector classes are not es6 classes, but babel forces a super call.
    _get(Object.getPrototypeOf(UnresolvedBreakpointsSidebarPane.prototype), 'constructor', this).call(this);
    // Actual super call.
    WebInspector.SidebarPane.call(this, 'Unresolved Breakpoints');

    this.registerRequiredCSS('components/breakpointsList.css');

    ReactDOM.render(React.createElement(UnresolvedBreakpointsComponent, null), this.bodyElement);

    this.expand();
  }

  // This is implemented by various UI views, but is not declared anywhere as
  // an official interface. There's callers to various `reset` functions, so
  // it's probably safer to have this.

  _createClass(UnresolvedBreakpointsSidebarPane, [{
    key: 'reset',
    value: function reset() {}
  }]);

  return UnresolvedBreakpointsSidebarPane;
})(WebInspector.SidebarPane);

module.exports = UnresolvedBreakpointsSidebarPane;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBZ0JzQixRQUFROzs7Ozs7Ozs7Ozs7QUFMOUIsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakQsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN0QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUczQixJQUFNLFlBQWlDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzs7QUFFOUQsSUFBTSw4QkFBOEIsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFDdkQsZ0JBQWMsRUFBRSxFQUFDLE9BQU8sRUFBRSxtQkFBTSxFQUFFLEVBQUM7O0FBRW5DLG9CQUFrQixFQUFBLDhCQUFHO0FBQ25CLFFBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUN2Rjs7QUFFRCxzQkFBb0IsRUFBQSxnQ0FBRztBQUNyQixRQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQy9COztBQUVELFFBQU0sRUFBQSxrQkFBRzs7O0FBQ1AsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO3VCQUNyQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7O1VBQXJDLFFBQVEsY0FBUixRQUFROztBQUNmLCtCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLFVBQU0sT0FBTyxHQUFNLFFBQVEsVUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxBQUFFLENBQUM7QUFDckQsVUFBTSxRQUFRLEdBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBSSxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQSxBQUFFLENBQUM7QUFDckUsYUFDRTs7O0FBQ0UsYUFBRyxFQUFFLE9BQU8sQUFBQztBQUNiLG1CQUFTLEVBQUMsNEJBQTRCO0FBQ3RDLGlCQUFPLEVBQUUsTUFBSyxrQkFBa0IsQ0FBQyxJQUFJLFFBQU8sVUFBVSxDQUFDLEFBQUM7QUFDeEQsZUFBSyxFQUFFLE9BQU8sQUFBQztRQUNkLFFBQVE7T0FDTixDQUNMO0tBQ0gsQ0FBQyxDQUFDO0FBQ0gsV0FDRTs7UUFBSSxTQUFTLEVBQUMsaUJBQWlCO01BQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQzlCLFFBQVEsR0FDUjs7VUFBSyxTQUFTLEVBQUMsTUFBTTs7T0FBVztLQUNqQyxDQUNMO0dBQ0g7O0FBRUQsb0JBQWtCLEVBQUEsNEJBQUMsVUFBdUMsRUFBRTtBQUMxRCxpQkFBYSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZFOztBQUVELGlCQUFlLEVBQUEsMkJBQUc7QUFDaEIsV0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7R0FDekI7O0FBRUQsY0FBWSxFQUFBLHdCQUFHO0FBQ2IsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztHQUNqQzs7QUFFRCxXQUFTLEVBQUEscUJBQUc7QUFDVixXQUFPO0FBQ0wsaUJBQVcsRUFBRSxhQUFhLENBQUMsNEJBQTRCLEVBQUU7S0FDMUQsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOztJQUVHLGdDQUFnQztZQUFoQyxnQ0FBZ0M7O0FBQ3pCLFdBRFAsZ0NBQWdDLEdBQ3RCOzBCQURWLGdDQUFnQzs7O0FBR2xDLCtCQUhFLGdDQUFnQyw2Q0FHMUI7O0FBRVIsZ0JBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDOztBQUU5RCxRQUFJLENBQUMsbUJBQW1CLENBQUMsZ0NBQWdDLENBQUMsQ0FBQzs7QUFFM0QsWUFBUSxDQUFDLE1BQU0sQ0FDYixvQkFBQyw4QkFBOEIsT0FBRyxFQUNsQyxJQUFJLENBQUMsV0FBVyxDQUNqQixDQUFDOztBQUVGLFFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmOzs7Ozs7ZUFmRyxnQ0FBZ0M7O1dBb0IvQixpQkFBRyxFQUNQOzs7U0FyQkcsZ0NBQWdDO0dBQVMsWUFBWSxDQUFDLFdBQVc7O0FBd0J2RSxNQUFNLENBQUMsT0FBTyxHQUFHLGdDQUFnQyxDQUFDIiwiZmlsZSI6IlVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgTnVjbGlkZUJyaWRnZSA9IHJlcXVpcmUoJy4vTnVjbGlkZUJyaWRnZScpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgUmVhY3RET00gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgV2ViSW5zcGVjdG9yOiB0eXBlb2YgV2ViSW5zcGVjdG9yID0gd2luZG93LldlYkluc3BlY3RvcjtcblxuY29uc3QgVW5yZXNvbHZlZEJyZWFrcG9pbnRzQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBfY2hhbmdlSGFuZGxlcjoge2Rpc3Bvc2U6ICgpID0+IHt9fSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5fY2hhbmdlSGFuZGxlciA9IE51Y2xpZGVCcmlkZ2Uub25VbnJlc29sdmVkQnJlYWtwb2ludHNDaGFuZ2VkKHRoaXMuX3VwZGF0ZVN0YXRlKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9jaGFuZ2VIYW5kbGVyLmRpc3Bvc2UoKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLmJyZWFrcG9pbnRzLm1hcChicmVha3BvaW50ID0+IHtcbiAgICAgIGNvbnN0IHtwYXRobmFtZX0gPSB1cmwucGFyc2UoYnJlYWtwb2ludC51cmwpO1xuICAgICAgaW52YXJpYW50KHBhdGhuYW1lKTtcbiAgICAgIGNvbnN0IGxvbmdSZXAgPSBgJHtwYXRobmFtZX06JHticmVha3BvaW50LmxpbmUgKyAxfWA7XG4gICAgICBjb25zdCBzaG9ydFJlcCA9IGAke3BhdGguYmFzZW5hbWUocGF0aG5hbWUpfToke2JyZWFrcG9pbnQubGluZSArIDF9YDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaVxuICAgICAgICAgIGtleT17bG9uZ1JlcH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBzb3VyY2UtdGV4dFwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25CcmVha3BvaW50Q2xpY2suYmluZCh0aGlzLCBicmVha3BvaW50KX1cbiAgICAgICAgICB0aXRsZT17bG9uZ1JlcH0+XG4gICAgICAgICAge3Nob3J0UmVwfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPG9sIGNsYXNzTmFtZT1cImJyZWFrcG9pbnQtbGlzdFwiPlxuICAgICAgICB7dGhpcy5zdGF0ZS5icmVha3BvaW50cy5sZW5ndGggPiAwXG4gICAgICAgICAgPyBjaGlsZHJlblxuICAgICAgICAgIDogPGRpdiBjbGFzc05hbWU9XCJpbmZvXCI+Tm9uZTwvZGl2Pn1cbiAgICAgIDwvb2w+XG4gICAgKTtcbiAgfSxcblxuICBfb25CcmVha3BvaW50Q2xpY2soYnJlYWtwb2ludDoge3VybDogc3RyaW5nLCBsaW5lOiBudW1iZXJ9KSB7XG4gICAgTnVjbGlkZUJyaWRnZS5zZW5kT3BlblNvdXJjZUxvY2F0aW9uKGJyZWFrcG9pbnQudXJsLCBicmVha3BvaW50LmxpbmUpO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgfSxcblxuICBfdXBkYXRlU3RhdGUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLl9nZXRTdGF0ZSgpKTtcbiAgfSxcblxuICBfZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJyZWFrcG9pbnRzOiBOdWNsaWRlQnJpZGdlLmdldFVucmVzb2x2ZWRCcmVha3BvaW50c0xpc3QoKSxcbiAgICB9O1xuICB9LFxufSk7XG5cbmNsYXNzIFVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lIGV4dGVuZHMgV2ViSW5zcGVjdG9yLlNpZGViYXJQYW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gV2ViSW5zcGVjdG9yIGNsYXNzZXMgYXJlIG5vdCBlczYgY2xhc3NlcywgYnV0IGJhYmVsIGZvcmNlcyBhIHN1cGVyIGNhbGwuXG4gICAgc3VwZXIoKTtcbiAgICAvLyBBY3R1YWwgc3VwZXIgY2FsbC5cbiAgICBXZWJJbnNwZWN0b3IuU2lkZWJhclBhbmUuY2FsbCh0aGlzLCAnVW5yZXNvbHZlZCBCcmVha3BvaW50cycpO1xuXG4gICAgdGhpcy5yZWdpc3RlclJlcXVpcmVkQ1NTKCdjb21wb25lbnRzL2JyZWFrcG9pbnRzTGlzdC5jc3MnKTtcblxuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxVbnJlc29sdmVkQnJlYWtwb2ludHNDb21wb25lbnQgLz4sXG4gICAgICB0aGlzLmJvZHlFbGVtZW50XG4gICAgKTtcblxuICAgIHRoaXMuZXhwYW5kKCk7XG4gIH1cblxuICAvLyBUaGlzIGlzIGltcGxlbWVudGVkIGJ5IHZhcmlvdXMgVUkgdmlld3MsIGJ1dCBpcyBub3QgZGVjbGFyZWQgYW55d2hlcmUgYXNcbiAgLy8gYW4gb2ZmaWNpYWwgaW50ZXJmYWNlLiBUaGVyZSdzIGNhbGxlcnMgdG8gdmFyaW91cyBgcmVzZXRgIGZ1bmN0aW9ucywgc29cbiAgLy8gaXQncyBwcm9iYWJseSBzYWZlciB0byBoYXZlIHRoaXMuXG4gIHJlc2V0KCkge1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVW5yZXNvbHZlZEJyZWFrcG9pbnRzU2lkZWJhclBhbmU7XG4iXX0=