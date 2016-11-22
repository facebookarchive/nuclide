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
import type {
  PublishModeType,
  PublishModeStateType,
  SuggestedReviewersState,
} from './types';

import {getPhabricatorRevisionFromCommitMessage} from '../../nuclide-arcanist-rpc/lib/utils';
import {AtomTextEditor} from '../../nuclide-ui/AtomTextEditor';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import classnames from 'classnames';
import {DiffMode, PublishMode, PublishModeState} from './constants';
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

type DiffRevisionViewProps = {
  commitMessage: string,
};

class DiffRevisionView extends React.Component {
  props: DiffRevisionViewProps;

  render(): React.Element<any> {
    const {commitMessage} = this.props;
    const commitTitle = commitMessage.split(/\n/)[0];
    const revision = getPhabricatorRevisionFromCommitMessage(commitMessage);

    return (revision == null)
      ? <span />
      : (
        <a href={revision.url} title={commitTitle}>
          {revision.name}
        </a>
      );
  }
}

type Props = {
  message: ?string,
  publishMode: PublishModeType,
  publishModeState: PublishModeStateType,
  headCommitMessage: ?string,
  diffModel: DiffViewModel,
  suggestedReviewers: SuggestedReviewersState,
};

type State = {
  isPrepareMode: boolean,
};

export default class DiffPublishView extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickBack = this._onClickBack.bind(this);
    (this: any).__onClickPublish = this.__onClickPublish.bind(this);
    (this: any)._onTogglePrepare = this._onTogglePrepare.bind(this);
    this.state = {
      isPrepareMode: false,
    };
  }

  componentDidMount(): void {
    this.__populatePublishText();
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      this.props.message !== prevProps.message ||
      this.props.publishModeState !== prevProps.publishModeState
    ) {
      this.__populatePublishText();
    }
  }

  __populatePublishText(): void {
    const messageEditor = this.refs.message;
    messageEditor.getTextBuffer().setText(this.props.message || '');
  }

  __onClickPublish(): void {
    const isPrepareChecked = this.state.isPrepareMode;

    this.props.diffModel.publishDiff(
      this.__getPublishMessage() || '',
      isPrepareChecked,
      null,
    );
  }

  __getPublishMessage(): ?string {
    const messageEditor = this.refs.message;
    return messageEditor.getTextBuffer().getText();
  }

  __getStatusEditor(): React.Element<any> {
    const {publishModeState} = this.props;
    const isBusy = publishModeState === PublishModeState.LOADING_PUBLISH_MESSAGE
      || publishModeState === PublishModeState.AWAITING_PUBLISH;
    return (
      <AtomTextEditor
        ref="message"
        softWrapped={true}
        readOnly={isBusy}
        syncTextContents={false}
        gutterHidden={true}
      />
    );
  }

  _getToolbar(): React.Element<any> {
    const {publishModeState, publishMode, headCommitMessage} = this.props;
    let revisionView;
    if (headCommitMessage != null) {
      revisionView = <DiffRevisionView commitMessage={headCommitMessage} />;
    }
    let isBusy;
    let publishMessage;
    switch (publishModeState) {
      case PublishModeState.READY:
        isBusy = false;
        if (publishMode === PublishMode.CREATE) {
          publishMessage = 'Publish Phabricator Revision';
        } else {
          publishMessage = 'Update Phabricator Revision';
        }
        break;
      case PublishModeState.LOADING_PUBLISH_MESSAGE:
        isBusy = true;
        publishMessage = 'Loading...';
        break;
      case PublishModeState.AWAITING_PUBLISH:
        isBusy = true;
        publishMessage = 'Publishing...';
        break;
      case PublishModeState.PUBLISH_ERROR:
        isBusy = false;
        publishMessage = 'Fixed? - Retry Publishing';
        break;
      default:
        throw new Error('Invalid publish mode!');
    }

    const publishButton = (
      <Button
        className={classnames({'btn-progress': isBusy})}
        size={ButtonSizes.SMALL}
        buttonType={ButtonTypes.PRIMARY}
        onClick={this.__onClickPublish}
        disabled={isBusy}>
        {publishMessage}
      </Button>
    );

    let prepareOptionElement;
    if (publishMode === PublishMode.CREATE) {
      prepareOptionElement = (
        <Checkbox
          checked={this.state.isPrepareMode}
          className="padded"
          label="Prepare"
          tabIndex="-1"
          onChange={this._onTogglePrepare}
        />
      );
    }

    return (
      <div className="publish-toolbar-wrapper">
        <Toolbar location="bottom">
          <ToolbarLeft className="nuclide-diff-view-publish-toolbar-left">
            {revisionView}
            {prepareOptionElement}
          </ToolbarLeft>
          <ToolbarRight>
            <ButtonGroup size={ButtonGroupSizes.SMALL}>
              <Button
                size={ButtonSizes.SMALL}
                onClick={this._onClickBack}>
                Back
              </Button>
              {publishButton}
            </ButtonGroup>
          </ToolbarRight>
        </Toolbar>
      </div>
    );
  }

  render(): React.Element<any> {
    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          {this.__getStatusEditor()}
        </div>
        {this._getToolbar()}
      </div>
    );
  }

  _onTogglePrepare(isChecked: boolean): void {
    this.setState({isPrepareMode: isChecked});
  }

  _onClickBack(): void {
    const {publishModeState} = this.props;
    const diffMode = publishModeState === PublishModeState.PUBLISH_ERROR
      ? DiffMode.PUBLISH_MODE
      : DiffMode.BROWSE_MODE;
    this.props.diffModel.setViewMode(diffMode);
  }
}
