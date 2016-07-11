'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

const observerConfig = {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true,
};

export type DOMMeasurements = {
  clientHeight: number;
  clientWidth: number;
  offsetHeight: number;
  offsetWidth: number;
  scrollHeight: number;
  scrollWidth: number;
};

type Props = {
  onMeasurementsChanged: (measurements: DOMMeasurements) => void;
  children?: React.Element<any>;
};

/** A container which invokes a callback function supplied in props whenever the
 * container's height and width measurements change. The callback is invoked once
 * when the MeasuredComponent has mounted.
 **/
export class MeasuredComponent extends React.Component {

  props: Props;
  // Listens to the container DOM node for mutations
  _mutationObserver: MutationObserver;
  _previousMeasurements: ?DOMMeasurements;
  _domNode: ?HTMLElement;

  constructor(props: Props) {
    super(props);
    this._previousMeasurements = null;
    (this: any)._updateDomNode = this._updateDomNode.bind(this);
  }

  componentDidMount(): void {
    // MutationObserver.observe() doesn't invoke its callback, so explicitly invoke it here
    this._considerInvokingMutationCallback();
  }

  _considerInvokingMutationCallback(): void {
    if (this._domNode == null) {
      return;
    }
    const {
      clientHeight,
      clientWidth,
      offsetHeight,
      offsetWidth,
      scrollHeight,
      scrollWidth,
    } = this._domNode;
    if (this._previousMeasurements != null
      && clientHeight === this._previousMeasurements.clientHeight
      && clientWidth === this._previousMeasurements.clientWidth
      && offsetHeight === this._previousMeasurements.offsetHeight
      && offsetWidth === this._previousMeasurements.offsetWidth
      && scrollHeight === this._previousMeasurements.scrollHeight
      && scrollWidth === this._previousMeasurements.scrollWidth) {
      return; // Because the measurements are all the same
    }
    const measurements = {
      clientHeight,
      clientWidth,
      offsetHeight,
      offsetWidth,
      scrollHeight,
      scrollWidth,
    };
    // Measurements changed, so invoke callback
    this.props.onMeasurementsChanged({...measurements});
    // Update measurements
    this._previousMeasurements = measurements;
  }

  _updateDomNode(node: ?HTMLElement): void {
    if (node == null) {
      this._domNode = null;
      // _updateDomNode is called before component unmount, so don't need to disconect()
      // in componentWillUnmount()
      this._mutationObserver.disconnect();
      return;
    }
    this._mutationObserver = new MutationObserver((mutations: Array<MutationRecord>) => {
      // Invoke callback and update _previousMeasurements if measurements have changed
      this._considerInvokingMutationCallback();
    });
    this._domNode = node;
    this._mutationObserver.observe(this._domNode, observerConfig);
  }

  render(): React.Element<any> {
    return <div ref={this._updateDomNode}>{this.props.children}</div>;
  }
}
