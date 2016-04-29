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

class SampleSideBarClientComponent extends React.Component {
  render() {
    return (
      <div className="padded" style={{whiteSpace: 'normal'}}>
        <h5>This is a sample side-bar client</h5>
        <div>
          It can be toggled with the palette command <code>
          'nuclide-sample-side-bar-client:toggle'</code>.
        </div>
      </div>
    );
  }
}

module.exports = SampleSideBarClientComponent;
