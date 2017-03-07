/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type DiffViewModel from './DiffViewModel';

import classnames from 'classnames';
import React from 'react';
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/Button';
import {DiffMode, CommitMode} from './constants';

type Props = {
  dirtyFileCount: number,
  diffModel: DiffViewModel,
  onSelectionChange: () => any,
  selectedIndex: number,
  revisionsCount: number,
};

export default class UncommittedChangesTimelineNode extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleClickCommit = this._handleClickCommit.bind(this);
    (this: any)._handleClickAmend = this._handleClickAmend.bind(this);
  }

  render(): React.Element<any> {
    const {dirtyFileCount, selectedIndex, revisionsCount} = this.props;
    const hasChanges = dirtyFileCount > 0;
    let filesMessage;
    if (hasChanges) {
      filesMessage = `${dirtyFileCount} Uncommitted Change${dirtyFileCount > 1 ? 's' : ''}`;
    } else {
      filesMessage = 'No Uncommitted Changes';
    }

    const revisionClassName = classnames('revision selected-revision-start', {
      'selected-revision-inrange': selectedIndex !== 0,
      'selected-revision-last': revisionsCount === 1,
    });

    return (
      <div
        className={revisionClassName}
        onClick={() => { this.props.onSelectionChange(); }}>
        <div className="revision-bubble revision-bubble--uncommitted" />
        <div className="revision-label">
          <span className="revision-title text-monospace">{filesMessage}</span>
          <Button
            className="nuclide-diff-rev-side-button"
            size={ButtonSizes.SMALL}
            disabled={!hasChanges}
            onClick={this._handleClickCommit}>
            Commit
          </Button>
          <Button
            className="nuclide-diff-rev-side-button"
            size={ButtonSizes.SMALL}
            disabled={revisionsCount === 1}
            onClick={this._handleClickAmend}>
            Amend
          </Button>
        </div>
      </div>
    );
  }

  _handleClickCommit(event: SyntheticMouseEvent): void {
    const {diffModel} = this.props;
    diffModel.setCommitMode(CommitMode.COMMIT);
    diffModel.setViewMode(DiffMode.COMMIT_MODE);
    event.stopPropagation();
  }

  _handleClickAmend(event: SyntheticMouseEvent): void {
    const {diffModel} = this.props;
    diffModel.setCommitMode(CommitMode.AMEND);
    diffModel.setViewMode(DiffMode.COMMIT_MODE);
    event.stopPropagation();
  }
}
