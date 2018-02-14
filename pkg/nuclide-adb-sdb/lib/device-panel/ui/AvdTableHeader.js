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

import {Button} from 'nuclide-commons-ui/Button';
import * as React from 'react';

type Props = {
  refreshAvds: () => void,
};

export default class AvdTableHeader extends React.Component<Props> {
  render(): React.Node {
    const {refreshAvds} = this.props;
    return (
      <div className="nuclide-adb-sdb-emulator-header">
        Emulators <Button icon={'sync'} onClick={refreshAvds} size="SMALL" />
      </div>
    );
  }
}
