/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {CommitModeStateType, SuggestedReviewersState} from './types';
import type DiffViewModel from './DiffViewModel';

import addTooltip from '../../nuclide-ui/add-tooltip';
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {AtomTextEditor} from '../../nuclide-ui/AtomTextEditor';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import classnames from 'classnames';
import {DiffMode, CommitMode, CommitModeState, DiffViewFeatures} from './constants';
import {CompositeDisposable} from 'atom';
import React from 'react';
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
  enabledFeatures: Set<string>,
  hasUncommittedChanges: boolean,
  isPrepareMode: boolean,
  lintExcuse: string,
  shouldCommitInteractively: boolean,
  shouldPublishOnCommit: boolean,
  shouldRebaseOnAmend: boolean,
  suggestedReviewers: SuggestedReviewersState,
  verbatimModeEnabled: boolean,
};

export default class DiffCommitView extends React.Component {
  props: Props;
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any).__onClickCommit = this.__onClickCommit.bind(this);
    (this: any)._onTogglePublish = this._onTogglePublish.bind(this);
    (this: any)._onToggleAmendRebase = this._onToggleAmendRebase.bind(this);
    (this: any)._onClickBack = this._onClickBack.bind(this);
    (this: any)._onTogglePrepare = this._onTogglePrepare.bind(this);
    (this: any)._onToggleVerbatim = this._onToggleVerbatim.bind(this);
    (this: any)._onLintExcuseChange = this._onLintExcuseChange.bind(this);
    (this: any)._onToggleInteractiveCommit = this._onToggleInteractiveCommit.bind(this);
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
    this.refs.message.getModel().setCursorBufferPosition([0, 0]);
    this.refs.message.getElement().focus();
  }

  _isLoading(): boolean {
    const {commitModeState} = this.props;
    return commitModeState !== CommitModeState.READY;
  }

  _addTooltip(title: string): (elementRef: React.Element<any>) => void {
    return addTooltip({
      title,
      delay: 200,
      placement: 'top',
    });
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
          ref={this._addTooltip(
            'Whether to rebase any child revisions on top of the newly amended revision.',
          )}
        />
      );
    }

    let interactiveOptionElement;
    if (
      this.props.hasUncommittedChanges &&
      this.props.enabledFeatures.has(DiffViewFeatures.INTERACTIVE)
    ) {
      interactiveOptionElement = (
        <Checkbox
          className="padded"
          checked={this.props.shouldCommitInteractively}
          disabled={isLoading}
          label="Use interactive mode"
          onChange={this._onToggleInteractiveCommit}
          tabIndex="-1"
          ref={this._addTooltip(
            'Whether to include all uncommitted changes or to select specific ones',
          )}
        />
      );
    }

    let prepareOptionElement;
    let verbatimeOptionElement;
    let lintExcuseElement;
    if (this.props.shouldPublishOnCommit) {
      prepareOptionElement = (
        <Checkbox
          className="padded"
          checked={this.props.isPrepareMode}
          disabled={isLoading}
          label="Prepare"
          onChange={this._onTogglePrepare}
          ref={this._addTooltip(
            'Whether to mark the new created revision as unpublished.',
          )}
        />
      );

      verbatimeOptionElement = (
        <Checkbox
          className="padded"
          checked={this.props.verbatimModeEnabled}
          disabled={isLoading}
          label="Verbatim"
          onChange={this._onToggleVerbatim}
          ref={this._addTooltip(
            'Whether to override the diff\'s ' +
            'commit message on Phabricator with that of your local commit.',
          )}
        />
      );

      lintExcuseElement = (
        <AtomInput
          className="nuclide-diff-view-excuse"
          size="sm"
          ref={this._addTooltip(
            'Leave this box empty to run local lint and unit tests or ' +
            'enter an excuse to skip them.',
          )}
          onDidChange={this._onLintExcuseChange}
          placeholderText="(Optional) Excuse"
          disabled={isLoading}
          value={this.props.lintExcuse}
          width={200}
        />
      );
    }

    return (
      <Toolbar location="bottom">
        <ToolbarLeft>
          {rebaseOptionElement}
          {interactiveOptionElement}
          <Checkbox
            className="padded"
            checked={this.props.shouldPublishOnCommit}
            disabled={isLoading}
            label="Submit for review"
            onChange={this._onTogglePublish}
            ref={this._addTooltip(
              'Whether to automatically submit your changes to Phabricator ' +
              'for review after committing or amending it.',
            )}
          />
          {prepareOptionElement}
          {verbatimeOptionElement}
          {lintExcuseElement}
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
            grammar={atom.grammars.grammarForScopeName('source.fb-arcanist-editor')}
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

  __onClickCommit(bookmarkName?: string): void {
    this.props.diffModel.commit(this.__getCommitMessage(), bookmarkName);
  }

  _onClickBack(): void {
    this.props.diffModel.setViewMode(DiffMode.BROWSE_MODE);
  }

  __getCommitMessage(): string {
    return this.refs.message.getTextBuffer().getText();
  }

  _onToggleAmendRebase(isChecked: boolean): void {
    this.props.diffModel.setShouldAmendRebase(isChecked);
  }

  _onToggleInteractiveCommit(isChecked: boolean): void {
    this.props.diffModel.setShouldCommitInteractively(isChecked);
  }

  _onTogglePublish(isChecked: boolean): void {
    this.props.diffModel.setShouldPublishOnCommit(isChecked);
  }

  _onTogglePrepare(isChecked: boolean): void {
    this.props.diffModel.setIsPrepareMode(isChecked);
  }

  _onToggleVerbatim(isChecked: boolean): void {
    this.props.diffModel.setVerbatimModeEnabled(isChecked);
  }

  _onLintExcuseChange(newExcuse: string): void {
    this.props.diffModel.setLintExcuse(newExcuse);
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }
}
