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

export const DATATIP_ACTIONS = {
  PIN: 'PIN',
  CLOSE: 'CLOSE',
};

const IconsForAction = {
  [DATATIP_ACTIONS.PIN]: 'pin',
  [DATATIP_ACTIONS.CLOSE]: 'x',
};

type DatatipComponentProps = {
  action: string;
  actionTitle: string;
  onActionClick: Function;
}

/* eslint-disable react/prop-types */
export class DatatipComponent extends React.Component {

  constructor(props: DatatipComponentProps) {
    super(props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  handleActionClick(event: SyntheticEvent): void {
    this.props.onActionClick();
  }

  render(): ReactElement {
    const {
      children,
      action,
      actionTitle,
    } = this.props;
    let actionButton;
    if (action != null && IconsForAction[action] != null) {
      const actionIcon = IconsForAction[action];
      actionButton = (
        <div
          className={`nuclide-datatip-pin-button icon-${actionIcon}`}
          onClick={this.handleActionClick}
          title={actionTitle}
        />
      );
    }
    return (
      <div className="nuclide-datatip-container">
        <div className="nuclide-datatip-content">
          {children}
        </div>
        {actionButton}
      </div>
    );
  }
}
/* eslint-enable react/prop-types */
