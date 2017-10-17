'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _NuclideBridge;

function _load_NuclideBridge() {
  return _NuclideBridge = _interopRequireDefault(require('./NuclideBridge'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _url = _interopRequireDefault(require('url'));

var _WebInspector;

function _load_WebInspector() {
  return _WebInspector = _interopRequireDefault(require('../../lib/WebInspector'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class UnresolvedBreakpointsComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._updateState = () => {
      this.setState(this._getState());
    };

    this._getState = () => {
      return {
        breakpoints: (_NuclideBridge || _load_NuclideBridge()).default.getUnresolvedBreakpointsList()
      };
    };

    this._changeHandler = null;
    this.state = this._getState();
  }

  componentWillMount() {
    this._changeHandler = (_NuclideBridge || _load_NuclideBridge()).default.onUnresolvedBreakpointsChanged(this._updateState);
  }

  componentWillUnmount() {
    if (!(this._changeHandler != null)) {
      throw new Error('Invariant violation: "this._changeHandler != null"');
    }

    this._changeHandler.dispose();
  }

  render() {
    const children = this.state.breakpoints.map(breakpoint => {
      const { pathname } = _url.default.parse(breakpoint.url);
      // flowlint-next-line sketchy-null-string:off

      if (!pathname) {
        throw new Error('Invariant violation: "pathname"');
      }

      const longRep = `${pathname}:${breakpoint.line + 1}`;
      const shortRep = `${(_nuclideUri || _load_nuclideUri()).default.basename(pathname)}:${breakpoint.line + 1}`;
      return _react.createElement(
        'li',
        {
          key: longRep,
          className: 'cursor-pointer source-text',
          onClick: this._onBreakpointClick.bind(this, breakpoint),
          title: longRep },
        shortRep
      );
    });
    return _react.createElement(
      'ol',
      { className: 'breakpoint-list' },
      this.state.breakpoints.length > 0 ? children : _react.createElement(
        'div',
        { className: 'info' },
        'None'
      )
    );
  }

  _onBreakpointClick(breakpoint) {
    (_NuclideBridge || _load_NuclideBridge()).default.sendOpenSourceLocation(breakpoint.url, breakpoint.line);
  }

}

class UnresolvedBreakpointsSidebarPane extends (_WebInspector || _load_WebInspector()).default.SidebarPane {
  constructor() {
    // WebInspector classes are not es6 classes, but babel forces a super call.
    super();
    // Actual super call.
    (_WebInspector || _load_WebInspector()).default.SidebarPane.call(this, 'Unresolved Breakpoints');

    this.registerRequiredCSS('components/breakpointsList.css');

    _reactDom.default.render(_react.createElement(UnresolvedBreakpointsComponent, null), this.bodyElement);

    this.expand();
  }

  // This is implemented by various UI views, but is not declared anywhere as
  // an official interface. There's callers to various `reset` functions, so
  // it's probably safer to have this.
  reset() {}
}
exports.default = UnresolvedBreakpointsSidebarPane;