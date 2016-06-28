Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bookmarkIsEqual2;

function _bookmarkIsEqual() {
  return _bookmarkIsEqual2 = _interopRequireDefault(require('./bookmarkIsEqual'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var ACTIVE_BOOKMARK_TITLE = 'Active bookmark';
var LOADING_BOOKMARK_TITLE = 'Loading...';

var RepositorySectionComponent = (function (_React$Component) {
  _inherits(RepositorySectionComponent, _React$Component);

  function RepositorySectionComponent(props) {
    _classCallCheck(this, RepositorySectionComponent);

    _get(Object.getPrototypeOf(RepositorySectionComponent.prototype), 'constructor', this).call(this, props);
    this._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    this._handleRepoGearClick = this._handleRepoGearClick.bind(this);
    this._handleUncommittedChangesClick = this._handleUncommittedChangesClick.bind(this);
  }

  _createClass(RepositorySectionComponent, [{
    key: '_handleBookmarkClick',
    value: function _handleBookmarkClick(bookmark) {
      (0, (_assert2 || _assert()).default)(this.props.repository != null);
      this.props.onBookmarkClick(bookmark, this.props.repository);
    }
  }, {
    key: '_handleBookmarkContextMenu',
    value: function _handleBookmarkContextMenu(bookmark, event) {
      (0, (_assert2 || _assert()).default)(this.props.repository != null);
      this.props.onBookmarkContextMenu(bookmark, this.props.repository, event);
    }
  }, {
    key: '_handleRepoGearClick',
    value: function _handleRepoGearClick(event) {
      (0, (_assert2 || _assert()).default)(this.props.repository != null);
      this.props.onRepoGearClick(this.props.repository, event);
    }
  }, {
    key: '_handleUncommittedChangesClick',
    value: function _handleUncommittedChangesClick() {
      (0, (_assert2 || _assert()).default)(this.props.repository != null);
      this.props.onUncommittedChangesClick(this.props.repository);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var repository = this.props.repository;
      var selectedItem = this.props.selectedItem;

      var bookmarksBranchesHeader = undefined;
      var bookmarksBranchesList = undefined;
      var createButton = undefined;
      if (repository != null) {
        if (repository.getType() === 'hg') {
          bookmarksBranchesHeader = 'BOOKMARKS';
          createButton = (_reactForAtom2 || _reactForAtom()).React.createElement('button', {
            className: 'btn btn-sm icon icon-plus',
            onClick: this._handleRepoGearClick,
            style: { marginTop: '6px', position: 'absolute', right: '10px' },
            title: 'Create bookmark...'
          });
        } else if (repository.getType() === 'git') {
          bookmarksBranchesHeader = 'BRANCHES';
        } else {
          bookmarksBranchesHeader = 'UNSUPPORTED REPOSITORY TYPE ' + repository.getType();
        }

        if (repository.getType() === 'hg') {
          var bookmarksBranchesListItems = undefined;
          var repositoryBookmarks = this.props.bookmarks;
          if (repositoryBookmarks == null) {
            bookmarksBranchesListItems = (_reactForAtom2 || _reactForAtom()).React.createElement(
              'li',
              { className: 'list-item nuclide-source-control-side-bar--list-item text-subtle' },
              'Loading...'
            );
          } else if (repositoryBookmarks.length === 0) {
            bookmarksBranchesListItems = (_reactForAtom2 || _reactForAtom()).React.createElement(
              'li',
              { className: 'list-item nuclide-source-control-side-bar--list-item text-subtle' },
              'None'
            );
          } else {
            bookmarksBranchesListItems = repositoryBookmarks.map(function (bookmark) {
              // If there is a list of "loading" bookmarks and this bookmark is in it, this bookmark
              // is in the "loading" state.
              var isLoading = _this.props.bookmarksIsLoading != null && _this.props.bookmarksIsLoading.find(function (loadingBookmark) {
                return (0, (_bookmarkIsEqual2 || _bookmarkIsEqual()).default)(bookmark, loadingBookmark);
              }) != null;

              var isSelected = selectedItem != null && selectedItem.type === 'bookmark' && (0, (_bookmarkIsEqual2 || _bookmarkIsEqual()).default)(bookmark, selectedItem.bookmark);
              var liClassName = (0, (_classnames2 || _classnames()).default)('list-item nuclide-source-control-side-bar--list-item', {
                selected: isSelected
              });

              var title = undefined;
              if (bookmark.active) {
                title = ACTIVE_BOOKMARK_TITLE;
              } else if (isLoading) {
                title = LOADING_BOOKMARK_TITLE;
              }

              var iconClassName = (0, (_classnames2 || _classnames()).default)('icon', {
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

              var loadingSpinner = undefined;
              if (isLoading) {
                loadingSpinner = (_reactForAtom2 || _reactForAtom()).React.createElement('span', {
                  className: 'loading loading-spinner-tiny inline-block inline-block-tight' });
              }

              var onContextMenu = undefined;
              if (!isLoading) {
                // When the bookmark is not loading, show its context menu so actions can be taken on
                // it.
                onContextMenu = _this._handleBookmarkContextMenu.bind(_this, bookmark);
              }

              return (_reactForAtom2 || _reactForAtom()).React.createElement(
                'li',
                {
                  className: liClassName,
                  key: bookmark.bookmark,
                  onClick: _this._handleBookmarkClick.bind(_this, bookmark),
                  onContextMenu: onContextMenu,
                  title: title },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  'span',
                  { className: iconClassName },
                  loadingSpinner,
                  bookmark.bookmark
                )
              );
            });
          }
          bookmarksBranchesList = (_reactForAtom2 || _reactForAtom()).React.createElement(
            'ul',
            { className: 'list-group' },
            bookmarksBranchesListItems
          );
        } else {
          bookmarksBranchesList = (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-source-control-side-bar--header text-info' },
            'Only Mercurial repositories are supported. \'',
            repository.getType(),
            '\' found.'
          );
        }
      }

      var separator = undefined;
      if (this.props.hasSeparator) {
        separator = (_reactForAtom2 || _reactForAtom()).React.createElement('hr', { className: 'nuclide-source-control-side-bar--repo-separator' });
      }

      var uncommittedChangesClassName = (0, (_classnames2 || _classnames()).default)('list-item nuclide-source-control-side-bar--list-item', {
        selected: selectedItem != null && selectedItem.type === 'uncommitted'
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'li',
        null,
        separator,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h6',
          { className: 'text-highlight nuclide-source-control-side-bar--repo-header' },
          this.props.title
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ul',
          { className: 'list-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            {
              className: uncommittedChangesClassName,
              onClick: this._handleUncommittedChangesClick },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              null,
              'Uncommitted Changes'
            )
          )
        ),
        createButton,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h6',
          { className: 'nuclide-source-control-side-bar--header' },
          bookmarksBranchesHeader
        ),
        bookmarksBranchesList
      );
    }
  }]);

  return RepositorySectionComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = RepositorySectionComponent;
module.exports = exports.default;