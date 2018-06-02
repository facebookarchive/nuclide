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

import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import * as React from 'react';

type Props = {
  content: React$Node,
  toHide: boolean,
  onSetHide: boolean => void,
};

export default class WelcomePageSection extends React.Component<Props> {
  render(): React.Node {
    return (
      <div>
        {this.props.content}
        <div>
          <Checkbox
            checked={this.props.toHide}
            onChange={this.props.onSetHide}
          />
          Don't show this again
        </div>
      </div>
    );
  }
}
