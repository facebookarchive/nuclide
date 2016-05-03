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
import RevisionTimelineNode from './RevisionTimelineNode';
import UncommittedChangesTimelineNode from './UncommittedChangesTimelineNode';

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
    (this: any)._updateRevisions = this._updateRevisions.bind(this);
    this.state = {
      revisionsState: null,
    };
  }

  componentDidMount(): void {
    const {diffModel} = this.props;
    this._subscriptions.add(
      diffModel.onRevisionsUpdate(this._updateRevisions)
    );
    diffModel.getActiveRevisionsState().then(this._updateRevisions);
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
          compareRevisionId={compareCommitId || commitId}
          dirtyFileCount={this.props.diffModel.getActiveStackDirtyFileChanges().size}
          onSelectionChange={this.props.onSelectionChange}
          revisions={revisions}
        />
      );
    }

    return (
      <div className="nuclide-diff-timeline padded">
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
  compareRevisionId: number;
  dirtyFileCount: number;
  onSelectionChange: (revisionInfo: RevisionInfo) => any;
  revisions: Array<RevisionInfo>;
};

function RevisionsTimelineComponent(props: RevisionsComponentProps): React.Element {

  const {revisions, compareRevisionId} = props;
  const latestToOldestRevisions = revisions.slice().reverse();
  const selectedIndex = latestToOldestRevisions.findIndex(
    revision => revision.id === compareRevisionId
  );

  return (
    <div className="revision-timeline-wrap">
      <h5 style={{marginTop: 0}}>Compare Revisions</h5>
      <div className="revision-selector">
        <div className="revisions">
          <UncommittedChangesTimelineNode
            dirtyFileCount={props.dirtyFileCount}
          />
          {latestToOldestRevisions.map((revision, i) =>
            <RevisionTimelineNode
              index={i}
              key={revision.hash}
              selectedIndex={selectedIndex}
              revision={revision}
              revisionsCount={revisions.length}
              onSelectionChange={props.onSelectionChange}
            />
          )}
        </div>
      </div>
    </div>
  );

}
