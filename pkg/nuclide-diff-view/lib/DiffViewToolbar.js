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

import classnames from 'classnames';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {DiffMode} from './constants';
import {React} from 'react-for-atom';
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarCenter} from '../../nuclide-ui/lib/ToolbarCenter';
import {ToolbarLeft} from '../../nuclide-ui/lib/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/lib/ToolbarRight';

type Props = {
  diffMode: DiffModeType;
  filePath: NuclideUri;
  newRevisionTitle: ?string;
  oldRevisionTitle: ?string;
  onSwitchToEditor: () => mixed;
  onSwitchMode: (mode: DiffModeType) => mixed;
};

class DiffViewToolbar extends React.Component {
  props: Props;

  render(): React.Element {
    const {diffMode, filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const diffModeIds = Object.keys(DiffMode);
    const modeElements = [];
    for (let i = 0; i < diffModeIds.length; i++) {
      const modeId = diffModeIds[i];
      const modeValue = DiffMode[modeId];
      const className = classnames('inline-block', {
        'selected': modeValue === diffMode,
      });
      modeElements.push(
        <Button
          key={modeValue}
          className={className}
          onClick={() => this.props.onSwitchMode(modeValue)}
          size="SMALL">
          {modeValue}
        </Button>
      );
      if (i !== diffModeIds.length - 1) {
        // Turn the arrow pointing to the next step green to indicate the next step in the compare >
        // commit > publish flow.
        const sepClassName = classnames('inline-block-tight icon icon-playback-fast-forward', {
          'text-success': modeValue === diffMode,
        });
        modeElements.push(<span className={sepClassName} key={`sep-${modeValue}`} />);
      }
    }

    return (
      <Toolbar location="top">
        <ToolbarLeft>
          {modeElements}
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
