'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

import createComponentItem from './createComponentItem';
import {
  React,
  ReactDOM,
} from 'react-for-atom';

type Props = {
  gadgetId: string,
  iconName: string,
  rawInitialGadgetState: Object,
  title: string,
  expandedFlexScale: ?number,
};

class GadgetPlaceholder extends React.Component<void, Props, void> {

  _expandedFlexScale: ?number;

  constructor(props: Props) {
    super(props);
    this._expandedFlexScale = props && props.expandedFlexScale;
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.element);
  }

  getTitle(): string {
    return this.props.title;
  }

  getGadgetId(): string {
    return this.props.gadgetId;
  }

  getIconName(): string {
    return this.props.iconName;
  }

  getRawInitialGadgetState(): Object {
    return this.props.rawInitialGadgetState;
  }

  render(): ?ReactElement {
    // TODO: Make some nice placeholder? It happens so fast it may not be worth it.
    return <div />;
  }

  serialize(): Object {
    // Even though this is just a placeholder for a gadget, there's a chance it'll need to be
    // serialized before we replace it.
    return {
      deserializer: 'GadgetPlaceholder',
      data: {
        gadgetId: this.getGadgetId(),
        iconName: this.getIconName(),
        rawInitialGadgetState: this.getRawInitialGadgetState(),
        title: this.getTitle(),
        expandedFlexScale: this._expandedFlexScale,
      },
    };
  }

  static deserialize(state) {
    return createComponentItem(<GadgetPlaceholder {...state.data} />);
  }

}

module.exports = GadgetPlaceholder;
