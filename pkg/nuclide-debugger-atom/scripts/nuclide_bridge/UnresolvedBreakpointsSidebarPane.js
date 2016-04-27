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