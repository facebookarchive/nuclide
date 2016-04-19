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
import type {RevisionsState} from './types';
import type {RevisionInfo} from '../../nuclide-hg-repository-base/lib/HgService';

import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

import classnames from 'classnames';

type DiffTimelineViewProps = {
  diffModel: DiffViewModel;
  onSelectionChange: (revisionInfo: RevisionInfo) => any;
};

type DiffTimelineViewState = {
  revisionsState: ?RevisionsState;
};

export default class DiffTimelineView extends React.Component {
  props: DiffTimelineViewProps;
  state: DiffTimelineViewState;
  _subscriptions: CompositeDisposable;

  constructor(props: DiffTimelineViewProps) {
    super(props);
    this._subscriptions = new CompositeDisposable();
    const {diffModel} = props;
    this.state = {
      revisionsState: null,
    };
    const boundUpdateRevisions = this._updateRevisions.bind(this);
    this._subscriptions.add(
      diffModel.onRevisionsUpdate(boundUpdateRevisions)
    );
    diffModel.getActiveRevisionsState().then(boundUpdateRevisions);
  }

  _updateRevisions(newRevisionsState: ?RevisionsState): void {
    this.setState({
      revisionsState: newRevisionsState,
    });
  }

  render(): ?React.Element {
    let content = null;
    const {revisionsState} = this.state;
    if (revisionsState == null) {
      content = 'Revisions not loaded...';
    } else {
      const {revisions, compareCommitId, commitId} = revisionsState;
      content = (
        <RevisionsTimelineComponent
          revisions={revisions}
          compareRevisionId={compareCommitId || commitId}
          onSelectionChange={this.props.onSelectionChange}
        />
      );
    }
    return (
      <div className="diff-timeline padded">
        {content}
      </div>
    );
  }

  handleSelectionChange(revision: RevisionInfo): void {
    this.props.onSelectionChange(revision);
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }
}

type RevisionsComponentProps = {
  revisions: Array<RevisionInfo>;
  compareRevisionId: number;
  onSelectionChange: (revisionInfo: RevisionInfo) => any;
};

class RevisionsTimelineComponent extends React.Component {
  props: RevisionsComponentProps;

  render(): React.Element {
    const {revisions, compareRevisionId} = this.props;
    const latestToOldestRevisions = revisions.slice().reverse();
    const selectedIndex = latestToOldestRevisions.findIndex(
      revision => revision.id === compareRevisionId
    );

    return (
      <div className="revision-timeline-wrap">
        <div className="revision-selector">
          <div className="revisions">
            {latestToOldestRevisions.map((revision, i) =>
              <RevisionTimelineNode
                index={i}
                key={revision.hash}
                selectedIndex={selectedIndex}
                revision={revision}
                revisionsCount={revisions.length}
                onSelectionChange={this.props.onSelectionChange}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

type RevisionTimelineNodeProps = {
  revision: RevisionInfo;
  index: number;
  selectedIndex: number;
  revisionsCount: number;
  onSelectionChange: (revisionInfo: RevisionInfo) => any;
};

class RevisionTimelineNode extends React.Component {
  props: RevisionTimelineNodeProps;

  render(): React.Element {
    const {revision, index, selectedIndex, revisionsCount} = this.props;
    const {bookmarks, title, author, hash, date} = revision;
    const revisionClassName = classnames({
      revision: true,
      'selected-revision-inrange': index < selectedIndex,
      'selected-revision-start': index === 0,
      'selected-revision-end': index === selectedIndex,
      'selected-revision-last': index === revisionsCount - 1,
    });
    const tooltip = `${hash}: ${title}
  Author: ${author}
  Date: ${date}`;
    const bookmarksToRender = bookmarks.slice();
    // Add `BASE`
    if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
      bookmarksToRender.push('HEAD');
    }
    if (index === revisionsCount - 1 && bookmarks.length === 0) {
      bookmarksToRender.push('BASE');
    }
    return (
      <div
        className={revisionClassName}
        onClick={this.handleSelectionChange.bind(this, revision)}
        title={tooltip}>
        <div className="revision-bubble" />
        <div className="revision-label">
          {title} ({bookmarksToRender.length ? bookmarksToRender.join(',') : hash})
        </div>
      </div>
    );
  }

  handleSelectionChange(): void {
    this.props.onSelectionChange(this.props.revision);
  }
}
