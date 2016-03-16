'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CommitModeStateType} from './types';
import type DiffViewModel from './DiffViewModel';

import AtomTextEditor from '../../nuclide-ui-atom-text-editor';
import classnames from 'classnames';
import {CommitMode, CommitModeState} from './constants';
import NuclideCheckbox from '../../nuclide-ui-checkbox';

import {React} from 'react-for-atom';

type Props = {
  commitMessage: ?string;
  commitMode: string;
  commitModeState: CommitModeStateType;
  diffModel: DiffViewModel;
};

class DiffCommitView extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickCommit = this._onClickCommit.bind(this);
    (this: any)._onToggleAmend = this._onToggleAmend.bind(this);
  }

  componentDidMount(): void {
    this._setCommitMessage();
  }

  componentDidUpdate(prevProps: Props, prevState: void): void {
    if (this.props.commitMessage !== prevProps.commitMessage) {
      this._setCommitMessage();
    }
  }

  _setCommitMessage(): void {
    this.refs['message'].getTextBuffer().setText(this.props.commitMessage || '');
  }

  render(): ReactElement {
    const {commitModeState} = this.props;
    const isLoading = commitModeState !== CommitModeState.READY;

    let message;
    if (isLoading) {
      switch (commitModeState) {
        case CommitModeState.AWAITING_COMMIT:
          message = 'Committing...';
          break;
        case CommitModeState.LOADING_COMMIT_MESSAGE:
          message = 'Loading...';
          break;
        default:
          message = 'Unknown Commit State!';
          break;
      }
    } else {
      message = 'Commit';
    }

    const btnClassname = classnames('btn btn-sm btn-success pull-right', {
      'btn-progress': isLoading,
    });
    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            gutterHidden={true}
            path=".HG_COMMIT_EDITMSG"
            readOnly={isLoading}
            ref="message"
          />
        </div>
        <div className="nuclide-diff-view-toolbar nuclide-diff-view-toolbar-bottom">
          <div className="nuclide-diff-view-toolbar-left">
            <NuclideCheckbox
              checked={this.props.commitMode === CommitMode.AMEND}
              disabled={isLoading}
              label="Amend"
              onChange={this._onToggleAmend}
            />
          </div>
          <div className="nuclide-diff-view-toolbar-right">
            <button
              className={btnClassname}
              disabled={isLoading}
              onClick={this._onClickCommit}>
              {message}
            </button>
          </div>
        </div>
      </div>
    );
  }

  _onClickCommit(): void {
    this.props.diffModel.commit(this.refs['message'].getTextBuffer().getText());
  }

  _onToggleAmend(isChecked: boolean): void {
    this.props.diffModel.setCommitMode(isChecked
      ? CommitMode.AMEND
      : CommitMode.COMMIT
    );
  }
}

module.exports = DiffCommitView;
