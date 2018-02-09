/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {IDebugService} from '../types';

import classnames from 'classnames';
import * as React from 'react';
import BreakpointListComponent from './BreakpointListComponent';

type Props = {
  service: IDebugService,
};

export default class BreakpointsView extends React.PureComponent<Props> {
  render(): React.Node {
    const {service} = this.props;

    return (
      <div
        className={classnames(
          'nuclide-debugger-container-new',
          'nuclide-debugger-breakpoint-list',
        )}>
        <div className="nuclide-debugger-pane-content ">
          <BreakpointListComponent service={service} />
        </div>
      </div>
    );
  }
}
