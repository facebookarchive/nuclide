'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeasuredComponent = undefined;

var _reactForAtom = require('react-for-atom');

const observerConfig = {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
};

/** A container which invokes a callback function supplied in props whenever the
 * container's height and width measurements change. The callback is invoked once
 * when the MeasuredComponent has mounted.
 */
let MeasuredComponent = exports.MeasuredComponent = class MeasuredComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._previousMeasurements = null;
    this._updateDomNode = this._updateDomNode.bind(this);
  }
  // Listens to the container DOM node for mutations


  componentDidMount() {
    // MutationObserver.observe() doesn't invoke its callback, so explicitly invoke it here
    this._considerInvokingMutationCallback();
  }

  _considerInvokingMutationCallback() {
    if (this._domNode == null) {
      return;
    }
    var _domNode = this._domNode;
    const clientHeight = _domNode.clientHeight,
          clientWidth = _domNode.clientWidth,
          offsetHeight = _domNode.offsetHeight,
          offsetWidth = _domNode.offsetWidth,
          scrollHeight = _domNode.scrollHeight,
          scrollWidth = _domNode.scrollWidth;

    if (this._previousMeasurements != null && clientHeight === this._previousMeasurements.clientHeight && clientWidth === this._previousMeasurements.clientWidth && offsetHeight === this._previousMeasurements.offsetHeight && offsetWidth === this._previousMeasurements.offsetWidth && scrollHeight === this._previousMeasurements.scrollHeight && scrollWidth === this._previousMeasurements.scrollWidth) {
      return; // Because the measurements are all the same
    }
    const measurements = {
      clientHeight: clientHeight,
      clientWidth: clientWidth,
      offsetHeight: offsetHeight,
      offsetWidth: offsetWidth,
      scrollHeight: scrollHeight,
      scrollWidth: scrollWidth
    };
    // Measurements changed, so invoke callback
    this.props.onMeasurementsChanged(Object.assign({}, measurements));
    // Update measurements
    this._previousMeasurements = measurements;
  }

  _updateDomNode(node) {
    if (node == null) {
      this._domNode = null;
      // _updateDomNode is called before component unmount, so don't need to disconect()
      // in componentWillUnmount()
      this._mutationObserver.disconnect();
      return;
    }
    this._mutationObserver = new MutationObserver(mutations => {
      // Invoke callback and update _previousMeasurements if measurements have changed
      this._considerInvokingMutationCallback();
    });
    this._domNode = node;
    this._mutationObserver.observe(this._domNode, observerConfig);
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { ref: this._updateDomNode },
      this.props.children
    );
  }
};