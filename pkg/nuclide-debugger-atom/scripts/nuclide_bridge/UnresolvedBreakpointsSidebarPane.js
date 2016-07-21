var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NuclideBridge2;

function _NuclideBridge() {
  return _NuclideBridge2 = _interopRequireDefault(require('./NuclideBridge'));
}

var _react2;

function _react() {
  return _react2 = _interopRequireDefault(require('react'));
}

var _reactDom2;

function _reactDom() {
  return _reactDom2 = _interopRequireDefault(require('react-dom'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var WebInspector = window.WebInspector;

var UnresolvedBreakpointsComponent = (_react2 || _react()).default.createClass({
  _changeHandler: { dispose: function dispose() {} },

  componentWillMount: function componentWillMount() {
    this._changeHandler = (_NuclideBridge2 || _NuclideBridge()).default.onUnresolvedBreakpointsChanged(this._updateState);
  },

  componentWillUnmount: function componentWillUnmount() {
    this._changeHandler.dispose();
  },

  render: function render() {
    var _this = this;

    var children = this.state.breakpoints.map(function (breakpoint) {
      var _default$parse = (_url2 || _url()).default.parse(breakpoint.url);

      var pathname = _default$parse.pathname;

      (0, (_assert2 || _assert()).default)(pathname);
      var longRep = pathname + ':' + (breakpoint.line + 1);
      var shortRep = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(pathname) + ':' + (breakpoint.line + 1);
      return (_react2 || _react()).default.createElement(
        'li',
        {
          key: longRep,
          className: 'cursor-pointer source-text',
          onClick: _this._onBreakpointClick.bind(_this, breakpoint),
          title: longRep },
        shortRep
      );
    });
    return (_react2 || _react()).default.createElement(
      'ol',
      { className: 'breakpoint-list' },
      this.state.breakpoints.length > 0 ? children : (_react2 || _react()).default.createElement(
        'div',
        { className: 'info' },
        'None'
      )
    );
  },

  _onBreakpointClick: function _onBreakpointClick(breakpoint) {
    (_NuclideBridge2 || _NuclideBridge()).default.sendOpenSourceLocation(breakpoint.url, breakpoint.line);
  },

  getInitialState: function getInitialState() {
    return this._getState();
  },

  _updateState: function _updateState() {
    this.setState(this._getState());
  },

  _getState: function _getState() {
    return {
      breakpoints: (_NuclideBridge2 || _NuclideBridge()).default.getUnresolvedBreakpointsList()
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

    (_reactDom2 || _reactDom()).default.render((_react2 || _react()).default.createElement(UnresolvedBreakpointsComponent, null), this.bodyElement);

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