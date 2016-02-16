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
import type {NuclideUri} from '../../remote-uri';

import {DiffMode} from './constants';
import {React} from 'react-for-atom';
import classnames from 'classnames';

type Props = {
  diffMode: DiffModeType,
  filePath: NuclideUri,
  onSwitchToEditor: () => mixed,
  onSwitchMode: (mode: DiffModeType) => mixed,
};

class DiffViewToolbar extends React.Component {
  props: Props;

  render(): ReactElement {
    const {diffMode, filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const modes = Object.keys(DiffMode).map(modeId => {
      const modeValue = DiffMode[modeId];
      const className = classnames({
        'btn': true,
        'selected': modeValue === diffMode,
      });
      return (
        <button
          key={modeValue}
          className={className}
          onClick={() => this.props.onSwitchMode(modeValue)}>
          {modeValue} Mode
        </button>
      );
    });
    return (
      <div className="nuclide-diff-view-toolbar tool-panel">
        <div className="btn-group">
          {modes}
        </div>
        <div className="editor-switch btn-group">
          <button
            onClick={this.props.onSwitchToEditor}
            disabled={!hasActiveFile} className="btn">
            Goto Editor
          </button>
        </div>
      </div>
    );
  }
}

module.exports = DiffViewToolbar;
