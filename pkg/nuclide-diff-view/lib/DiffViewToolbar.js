'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiffModeType} from './types';
import type {NuclideUri} from '../../nuclide-remote-uri';

import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {React} from 'react-for-atom';
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarCenter} from '../../nuclide-ui/lib/ToolbarCenter';
import {ToolbarLeft} from '../../nuclide-ui/lib/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/lib/ToolbarRight';

type Props = {
  filePath: NuclideUri;
  newRevisionTitle: ?string;
  oldRevisionTitle: ?string;
  onSwitchToEditor: () => mixed;
  onSwitchMode: (mode: DiffModeType) => mixed;
};

class DiffViewToolbar extends React.Component {
  props: Props;

  render(): React.Element {
    const {filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    return (
      <Toolbar location="top">
        <ToolbarLeft>
        </ToolbarLeft>
        <ToolbarCenter>
          {this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle}
          {'...'}
          {this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle}
        </ToolbarCenter>
        <ToolbarRight>
          <ButtonGroup size="SMALL">
            <Button
              disabled={!hasActiveFile}
              onClick={this.props.onSwitchToEditor}>
              Goto Editor
            </Button>
          </ButtonGroup>
        </ToolbarRight>
      </Toolbar>
    );
  }
}

module.exports = DiffViewToolbar;
