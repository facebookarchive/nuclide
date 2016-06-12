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

export class ProviderContainer extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired,
  };

  render(): React.Element {
    return (
      <div className="padded nuclide-context-view-provider-container">
        <div className="inset-panel">
          <div className="panel-heading">{this.props.title}</div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
