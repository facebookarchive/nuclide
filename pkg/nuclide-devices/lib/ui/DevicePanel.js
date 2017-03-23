/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import {PanelComponentScroller} from '../../../nuclide-ui/PanelComponentScroller';

type Props = {

};

export class DevicePanel extends React.Component {
  props: Props;

  render(): React.Element<any> {
    return (
      <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
        <PanelComponentScroller>
          <div className="padded" style={{flex: 1, minWidth: 'min-content'}}>
            <span>TODO</span>
          </div>
        </PanelComponentScroller>
      </div>
    );
  }
}
