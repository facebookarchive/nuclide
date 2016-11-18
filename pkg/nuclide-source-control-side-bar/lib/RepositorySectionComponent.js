'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _bookmarkIsEqual;

function _load_bookmarkIsEqual() {
  return _bookmarkIsEqual = _interopRequireDefault(require('./bookmarkIsEqual'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _HR;

function _load_HR() {
  return _HR = require('../../nuclide-ui/HR');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ACTIVE_BOOKMARK_TITLE = 'Active bookmark';
const LOADING_BOOKMARK_TITLE = 'Loading...';

let RepositorySectionComponent = class RepositorySectionComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    this._handleRepoGearClick = this._handleRepoGearClick.bind(this);
    this._handleUncommittedChangesClick = this._handleUncommittedChangesClick.bind(this);
  }

  _handleBookmarkClick(bookmark) {
    if (!(this.props.repository != null)) {
      throw new Error('Invariant violation: "this.props.repository != null"');
    }

    this.props.onBookmarkClick(bookmark, this.props.repository);
  }

  _handleBookmarkContextMenu(bookmark, event) {
    if (!(this.props.repository != null)) {
      throw new Error('Invariant violation: "this.props.repository != null"');
    }

    this.props.onBookmarkContextMenu(bookmark, this.props.repository, event);
  }

  _handleRepoGearClick(event) {
    if (!(this.props.repository != null)) {
      throw new Error('Invariant violation: "this.props.repository != null"');
    }

    this.props.onRepoGearClick(this.props.repository, event);
  }

  _handleUncommittedChangesClick() {
    if (!(this.props.repository != null)) {
      throw new Error('Invariant violation: "this.props.repository != null"');
    }

    this.props.onUncommittedChangesClick(this.props.repository);
  }

  render() {
    const repository = this.props.repository;
    const selectedItem = this.props.selectedItem;

    let bookmarksBranchesHeader;
    let bookmarksBranchesList;
    let createButton;
    if (repository != null) {
      if (repository.getType() === 'hg') {
        bookmarksBranchesHeader = 'BOOKMARKS';
        createButton = _reactForAtom.React.createElement('button', {
          className: 'btn btn-sm icon icon-plus',
          onClick: this._handleRepoGearClick,
          style: { marginTop: '6px', position: 'absolute', right: '10px' },
          title: 'Create bookmark...'
        });
      } else if (repository.getType() === 'git') {
        bookmarksBranchesHeader = 'BRANCHES';
      } else {
        bookmarksBranchesHeader = `UNSUPPORTED REPOSITORY TYPE ${ repository.getType() }`;
      }

      if (repository.getType() === 'hg') {
        let bookmarksBranchesListItems;
        const repositoryBookmarks = this.props.bookmarks;
        if (repositoryBookmarks == null) {
          bookmarksBranchesListItems = _reactForAtom.React.createElement(
            'li',
            { className: 'list-item nuclide-source-control-side-bar--list-item text-subtle' },
            'Loading...'
          );
        } else if (repositoryBookmarks.length === 0) {
          bookmarksBranchesListItems = _reactForAtom.React.createElement(
            'li',
            { className: 'list-item nuclide-source-control-side-bar--list-item text-subtle' },
            'None'
          );
        } else {
          bookmarksBranchesListItems = repositoryBookmarks.map(bookmark => {
            // If there is a list of "loading" bookmarks and this bookmark is in it, this bookmark
            // is in the "loading" state.
            const isLoading = this.props.bookmarksIsLoading != null && this.props.bookmarksIsLoading.find(loadingBookmark => (0, (_bookmarkIsEqual || _load_bookmarkIsEqual()).default)(bookmark, loadingBookmark)) != null;

            const isSelected = selectedItem != null && selectedItem.type === 'bookmark' && (0, (_bookmarkIsEqual || _load_bookmarkIsEqual()).default)(bookmark, selectedItem.bookmark);
            const liClassName = (0, (_classnames || _load_classnames()).default)('list-item nuclide-source-control-side-bar--list-item', {
              selected: isSelected
            });

            let title;
            if (bookmark.active) {
              title = ACTIVE_BOOKMARK_TITLE;
            } else if (isLoading) {
              title = LOADING_BOOKMARK_TITLE;
            }

            const iconClassName = (0, (_classnames || _load_classnames()).default)('icon', {
              // Don't display the icon when loading but still apply `.icon` because it affects
              // rendering of its content.
              'icon-bookmark': !bookmark.active && !isLoading,
              'icon-check': bookmark.active && !isLoading,
              'text-subtle': isLoading,
              // * Don't apply `success` when the bookmark is selected because the resulting text
              //   contrast ratio can be illegibly low in core themes.
              // * Don't apply `success` when it's loading like during a rename.
              'text-success': bookmark.active && !isSelected && !isLoading
            });

            let loadingSpinner;
            if (isLoading) {
              loadingSpinner = _reactForAtom.React.createElement('span', { className: 'loading loading-spinner-tiny inline-block inline-block-tight' });
            }

            let onContextMenu;
            if (!isLoading) {
              // When the bookmark is not loading, show its context menu so actions can be taken on
              // it.
              onContextMenu = this._handleBookmarkContextMenu.bind(this, bookmark);
            }

            return _reactForAtom.React.createElement(
              'li',
              {
                className: liClassName,
                key: bookmark.bookmark,
                onClick: this._handleBookmarkClick.bind(this, bookmark),
                onContextMenu: onContextMenu,
                title: title },
              _reactForAtom.React.createElement(
                'span',
                { className: iconClassName },
                loadingSpinner,
                bookmark.bookmark
              )
            );
          });
        }
        bookmarksBranchesList = _reactForAtom.React.createElement(
          'ul',
          { className: 'list-group' },
          bookmarksBranchesListItems
        );
      } else {
        bookmarksBranchesList = _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-source-control-side-bar--header text-info' },
          'Only Mercurial repositories are supported. \'',
          repository.getType(),
          '\' found.'
        );
      }
    }

    let separator;
    if (this.props.hasSeparator) {
      separator = _reactForAtom.React.createElement((_HR || _load_HR()).HR, null);
    }

    const uncommittedChangesClassName = (0, (_classnames || _load_classnames()).default)('list-item nuclide-source-control-side-bar--list-item', {
      selected: selectedItem != null && selectedItem.type === 'uncommitted'
    });
    return _reactForAtom.React.createElement(
      'li',
      null,
      separator,
      _reactForAtom.React.createElement(
        'h6',
        { className: 'text-highlight nuclide-source-control-side-bar--repo-header' },
        this.props.title
      ),
      _reactForAtom.React.createElement(
        'ul',
        { className: 'list-group' },
        _reactForAtom.React.createElement(
          'li',
          {
            className: uncommittedChangesClassName,
            onClick: this._handleUncommittedChangesClick },
          _reactForAtom.React.createElement(
            'span',
            null,
            'Uncommitted Changes'
          )
        )
      ),
      createButton,
      _reactForAtom.React.createElement(
        'h6',
        { className: 'nuclide-source-control-side-bar--header' },
        bookmarksBranchesHeader
      ),
      bookmarksBranchesList
    );
  }

};
exports.default = RepositorySectionComponent;
module.exports = exports['default'];