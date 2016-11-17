'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CommitModeStateType, SuggestedReviewersState} from './types';
import type DiffViewModel from './DiffViewModel';

import {AtomTextEditor} from '../../nuclide-ui/AtomTextEditor';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import classnames from 'classnames';
import {DiffMode, CommitMode, CommitModeState} from './constants';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';
import {
  Button,
  ButtonSizes,
  ButtonTypes,
} from '../../nuclide-ui/Button';
import {
  ButtonGroup,
  ButtonGroupSizes,
} from '../../nuclide-ui/ButtonGroup';
import {Toolbar} from '../../nuclide-ui/Toolbar';
import {ToolbarLeft} from '../../nuclide-ui/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/ToolbarRight';

type Props = {
  commitMessage: ?string,
  commitMode: string,
  commitModeState: CommitModeStateType,
  diffModel: DiffViewModel,
  shouldRebaseOnAmend: boolean,
  suggestedReviewers: SuggestedReviewersState,
};

export default class DiffCommitView extends React.Component {
  props: Props;
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any).__onClickCommit = this.__onClickCommit.bind(this);
    (this: any)._onToggleAmend = this._onToggleAmend.bind(this);
    (this: any)._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    (this: any)._onClickBack = this._onClickBack.bind(this);
  }

  componentDidMount(): void {
    this.__populateCommitMessage();

    // Shortcut to commit when on form
    this._subscriptions = new CompositeDisposable(
      atom.commands.add(
        '.commit-form-wrapper',
        'nuclide-diff-view:commit-message',
        event => this.__onClickCommit()),
    );
  }

  componentDidUpdate(prevProps: Props, prevState: void): void {
    if (this.props.commitMessage !== prevProps.commitMessage) {
      this.__populateCommitMessage();
    }
  }

  __populateCommitMessage(): void {
    this.refs.message.getTextBuffer().setText(this.props.commitMessage || '');
  }

  _isLoading(): boolean {
    const {commitModeState} = this.props;
    return commitModeState !== CommitModeState.READY;
  }

  _getToolbar(): Toolbar {
    const {commitModeState, commitMode} = this.props;
    let message;
    switch (commitModeState) {
      case CommitModeState.AWAITING_COMMIT:
        if (commitMode === CommitMode.AMEND) {
          message = 'Amending...';
        } else {
          message = 'Committing...';
        }
        break;
      case CommitModeState.LOADING_COMMIT_MESSAGE:
        message = 'Loading...';
        break;
      case CommitModeState.READY:
        if (commitMode === CommitMode.AMEND) {
          message = 'Amend';
        } else {
          message = 'Commit';
        }
        break;
      default:
        message = 'Unknown Commit State!';
        break;
    }

    const isLoading = this._isLoading();
    const btnClassname = classnames('pull-right', {
      'btn-progress': isLoading,
    });

    let rebaseOptionElement = null;
    if (this.props.commitMode === CommitMode.AMEND) {
      rebaseOptionElement = (
        <Checkbox
          className="padded"
          checked={this.props.shouldRebaseOnAmend}
          disabled={isLoading}
          label="Rebase stacked commits"
          onChange={this._onToggleAmendRebase}
          tabIndex="-1"
        />
      );
    }

    return (
      <Toolbar location="bottom">
        <ToolbarLeft>
          <Checkbox
            checked={this.props.commitMode === CommitMode.AMEND}
            disabled={isLoading}
            label="Amend"
            onChange={this._onToggleAmend}
          />
          {rebaseOptionElement}
        </ToolbarLeft>
        <ToolbarRight>
          <ButtonGroup size={ButtonGroupSizes.SMALL}>
            <Button
              size={ButtonSizes.SMALL}
              onClick={this._onClickBack}>
              Back
            </Button>
            <Button
              className={btnClassname}
              size={ButtonSizes.SMALL}
              buttonType={ButtonTypes.PRIMARY}
              disabled={isLoading}
              onClick={this.__onClickCommit}>
              {message}
            </Button>
          </ButtonGroup>
        </ToolbarRight>
      </Toolbar>);
  }

  render(): React.Element<any> {
    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            gutterHidden={true}
            path=".HG_COMMIT_EDITMSG"
            readOnly={this._isLoading()}
            ref="message"
          />
        </div>
        {this._getToolbar()}
      </div>
    );
  }

  __onClickCommit(): void {
    this.props.diffModel.commit(this.__getCommitMessage());
  }

  _onClickBack(): void {
    this.props.diffModel.setViewMode(DiffMode.BROWSE_MODE);
  }

  __getCommitMessage(): string {
    return this.refs.message.getTextBuffer().getText();
  }

  _onToggleAmend(isChecked: boolean): void {
    this.props.diffModel.setCommitMode(isChecked
      ? CommitMode.AMEND
      : CommitMode.COMMIT,
    );
  }

  _onToggleAmendRebase(isChecked: boolean): void {
    this.props.diffModel.setShouldAmendRebase(isChecked);
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }
}
