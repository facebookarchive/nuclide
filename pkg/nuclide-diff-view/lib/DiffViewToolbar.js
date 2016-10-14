'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiffModeType, DiffSection, DiffSectionStatusType} from './types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {Button} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';
import {Toolbar} from '../../nuclide-ui/Toolbar';
import {ToolbarCenter} from '../../nuclide-ui/ToolbarCenter';
import {ToolbarLeft} from '../../nuclide-ui/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/ToolbarRight';

type Props = {
  diffSections: Array<DiffSection>,
  filePath: NuclideUri,
  selectedDiffSectionIndex: number,
  newRevisionTitle: ?string,
  oldRevisionTitle: ?string,
  onSwitchToEditor: () => mixed,
  onSwitchMode: (mode: DiffModeType) => mixed,
  onNavigateToDiffSection: (diffSectionStatus: DiffSectionStatusType, lineNumber: number) => any,
};

export default class DiffViewToolbar extends React.Component {
  props: Props;
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    (this: any)._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    this._subscriptions = new CompositeDisposable(
      atom.commands.add(
        '.nuclide-diff-editor-container',
        'nuclide-diff-view:next-diff-section',
        this._onClickNavigateDown,
      ),
      atom.commands.add(
        '.nuclide-diff-editor-container',
        'nuclide-diff-view:previous-diff-section',
        this._onClickNavigateUp,
      ),
    );
  }

  render(): React.Element<any> {
    const {filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const hasDiffsUp = this._getPreviousDiffSection() != null;
    const hasDiffsDown = this._getNextDiffSection() != null;
    return (
      <Toolbar location="top">
        <ToolbarLeft />
        <ToolbarCenter>
          {this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle}
          {'...'}
          {this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle}
        </ToolbarCenter>
        <ToolbarRight>
          <ButtonGroup className="padded" size="SMALL">
            <Button
              disabled={!hasActiveFile || !hasDiffsDown}
              icon="arrow-down"
              onClick={this._onClickNavigateDown}
              title="Jump to next section"
            />
            <Button
              disabled={!hasActiveFile || !hasDiffsUp}
              icon="arrow-up"
              onClick={this._onClickNavigateUp}
              title="Jump to previous section"
            />
          </ButtonGroup>

          <ButtonGroup size="SMALL">
            <Button
              className="nuclide-diff-view-goto-editor-button"
              disabled={!hasActiveFile}
              onClick={this.props.onSwitchToEditor}>
              Goto Editor
            </Button>
          </ButtonGroup>
        </ToolbarRight>
      </Toolbar>
    );
  }

  _onClickNavigateUp(): void {
    this._navigateToSection(this._getPreviousDiffSection());
  }

  _onClickNavigateDown(): void {
    this._navigateToSection(this._getNextDiffSection());
  }

  _navigateToSection(diffSection: ?DiffSection): void {
    if (diffSection == null) {
      return;
    }
    this.props.onNavigateToDiffSection(diffSection.status, diffSection.lineNumber);
  }

  _getPreviousDiffSection(): ?DiffSection {
    const {diffSections, selectedDiffSectionIndex} = this.props;
    const previousSectionIndex = selectedDiffSectionIndex - 1;
    if (previousSectionIndex < 0) {
      return null;
    }
    return diffSections[previousSectionIndex];
  }

  _getNextDiffSection(): ?DiffSection {
    const {diffSections, selectedDiffSectionIndex} = this.props;
    const nextSectionIndex = selectedDiffSectionIndex + 1;
    if (nextSectionIndex >= diffSections.length) {
      return null;
    }
    return diffSections[nextSectionIndex];
  }
}
