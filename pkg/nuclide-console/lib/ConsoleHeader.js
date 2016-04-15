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
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/lib/Button';

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
          <Button
            size={ButtonSizes.SMALL}
            onClick={this._handleClearButtonClick}>
            Clear
          </Button>
        </ToolbarRight>
      </Toolbar>
    );
  }

}
