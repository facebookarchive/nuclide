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

type DatatipComponentProps = {
  pinnable: boolean;
}

/* eslint-disable react/prop-types */
export class DatatipComponent extends React.Component {

  constructor(props: DatatipComponentProps) {
    super(props);
    this.handlePinClick = this.handlePinClick.bind(this);
  }

  handlePinClick(event: SyntheticEvent): void {
    // TODO
    console.log('Pin was clicked!');
  }

  render(): ReactElement {
    const {
      children,
      pinnable,
    } = this.props;
    const pinButton = pinnable
      ? <div
          className="nuclide-datatip-pin-button icon-pin"
          onClick={this.handlePinClick}
          title="Pin this datatip"
        />
      : null;
    return (
      <div className="nuclide-datatip-container">
        <div className="nuclide-datatip-content">
          {children}
        </div>
        {pinButton}
      </div>
    );
  }
}
/* eslint-enable react/prop-types */
