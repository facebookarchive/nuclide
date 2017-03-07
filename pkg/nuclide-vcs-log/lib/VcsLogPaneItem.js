/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {CustomPaneItemOptions} from '../../nuclide-ui/types';
import type {VcsLogEntry} from '../../nuclide-hg-rpc/lib/HgService';

import React from 'react';
import {CustomPaneItem} from '../../nuclide-ui/CustomPaneItem';
import VcsLog from './VcsLog';

class VcsLogPaneItem extends CustomPaneItem {
  __renderPaneItem(options: CustomPaneItemOptions): React.Element<any> {
    return <VcsLog {...options.initialProps} />;
  }

  updateWithLogEntries(logEntries: Array<VcsLogEntry>) {
    this.__component.setState({logEntries});
  }
}

export default document.registerElement(
  'nuclide-vcs-log',
  {prototype: VcsLogPaneItem.prototype},
);
