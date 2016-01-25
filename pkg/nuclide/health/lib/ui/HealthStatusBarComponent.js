'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  PureRenderMixin,
  React,
} from 'react-for-atom';

const {PropTypes} = React;

export default class HealthStatusBarComponent extends React.Component {

  static propTypes = {
    onClickIcon: PropTypes.func.isRequired,
  };

  render(): void {
    return (
      <div>
        <span
          className="icon icon-dashboard nuclide-health-icon"
          onClick={this.props.onClickIcon}
        />
      </div>
    );
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

}
