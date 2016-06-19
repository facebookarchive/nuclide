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

/**
 * Each context provider view is rendered inside a ProviderContainer.
 */
export class ProviderContainer extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node,
    ]),
  };

  render(): React.Element<any> {
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
