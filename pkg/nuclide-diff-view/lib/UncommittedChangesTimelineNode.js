'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DiffViewModel from './DiffViewModel';

import classnames from 'classnames';
import {React} from 'react-for-atom';
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/lib/Button';
import {DiffMode, CommitMode} from './constants';

type Props = {
  dirtyFileCount: number;
  diffModel: DiffViewModel;
};

export default class UncommittedChangesTimelineNode extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleClickCommit = this._handleClickCommit.bind(this);
    (this: any)._handleClickAmend = this._handleClickAmend.bind(this);
  }

  render(): React.Element<any> {
    const {dirtyFileCount} = this.props;
    const hasChanges = dirtyFileCount > 0;
    const bubbleClassName = classnames('revision-bubble revision-bubble--uncommitted', {
      'revision-bubble--no-changes': !hasChanges,
    });
    let filesMessage;
    if (hasChanges) {
      filesMessage = `${dirtyFileCount} Uncommitted Change${dirtyFileCount > 1 ? 's' : ''}`;
    } else {
      filesMessage = 'No Uncommitted Changes';
    }
    return (
      <div className="revision selected-revision-inrange selected-revision-start">
        <div className={bubbleClassName} />
        <div className="revision-label revision-label--uncommitted">
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
            onClick={this._handleClickAmend}>
            Amend
          </Button>
        </div>
      </div>
    );
  }

  _handleClickCommit(): void {
    const {diffModel} = this.props;
    diffModel.setCommitMode(CommitMode.COMMIT, false);
    diffModel.setViewMode(DiffMode.COMMIT_MODE);
  }

  _handleClickAmend(): void {
    const {diffModel} = this.props;
    diffModel.setCommitMode(CommitMode.AMEND, false);
    diffModel.setViewMode(DiffMode.COMMIT_MODE);
  }
}
