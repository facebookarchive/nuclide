'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeasuredComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _observeElementDimensions;

function _load_observeElementDimensions() {
  return _observeElementDimensions = require('../commons-atom/observe-element-dimensions');
}

/** A container which invokes a callback function supplied in props whenever the
 * container's height and width measurements change. The callback is invoked once
 * when the MeasuredComponent has mounted.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class MeasuredComponent extends _reactForAtom.React.Component {
  // Listens to the container DOM node for mutations
  constructor(props) {
    super(props);
    this._updateDomNode = this._updateDomNode.bind(this);
  }

  _updateDomNode(node) {
    if (node == null) {
      this._domNode = null;
      // _updateDomNode is called before component unmount, so don't need to unsubscribe()
      // in componentWillUnmount()
      this._mutationObserverSubscription.unsubscribe();
      return;
    }
    this._mutationObserverSubscription = (0, (_observeElementDimensions || _load_observeElementDimensions()).observeElementDimensions)(node).subscribe(this.props.onMeasurementsChanged);
    this._domNode = node;
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { ref: this._updateDomNode },
      this.props.children
    );
  }
}
exports.MeasuredComponent = MeasuredComponent;