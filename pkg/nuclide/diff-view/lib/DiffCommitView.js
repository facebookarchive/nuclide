'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CommitModeType, CommitModeStateType} from './types';
import type DiffViewModel from './DiffViewModel';

import AtomTextEditor from '../../ui/atom-text-editor';
import classnames from 'classnames';
import {CommitMode, CommitModeState} from './constants';

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
    let actionOrMessage;
    const {
      commitMode,
      commitModeState,
    } = this.props;
    const isLoading = commitModeState !== CommitModeState.READY;

    if (commitModeState === CommitModeState.READY) {
      actionOrMessage = (
        <button className="btn btn-sm btn-success pull-right"
          onClick={this._onClickCommit}>
          {commitMode} to HEAD
        </button>
      );
    } else {
      let loadingMessage;
      switch (commitModeState) {
        case CommitModeState.AWAITING_COMMIT:
          loadingMessage = 'Committing...';
          break;
        case CommitModeState.LOADING_COMMIT_MESSAGE:
          loadingMessage = 'Loading...';
          break;
        default:
          loadingMessage = 'Unknown Commit State!';
          break;
      }

      actionOrMessage = (
        <span className="pull-right">
          <span className="loading loading-spinner-tiny inline-block"></span>
          <span className="inline-block">{loadingMessage}</span>
        </span>
      );
    }

    const commitModes = Object.keys(CommitMode).map(modeId => {
      const modeValue = CommitMode[modeId];
      const className = classnames({
        'btn': true,
        'btn-sm': true,
        'selected': modeValue === commitMode,
      });
      return (
        <button
          className={className}
          key={modeValue}
          disabled={isLoading}
          onClick={() => this._onChangeCommitMode(modeValue)}>
          {modeValue}
        </button>
      );
    });

    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            ref="message"
            gutterHidden={true}
            readOnly={isLoading}
          />
        </div>
        <div className="padded">
          <div className="btn-group btn-group-sm inline-block">
            {commitModes}
          </div>
          {actionOrMessage}
        </div>
      </div>
    );
  }

  _onClickCommit(): void {
    this.props.diffModel.commit(this.refs['message'].getTextBuffer().getText());
  }

  _onChangeCommitMode(commitMode: CommitModeType): void {
    this.props.diffModel.setCommitMode(commitMode);
  }
}

module.exports = DiffCommitView;
