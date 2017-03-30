'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _react = _interopRequireDefault(require('react'));

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _url = _interopRequireDefault(require('url'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ACTIVE_BOOKMARK_TITLE = 'Active bookmark'; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  */

const LOADING_BOOKMARK_TITLE = 'Loading...';

class RepositorySectionComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    this._handleRepoGearClick = this._handleRepoGearClick.bind(this);
    this._handleUncommittedFilesExpandedChange = this._handleUncommittedFilesExpandedChange.bind(this);

    this.state = {
      uncommittedChangesExpanded: true
    };
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

  _onFileChosen(filePath) {
    const diffEntityOptions = { file: filePath };
    const formattedUrl = _url.default.format({
      protocol: 'atom',
      host: 'nuclide',
      pathname: 'diff-view',
      slashes: true,
      query: diffEntityOptions
    });

    // Not a file URI
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open(formattedUrl);
  }

  _handleUncommittedFilesExpandedChange(isCollapsed) {
    this.setState({ uncommittedChangesExpanded: !isCollapsed });
  }

  render() {
    const repository = this.props.repository;
    const selectedItem = this.props.selectedItem;

    let bookmarksBranchesHeader;
    let bookmarksBranchesList;
    let createButton;
    let uncommittedChangesSection;
    if (repository != null) {
      if (repository.getType() === 'hg') {
        bookmarksBranchesHeader = 'BOOKMARKS';
        createButton = _react.default.createElement((_Button || _load_Button()).Button, {
          size: (_Button || _load_Button()).ButtonSizes.SMALL,
          icon: 'plus',
          onClick: this._handleRepoGearClick,
          style: { marginTop: '6px', position: 'absolute', right: '10px' },
          title: 'Create bookmark...'
        });
      } else if (repository.getType() === 'git') {
        bookmarksBranchesHeader = 'BRANCHES';
      } else {
        bookmarksBranchesHeader = `UNSUPPORTED REPOSITORY TYPE ${repository.getType()}`;
      }

      if (repository.getType() === 'hg') {
        let bookmarksBranchesListItems;
        const repositoryBookmarks = this.props.bookmarks;
        if (repositoryBookmarks == null) {
          bookmarksBranchesListItems = _react.default.createElement(
            'li',
            { className: 'list-item nuclide-source-control-side-bar--list-item text-subtle' },
            'Loading...'
          );
        } else if (repositoryBookmarks.length === 0) {
          bookmarksBranchesListItems = _react.default.createElement(
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
              loadingSpinner = _react.default.createElement('span', { className: 'loading loading-spinner-tiny inline-block inline-block-tight' });
            }

            // We need to use native event handling so that we can preempt Electron's menu.
            let sub;
            const cb = el => {
              if (el == null) {
                if (sub != null) {
                  sub.unsubscribe();
                  sub = null;
                }
                return;
              }
              sub = _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'contextmenu').filter(() => !isLoading).subscribe(event => {
                this._handleBookmarkContextMenu(bookmark, event);
              });
            };

            return _react.default.createElement(
              'li',
              {
                ref: cb,
                className: liClassName,
                key: bookmark.bookmark,
                onClick: this._handleBookmarkClick.bind(this, bookmark),
                title: title },
              _react.default.createElement(
                'span',
                { className: iconClassName },
                loadingSpinner,
                bookmark.bookmark
              )
            );
          });
        }
        bookmarksBranchesList = _react.default.createElement(
          'ul',
          { className: 'list-group' },
          bookmarksBranchesListItems
        );

        const uncommittedChanges = this.props.uncommittedChanges.get(repository.getPath());
        if (repository != null && uncommittedChanges != null && uncommittedChanges.size > 0) {
          uncommittedChangesSection = _react.default.createElement(
            (_Section || _load_Section()).Section,
            {
              className: 'nuclide-file-tree-section-caption',
              collapsable: true,
              collapsed: !this.state.uncommittedChangesExpanded,
              headline: 'UNCOMMITTED CHANGES',
              onChange: this._handleUncommittedFilesExpandedChange,
              size: 'small' },
            _react.default.createElement(
              'div',
              { className: 'nuclide-source-control-side-bar-uncommitted-changes' },
              _react.default.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
                fileChanges: this.props.uncommittedChanges,
                rootPath: repository.getPath(),
                commandPrefix: 'sc-sidebar',
                selectedFile: null,
                hideEmptyFolders: true,
                shouldShowFolderName: false,
                onFileChosen: this._onFileChosen
              })
            )
          );
        }
      } else {
        bookmarksBranchesList = _react.default.createElement(
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
      separator = _react.default.createElement((_HR || _load_HR()).HR, null);
    }

    return _react.default.createElement(
      'li',
      null,
      separator,
      _react.default.createElement(
        'h6',
        { className: 'text-highlight nuclide-source-control-side-bar--repo-header' },
        this.props.title
      ),
      _react.default.createElement(
        'div',
        { className: 'nuclide-source-control-side-bar--header' },
        uncommittedChangesSection
      ),
      createButton,
      _react.default.createElement(
        'h6',
        { className: 'nuclide-source-control-side-bar--header' },
        bookmarksBranchesHeader
      ),
      bookmarksBranchesList
    );
  }
}
exports.default = RepositorySectionComponent;