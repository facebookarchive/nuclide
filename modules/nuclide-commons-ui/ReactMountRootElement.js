'use strict';Object.defineProperty(exports, "__esModule", { value: true });














var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}

/**
                                                                                                                                                                                                                                                                                                                                                                                                                            * A custom HTMLElement we render React elements into.
                                                                                                                                                                                                                                                                                                                                                                                                                            */
class ReactMountRootElement extends HTMLElement {


  setReactElement(reactElement) {
    this._reactElement = reactElement;
  }

  attachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactDom.default.render(this._reactElement, this);
  }

  detachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactDom.default.unmountComponentAtNode(this);
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */ /* global HTMLElement */let reactMountRootElement;try {reactMountRootElement = document.registerElement('nuclide-react-mount-root', { prototype: ReactMountRootElement.prototype });} catch (e) {// Element was already registered. Retrieve its constructor:
  const oldElem = document.createElement('nuclide-react-mount-root');if (!(oldElem.constructor.name === 'nuclide-react-mount-root')) {throw new Error('Invariant violation: "oldElem.constructor.name === \'nuclide-react-mount-root\'"');}
  reactMountRootElement = oldElem.constructor;
}exports.default =

reactMountRootElement;