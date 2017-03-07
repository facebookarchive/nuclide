/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {RevisionInfo} from '../../nuclide-hg-rpc/lib/HgService';
import type {
  RevisionStatusDisplay,
} from '../../nuclide-hg-repository-client/lib/HgRepositoryClient';

import classnames from 'classnames';
import {getPhabricatorRevisionFromCommitMessage} from '../../nuclide-arcanist-rpc/lib/utils';
import {getCommitAuthorFromAuthorEmail} from '../../nuclide-arcanist-rpc/lib/utils';
import React from 'react';
import {track} from '../../nuclide-analytics';

type RevisionTimelineNodeProps = {
  revisionStatus: ?RevisionStatusDisplay,
  index: number,
  onSelectionChange: () => any,
  revision: RevisionInfo,
  revisionsCount: number,
  selectedIndex: number,
};

export default class RevisionTimelineNode extends React.Component {
  props: RevisionTimelineNodeProps;

  constructor(props: RevisionTimelineNodeProps) {
    super(props);
    (this: any)._handlePhabricatorRevisionClick = this._handlePhabricatorRevisionClick.bind(this);
  }

  _handlePhabricatorRevisionClick(event: SyntheticMouseEvent): void {
    // Clicking an anchor opens the `href` in the browser. Stop propagation so it doesn't affect
    // the node selection in the Timeline.
    event.stopPropagation();

    const revision = getPhabricatorRevisionFromCommitMessage(this.props.revision.description);
    track('diff-view-phabricator-diff-open', {revision});
  }

  render(): React.Element<any> {
    const {revisionStatus, index, revision, revisionsCount, selectedIndex} = this.props;
    const {author, bookmarks, date, description, hash, title} = revision;
    const revisionClassName = classnames('revision', {
      'selected-revision-inrange': index < selectedIndex - 1,
      'selected-revision-end': index === selectedIndex - 1,
      'selected-revision-last': index === revisionsCount - 2,
    });
    const tooltip = `${hash}: ${title}
  Author: ${author}
  Date: ${date.toString()}`;

    const commitAuthor = getCommitAuthorFromAuthorEmail(author);
    let commitAuthorElement;
    if (commitAuthor != null) {
      commitAuthorElement = (
        <span className="inline-block">{commitAuthor}</span>
      );
    }

    const phabricatorRevision = getPhabricatorRevisionFromCommitMessage(description);
    let phabricatorRevisionElement;
    if (phabricatorRevision != null) {
      phabricatorRevisionElement = (
        <a
          className="inline-block"
          href={phabricatorRevision.url}
          onClick={this._handlePhabricatorRevisionClick}>
          <strong>{phabricatorRevision.name}</strong>
        </a>
      );
    }

    let revisionStatusElement;
    if (revisionStatus != null) {
      revisionStatusElement = (
        <span className={classnames('inline-block', revisionStatus.className)}>
          {revisionStatus.name}
        </span>
      );
    }

    let associatedExtraElement;
    try {
      // $FlowFB
      const diffUtils = require('../../commons-node/fb-vcs-utils.js');
      const taskIds = diffUtils.getFbCommitTaskInfoFromCommitMessage(description);
      associatedExtraElement = taskIds.map(task => {
        return (
          <a key={task.id} className="inline-block" href={task.url}>{task.name}</a>
        );
      });
    } catch (ex) {
      // There are no extra UI elements to show.
    }

    const bookmarksToRender = bookmarks.slice();
    if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
      bookmarksToRender.push('HEAD');
    }
    if (index === revisionsCount - 1 && bookmarks.length === 0) {
      bookmarksToRender.push('BASE');
    }

    let bookmarksElement;
    if (bookmarksToRender.length > 0) {
      bookmarksElement = (
        <span className="inline-block text-success">
          {bookmarksToRender.join(' ')}
        </span>
      );
    }

    return (
      <div
        className={revisionClassName}
        onClick={this.props.onSelectionChange}
        title={tooltip}>
        <div className="revision-bubble" />
        <div className="revision-label text-monospace">
          <span className="inline-block">{hash.substr(0, 7)}</span>
          {commitAuthorElement}
          {phabricatorRevisionElement}
          {revisionStatusElement}
          {associatedExtraElement}
          {bookmarksElement}
          <br />
          <span className="revision-title">
            {title}
          </span>
        </div>
      </div>
    );
  }
}
