'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.MeasuredComponent = undefined;











var _react = _interopRequireWildcard(require('react'));var _observableDom;

function _load_observableDom() {return _observableDom = require('./observable-dom');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
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
/** A container which invokes a callback function supplied in props whenever the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * container's height and width measurements change. The callback is invoked once
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * when the MeasuredComponent has mounted.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */
class MeasuredComponent extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.




    _updateDomNode = node => {
      if (node == null) {
        this._domNode = null;
        // _updateDomNode is called before component unmount, so don't need to unsubscribe()
        // in componentWillUnmount()
        this._resizeSubscription.unsubscribe();
        return;
      }
      this._resizeSubscription = new (_observableDom || _load_observableDom()).ResizeObservable(node).subscribe(entries => {if (!(
        entries.length === 1)) {throw new Error('Invariant violation: "entries.length === 1"');}
        this.props.onMeasurementsChanged(
        entries[0].contentRect,
        entries[0].target);

      });
      this._domNode = node;
    }, _temp;} // Listens to the container DOM node for mutations

  render() {
    const _props = this.props,{ onMeasurementsChanged } = _props,passThroughProps = _objectWithoutProperties(_props, ['onMeasurementsChanged']);
    return _react.createElement('div', Object.assign({ ref: this._updateDomNode }, passThroughProps));
  }}exports.MeasuredComponent = MeasuredComponent;