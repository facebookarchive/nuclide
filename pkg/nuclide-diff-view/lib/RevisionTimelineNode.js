'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RevisionInfo} from '../../nuclide-hg-repository-base/lib/HgService';

import classnames from 'classnames';
import {React} from 'react-for-atom';

type RevisionTimelineNodeProps = {
  revision: RevisionInfo;
  index: number;
  selectedIndex: number;
  revisionsCount: number;
  onSelectionChange: (revisionInfo: RevisionInfo) => any;
};

export default class RevisionTimelineNode extends React.Component {
  props: RevisionTimelineNodeProps;

  constructor(props: RevisionTimelineNodeProps) {
    super(props);
    (this: any).handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  handleSelectionChange(): void {
    this.props.onSelectionChange(this.props.revision);
  }

  render(): React.Element {
    const {revision, index, selectedIndex, revisionsCount} = this.props;
    const {bookmarks, title, author, hash, date} = revision;
    const revisionClassName = classnames('revision revision--actionable', {
      'selected-revision-inrange': index < selectedIndex,
      'selected-revision-end': index === selectedIndex,
      'selected-revision-last': index === revisionsCount - 1,
    });
    const tooltip = `${hash}: ${title}
  Author: ${author}
  Date: ${date}`;

    const bookmarksToRender = bookmarks.slice();
    if (index === 0 && revisionsCount > 1 && bookmarks.length === 0) {
      bookmarksToRender.push('HEAD');
    }
    if (index === revisionsCount - 1 && bookmarks.length === 0) {
      bookmarksToRender.push('BASE');
    }

    return (
      <div
        className={revisionClassName}
        onClick={this.handleSelectionChange}
        title={tooltip}>
        <div className="revision-bubble" />
        <div className="revision-label text-monospace">
          {title} ({bookmarksToRender.length ? bookmarksToRender.join(',') : hash})
        </div>
      </div>
    );
  }
}
