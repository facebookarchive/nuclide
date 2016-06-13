'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BookmarkInfo} from '../../nuclide-hg-repository-base/lib/HgService';
import type {SelectableItem} from './SideBarComponent';

import classnames from 'classnames';
import invariant from 'assert';
import {React} from 'react-for-atom';

type Props = {
  bookmarks: ?Array<BookmarkInfo>;
  hasSeparator: boolean;
  onBookmarkClick: (bookmark: BookmarkInfo, repository: atom$Repository) => mixed;
  onBookmarkContextMenu:
    (bookmark: BookmarkInfo, repository: atom$Repository, event: SyntheticMouseEvent) => mixed;
  onRepoGearClick: (repository: atom$Repository, event: SyntheticMouseEvent) => mixed;
  onUncommittedChangesClick: (repository: atom$Repository) => mixed;
  repository: ?atom$Repository;
  selectedItem: ?SelectableItem;
  title: string;
};

// Returns true if the given bookmarks are not void and are deeply equal.
function bookmarkIsEqual(a: ?BookmarkInfo, b: ?BookmarkInfo) {
  return a != null
    && b != null
    && a.rev === b.rev
    && a.bookmark === b.bookmark;
}

const ACTIVE_BOOKMARK_TITLE = 'Active bookmark';

export default class RepositorySectionComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    (this: any)._handleRepoGearClick = this._handleRepoGearClick.bind(this);
    (this: any)._handleUncommittedChangesClick = this._handleUncommittedChangesClick.bind(this);
  }

  _handleBookmarkClick(bookmark: BookmarkInfo) {
    invariant(this.props.repository != null);
    this.props.onBookmarkClick(bookmark, this.props.repository);
  }

  _handleBookmarkContextMenu(bookmark: BookmarkInfo, event: SyntheticMouseEvent) {
    invariant(this.props.repository != null);
    this.props.onBookmarkContextMenu(bookmark, this.props.repository, event);
  }

  _handleRepoGearClick(event: SyntheticMouseEvent) {
    invariant(this.props.repository != null);
    this.props.onRepoGearClick(this.props.repository, event);
  }

  _handleUncommittedChangesClick() {
    invariant(this.props.repository != null);
    this.props.onUncommittedChangesClick(this.props.repository);
  }

  render(): React.Element<any> {
    const repository = this.props.repository;
    const selectedItem = this.props.selectedItem;

    let bookmarksBranchesHeader;
    let bookmarksBranchesList;
    let createButton;
    if (repository != null) {
      if (repository.getType() === 'hg') {
        bookmarksBranchesHeader = 'BOOKMARKS';
        createButton = (
          <button
            className="btn btn-sm icon icon-plus"
            onClick={this._handleRepoGearClick}
            style={{marginTop: '6px', position: 'absolute', right: '10px'}}
            title="Create bookmark..."
          />
        );
      } else if (repository.getType() === 'git') {
        bookmarksBranchesHeader = 'BRANCHES';
      } else {
        bookmarksBranchesHeader = `UNSUPPORTED REPOSITORY TYPE ${repository.getType()}`;
      }

      if (repository.getType() === 'hg') {
        let bookmarksBranchesListItems;
        const repositoryBookmarks = this.props.bookmarks;
        if (repositoryBookmarks == null) {
          bookmarksBranchesListItems = (
            <li className="list-item nuclide-source-control-side-bar--list-item text-subtle">
              Loading...
            </li>
          );
        } else if (repositoryBookmarks.length === 0) {
          bookmarksBranchesListItems = (
            <li className="list-item nuclide-source-control-side-bar--list-item text-subtle">
              None
            </li>
          );
        } else {
          bookmarksBranchesListItems = repositoryBookmarks.map(bookmark => {
            // Deeply compare bookmarks because the Objects get re-created when bookmarks are
            // re-fetched and will not remain equal across fetches.
            const isSelected = selectedItem != null
              && selectedItem.type === 'bookmark'
              && bookmarkIsEqual(bookmark, selectedItem.bookmark);
            let liClassName = classnames(
              'list-item nuclide-source-control-side-bar--list-item', {
                selected: isSelected,
              }
            );

            let title;
            if (bookmark.active) {
              title = ACTIVE_BOOKMARK_TITLE;
            }

            const iconClassName = classnames('icon', {
              'icon-bookmark': !bookmark.active,
              'icon-check': bookmark.active,
              // Don't apply `success` when the bookmark is selected because the resulting text
              // contrast ratio can be illegibly low in core themes.
              'text-success': bookmark.active && !isSelected,
            });

            return (
              <li
                className={liClassName}
                key={bookmark.bookmark}
                onClick={this._handleBookmarkClick.bind(this, bookmark)}
                onContextMenu={this._handleBookmarkContextMenu.bind(this, bookmark)}
                title={title}>
                <span className={iconClassName}>
                  {bookmark.bookmark}
                </span>
              </li>
            );
          });
        }
        bookmarksBranchesList = (
          <ul className="list-group">
            {bookmarksBranchesListItems}
          </ul>
        );
      } else {
        bookmarksBranchesList = (
          <div className="nuclide-source-control-side-bar--header text-info">
            Only Mercurial repositories are supported. '{repository.getType()}' found.
          </div>
        );
      }
    }

    let separator;
    if (this.props.hasSeparator) {
      separator = <hr className="nuclide-source-control-side-bar--repo-separator" />;
    }

    const uncommittedChangesClassName = classnames(
      'list-item nuclide-source-control-side-bar--list-item',
      {
        selected: selectedItem != null && selectedItem.type === 'uncommitted',
      }
    );
    return (
      <li>
        {separator}
        <h6 className="text-highlight nuclide-source-control-side-bar--repo-header">
          {this.props.title}
        </h6>
        <ul className="list-group">
          <li
            className={uncommittedChangesClassName}
            onClick={this._handleUncommittedChangesClick}>
            <span>
              Uncommitted Changes
            </span>
          </li>
        </ul>
        {createButton}
        <h6 className="nuclide-source-control-side-bar--header">
          {bookmarksBranchesHeader}
        </h6>
        {bookmarksBranchesList}
      </li>
    );
  }

}
