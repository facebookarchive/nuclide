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

  render(): ReactElement {
    const {diffMode, filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const modes = Object.keys(DiffMode).map(modeId => {
      const modeValue = DiffMode[modeId];
      const className = classnames('btn', {
        'selected': modeValue === diffMode,
      });
      return (
        <button
          key={modeValue}
          className={className}
          onClick={() => this.props.onSwitchMode(modeValue)}>
          {modeValue}
        </button>
      );
    });

    return (
      <Toolbar location="top">
        <ToolbarLeft>
          <div className="btn-group btn-group-sm">
            {modes}
          </div>
        </ToolbarLeft>
        <ToolbarCenter>
          {this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle}
          {'...'}
          {this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle}
        </ToolbarCenter>
        <ToolbarRight>
          <div className="btn-group btn-group-sm">
            <button
              className="btn"
              disabled={!hasActiveFile}
              onClick={this.props.onSwitchToEditor}>
              Goto Editor
            </button>
          </div>
        </ToolbarRight>
      </Toolbar>
    );
  }
}

module.exports = DiffViewToolbar;
