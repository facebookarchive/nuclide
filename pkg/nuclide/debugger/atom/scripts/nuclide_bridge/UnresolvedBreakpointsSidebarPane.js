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

    React.render(React.createElement(UnresolvedBreakpointsComponent, null), this.bodyElement);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBZXNCLFFBQVE7Ozs7Ozs7Ozs7OztBQUo5QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFHM0IsSUFBTSxZQUFpQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7O0FBRTlELElBQU0sOEJBQThCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBQ3ZELGdCQUFjLEVBQUUsRUFBQyxPQUFPLEVBQUUsbUJBQU0sRUFBRSxFQUFDOztBQUVuQyxvQkFBa0IsRUFBQSw4QkFBRztBQUNuQixRQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDdkY7O0FBRUQsc0JBQW9CLEVBQUEsZ0NBQUc7QUFDckIsUUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUMvQjs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7OztBQUNQLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTt1QkFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDOztVQUFyQyxRQUFRLGNBQVIsUUFBUTs7QUFDZiwrQkFBVSxRQUFRLENBQUMsQ0FBQztBQUNwQixVQUFNLE9BQU8sR0FBTSxRQUFRLFVBQUksVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsQUFBRSxDQUFDO0FBQ3JELFVBQU0sUUFBUSxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQUksVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUEsQUFBRSxDQUFDO0FBQ3JFLGFBQ0U7OztBQUNFLGFBQUcsRUFBRSxPQUFPLEFBQUM7QUFDYixtQkFBUyxFQUFDLDRCQUE0QjtBQUN0QyxpQkFBTyxFQUFFLE1BQUssa0JBQWtCLENBQUMsSUFBSSxRQUFPLFVBQVUsQ0FBQyxBQUFDO0FBQ3hELGVBQUssRUFBRSxPQUFPLEFBQUM7UUFDZCxRQUFRO09BQ04sQ0FDTDtLQUNILENBQUMsQ0FBQztBQUNILFdBQ0U7O1FBQUksU0FBUyxFQUFDLGlCQUFpQjtNQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUM5QixRQUFRLEdBQ1I7O1VBQUssU0FBUyxFQUFDLE1BQU07O09BQVc7S0FDakMsQ0FDTDtHQUNIOztBQUVELG9CQUFrQixFQUFBLDRCQUFDLFVBQXVDLEVBQUU7QUFDMUQsaUJBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2RTs7QUFFRCxpQkFBZSxFQUFBLDJCQUFHO0FBQ2hCLFdBQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQ3pCOztBQUVELGNBQVksRUFBQSx3QkFBRztBQUNiLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7R0FDakM7O0FBRUQsV0FBUyxFQUFBLHFCQUFHO0FBQ1YsV0FBTztBQUNMLGlCQUFXLEVBQUUsYUFBYSxDQUFDLDRCQUE0QixFQUFFO0tBQzFELENBQUM7R0FDSDtDQUNGLENBQUMsQ0FBQzs7SUFFRyxnQ0FBZ0M7WUFBaEMsZ0NBQWdDOztBQUN6QixXQURQLGdDQUFnQyxHQUN0QjswQkFEVixnQ0FBZ0M7OztBQUdsQywrQkFIRSxnQ0FBZ0MsNkNBRzFCOztBQUVSLGdCQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQzs7QUFFOUQsUUFBSSxDQUFDLG1CQUFtQixDQUFDLGdDQUFnQyxDQUFDLENBQUM7O0FBRTNELFNBQUssQ0FBQyxNQUFNLENBQ1Ysb0JBQUMsOEJBQThCLE9BQUcsRUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUVwQixRQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZjs7Ozs7O2VBZEcsZ0NBQWdDOztXQW1CL0IsaUJBQUcsRUFDUDs7O1NBcEJHLGdDQUFnQztHQUFTLFlBQVksQ0FBQyxXQUFXOztBQXVCdkUsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQ0FBZ0MsQ0FBQyIsImZpbGUiOiJVbnJlc29sdmVkQnJlYWtwb2ludHNTaWRlYmFyUGFuZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IE51Y2xpZGVCcmlkZ2UgPSByZXF1aXJlKCcuL051Y2xpZGVCcmlkZ2UnKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB1cmwgPSByZXF1aXJlKCd1cmwnKTtcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgV2ViSW5zcGVjdG9yOiB0eXBlb2YgV2ViSW5zcGVjdG9yID0gd2luZG93LldlYkluc3BlY3RvcjtcblxuY29uc3QgVW5yZXNvbHZlZEJyZWFrcG9pbnRzQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBfY2hhbmdlSGFuZGxlcjoge2Rpc3Bvc2U6ICgpID0+IHt9fSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5fY2hhbmdlSGFuZGxlciA9IE51Y2xpZGVCcmlkZ2Uub25VbnJlc29sdmVkQnJlYWtwb2ludHNDaGFuZ2VkKHRoaXMuX3VwZGF0ZVN0YXRlKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9jaGFuZ2VIYW5kbGVyLmRpc3Bvc2UoKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLmJyZWFrcG9pbnRzLm1hcChicmVha3BvaW50ID0+IHtcbiAgICAgIGNvbnN0IHtwYXRobmFtZX0gPSB1cmwucGFyc2UoYnJlYWtwb2ludC51cmwpO1xuICAgICAgaW52YXJpYW50KHBhdGhuYW1lKTtcbiAgICAgIGNvbnN0IGxvbmdSZXAgPSBgJHtwYXRobmFtZX06JHticmVha3BvaW50LmxpbmUgKyAxfWA7XG4gICAgICBjb25zdCBzaG9ydFJlcCA9IGAke3BhdGguYmFzZW5hbWUocGF0aG5hbWUpfToke2JyZWFrcG9pbnQubGluZSArIDF9YDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxsaVxuICAgICAgICAgIGtleT17bG9uZ1JlcH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBzb3VyY2UtdGV4dFwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25CcmVha3BvaW50Q2xpY2suYmluZCh0aGlzLCBicmVha3BvaW50KX1cbiAgICAgICAgICB0aXRsZT17bG9uZ1JlcH0+XG4gICAgICAgICAge3Nob3J0UmVwfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPG9sIGNsYXNzTmFtZT1cImJyZWFrcG9pbnQtbGlzdFwiPlxuICAgICAgICB7dGhpcy5zdGF0ZS5icmVha3BvaW50cy5sZW5ndGggPiAwXG4gICAgICAgICAgPyBjaGlsZHJlblxuICAgICAgICAgIDogPGRpdiBjbGFzc05hbWU9XCJpbmZvXCI+Tm9uZTwvZGl2Pn1cbiAgICAgIDwvb2w+XG4gICAgKTtcbiAgfSxcblxuICBfb25CcmVha3BvaW50Q2xpY2soYnJlYWtwb2ludDoge3VybDogc3RyaW5nLCBsaW5lOiBudW1iZXJ9KSB7XG4gICAgTnVjbGlkZUJyaWRnZS5zZW5kT3BlblNvdXJjZUxvY2F0aW9uKGJyZWFrcG9pbnQudXJsLCBicmVha3BvaW50LmxpbmUpO1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U3RhdGUoKTtcbiAgfSxcblxuICBfdXBkYXRlU3RhdGUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh0aGlzLl9nZXRTdGF0ZSgpKTtcbiAgfSxcblxuICBfZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJyZWFrcG9pbnRzOiBOdWNsaWRlQnJpZGdlLmdldFVucmVzb2x2ZWRCcmVha3BvaW50c0xpc3QoKSxcbiAgICB9O1xuICB9LFxufSk7XG5cbmNsYXNzIFVucmVzb2x2ZWRCcmVha3BvaW50c1NpZGViYXJQYW5lIGV4dGVuZHMgV2ViSW5zcGVjdG9yLlNpZGViYXJQYW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gV2ViSW5zcGVjdG9yIGNsYXNzZXMgYXJlIG5vdCBlczYgY2xhc3NlcywgYnV0IGJhYmVsIGZvcmNlcyBhIHN1cGVyIGNhbGwuXG4gICAgc3VwZXIoKTtcbiAgICAvLyBBY3R1YWwgc3VwZXIgY2FsbC5cbiAgICBXZWJJbnNwZWN0b3IuU2lkZWJhclBhbmUuY2FsbCh0aGlzLCAnVW5yZXNvbHZlZCBCcmVha3BvaW50cycpO1xuXG4gICAgdGhpcy5yZWdpc3RlclJlcXVpcmVkQ1NTKCdjb21wb25lbnRzL2JyZWFrcG9pbnRzTGlzdC5jc3MnKTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIDxVbnJlc29sdmVkQnJlYWtwb2ludHNDb21wb25lbnQgLz4sXG4gICAgICB0aGlzLmJvZHlFbGVtZW50KTtcblxuICAgIHRoaXMuZXhwYW5kKCk7XG4gIH1cblxuICAvLyBUaGlzIGlzIGltcGxlbWVudGVkIGJ5IHZhcmlvdXMgVUkgdmlld3MsIGJ1dCBpcyBub3QgZGVjbGFyZWQgYW55d2hlcmUgYXNcbiAgLy8gYW4gb2ZmaWNpYWwgaW50ZXJmYWNlLiBUaGVyZSdzIGNhbGxlcnMgdG8gdmFyaW91cyBgcmVzZXRgIGZ1bmN0aW9ucywgc29cbiAgLy8gaXQncyBwcm9iYWJseSBzYWZlciB0byBoYXZlIHRoaXMuXG4gIHJlc2V0KCkge1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVW5yZXNvbHZlZEJyZWFrcG9pbnRzU2lkZWJhclBhbmU7XG4iXX0=