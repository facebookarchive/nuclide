'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AtomTextEditor from '../../ui/atom-text-editor';
import type {RevisionInfo} from '../../hg-repository-base/lib/hg-constants';
import type DiffViewModel from './DiffViewModel';
import type {PublishModeType} from './types';

import {React} from 'react-for-atom';

type Props = {
  message: string;
  isPublishing: boolean;
  isLoading: boolean;
  publishMode: PublishModeType;
  headRevision: ?RevisionInfo;
  diffModel: DiffViewModel;
};

class DiffPublishView extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickPublish = this._onClickPublish.bind(this);
  }

  render(): ReactElement {
    const {isPublishing, isLoading} = this.props;
    const isBusy = isPublishing || isLoading;
    const publishButton = (
      <button className="btn btn-sm btn-success pull-right"
        onClick={this._onClickPublish}
        disabled={isBusy}>
        Publish to Phabricator
      </button>
    );
    let loadingIndicator = null;
    let progressIndicator = null;
    if (isLoading) {
      loadingIndicator = <span className="loading loading-spinner-tiny inline-block"></span>;
    }
    if (isPublishing) {
      progressIndicator = <progress className="inline-block"></progress>;
    }
    return (
      <div className="nuclide-diff-mode">
        <div className="message-editor-wrapper">
          <AtomTextEditor
            ref="message"
            readOnly={isBusy}
            gutterHidden={true}
          />
        </div>
        <div className="padded">
          {loadingIndicator}
          {progressIndicator}
          {publishButton}
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    this._setPublishText();
  }

  componentDidUpdate(prevProps: Props): void {
    const oldReadOnly = prevProps.isLoading || prevProps.isPublishing;
    const newReadOnly = this.props.isLoading || this.props.isPublishing;
    // Since changing readOnly destroys the text editor / buffer.
    // This should be fixed in AtomTextEditor.
    if (this.props.message !== prevProps.message || oldReadOnly !== newReadOnly) {
      this._setPublishText();
    }
  }

  componentWillUnmount(): void {
    // Save the latest edited publish message for layout switches.
    const message = this._getPublishMessage();
    // Let the component unmount before propagating the final message change to the model,
    // So the subsequent change event avoids re-rendering this component.
    process.nextTick(() => {
      this.props.diffModel.setPublishMessage(message);
    });
  }

  _setPublishText(): void {
    this.refs['message'].getTextBuffer().setText(this.props.message);
  }

  _onClickPublish(): void {
    this.props.diffModel.publishDiff(this._getPublishMessage());
  }

  _getPublishMessage(): string {
    return this.refs['message'].getTextBuffer().getText();
  }

}

module.exports = DiffPublishView;
