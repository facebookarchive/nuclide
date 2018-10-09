"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _getDisplayName() {
  const data = _interopRequireDefault(require("../nuclide-commons/getDisplayName"));

  _getDisplayName = function () {
    return data;
  };

  return data;
}

function _trackReactProfilerRender() {
  const data = _interopRequireDefault(require("../nuclide-commons/trackReactProfilerRender"));

  _trackReactProfilerRender = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* eslint-env browser */
// $FlowFixMe Profiler is neither stable nor typed
const Profiler = React.unstable_Profiler;
/**
 * A custom HTMLElement we render React elements into.
 */

class ReactMountRootElement extends HTMLElement {
  setReactElement(reactElement, profileName) {
    this._reactElement = reactElement;
    this._profileName = profileName;
  }

  connectedCallback() {
    var _this$_profileName;

    if (this._reactElement == null) {
      return;
    }

    _reactDom.default.render(React.createElement(Profiler, {
      id: `RootElement(${(_this$_profileName = this._profileName) !== null && _this$_profileName !== void 0 ? _this$_profileName : (0, _getDisplayName().default)((0, _nullthrows().default)(this._reactElement.type))})`,
      onRender: _trackReactProfilerRender().default
    }, this._reactElement), this);
  }

  disconnectedCallback() {
    if (this._reactElement == null) {
      return;
    }

    _reactDom.default.unmountComponentAtNode(this);
  }

}

let reactMountRootElement;

try {
  customElements.define('nuclide-react-mount-root', ReactMountRootElement);
  reactMountRootElement = ReactMountRootElement;
} catch (e) {
  // Element was already registered. Retrieve its constructor:
  const oldElem = document.createElement('nuclide-react-mount-root');

  if (!(oldElem.constructor.name === 'ReactMountRootElement')) {
    throw new Error("Invariant violation: \"oldElem.constructor.name === 'ReactMountRootElement'\"");
  }

  reactMountRootElement = oldElem.constructor;
}

var _default = reactMountRootElement;
exports.default = _default;