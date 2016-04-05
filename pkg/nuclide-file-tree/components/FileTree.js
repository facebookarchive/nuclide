'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {FileTreeStore} from '../lib/FileTreeStore';
import {React} from 'react-for-atom';
import {DirectoryEntryComponent} from './DirectoryEntryComponent';
import {EmptyComponent} from './EmptyComponent';
import {track} from '../../nuclide-analytics';
import {once} from '../../nuclide-commons';
import classnames from 'classnames';

class FileTree extends React.Component {
  state: Object;
  _store: FileTreeStore;

  static trackFirstRender = once(() => {
    const rootKeysLength = FileTreeStore.getInstance().roots.size;
    // Wait using `setTimeout` and not `process.nextTick` or `setImmediate`
    // because those queue tasks in the current and next turn of the event loop
    // respectively. Since `setTimeout` gets preempted by them, it works great
    // for a more realistic "first render". Note: The scheduler for promises
    // (`Promise.resolve().then`) runs on the same queue as `process.nextTick`
    // but with a higher priority.
    setTimeout(() => {
      track('filetree-first-render', {
        'time-to-render': String(process.uptime() * 1000),
        'root-keys': String(rootKeysLength),
      });
    });
  });

  constructor(props: void) {
    super(props);
    this._store = FileTreeStore.getInstance();
  }

  componentDidMount(): void {
    FileTree.trackFirstRender(this);
    this._scrollToTrackedNodeIfNeeded();
  }

  componentDidUpdate(): void {
    this._scrollToTrackedNodeIfNeeded();
  }

  _scrollToTrackedNodeIfNeeded(): void {
    const trackedChild = this.refs['tracked'];
    if (trackedChild != null) {
      trackedChild.scrollTrackedIntoView();
    }
  }

  render(): ReactElement {
    const classes = {
      'nuclide-file-tree': true,
      'focusable-panel': true,
      'tree-view': true,
      'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet(),
    };

    return (
      <div className={classnames(classes)} tabIndex={0}>
        {this._renderChildren()}
      </div>
    );
  }

  _renderChildren(): ReactElement {
    const roots = FileTreeStore.getInstance().roots;

    if (roots.isEmpty()) {
      return <EmptyComponent />;
    }

    const children = roots.filter(root => root.shouldBeShown)
      .toArray()
      .map((root, index) => {
        if (root.containsTrackedNode) {
          return <DirectoryEntryComponent key={index} node={root} ref="tracked" />;
        } else {
          return <DirectoryEntryComponent key={index} node={root} />;
        }
      });
    return (
      <ul className="list-tree has-collapsable-children">
        {children}
      </ul>
    );
  }
}

module.exports = FileTree;
