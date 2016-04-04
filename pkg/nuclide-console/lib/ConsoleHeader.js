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
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarRight} from '../../nuclide-ui/lib/ToolbarRight';

type Props = {
  clear: () => void;
};

export default class ConsoleHeader extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  _handleClearButtonClick(event: SyntheticMouseEvent): void {
    this.props.clear();
  }

  render(): ?ReactElement {
    return (
      <Toolbar location="top">
        <ToolbarRight>
          <button className="btn btn-sm icon btn-secondary" onClick={this._handleClearButtonClick}>
            Clear
          </button>
        </ToolbarRight>
      </Toolbar>
    );
  }

}
