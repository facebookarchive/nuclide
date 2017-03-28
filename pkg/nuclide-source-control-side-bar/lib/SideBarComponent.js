'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _electron = _interopRequireDefault(require('electron'));

var _CreateBookmarkModalComponent;

function _load_CreateBookmarkModalComponent() {
  return _CreateBookmarkModalComponent = _interopRequireDefault(require('./CreateBookmarkModalComponent'));
}

var _DeleteBookmarkModalComponent;

function _load_DeleteBookmarkModalComponent() {
  return _DeleteBookmarkModalComponent = _interopRequireDefault(require('./DeleteBookmarkModalComponent'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _RenameBookmarkModalComponent;

function _load_RenameBookmarkModalComponent() {
  return _RenameBookmarkModalComponent = _interopRequireDefault(require('./RenameBookmarkModalComponent'));
}

var _RepositorySectionComponent;

function _load_RepositorySectionComponent() {
  return _RepositorySectionComponent = _interopRequireDefault(require('./RepositorySectionComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { remote } = _electron.default; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       */

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

class SideBarComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new _atom.CompositeDisposable();
    this.state = {};

    this._confirmCreateBookmark = this._confirmCreateBookmark.bind(this);
    this._confirmDeleteBookmark = this._confirmDeleteBookmark.bind(this);
    this._confirmRenameBookmark = this._confirmRenameBookmark.bind(this);
    this._destroyActiveModal = this._destroyActiveModal.bind(this);
    this._handleBookmarkClick = this._handleBookmarkClick.bind(this);
    this._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    this._handleRepoGearClick = this._handleRepoGearClick.bind(this);
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', this._destroyActiveModal));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.activeModalComponent !== prevState.activeModalComponent) {
      if (prevState.activeModalComponent != null) {
        this._destroyActiveModal();
      }
      if (this.state.activeModalComponent != null) {
        this._renderActiveModal();
      }
    }
  }

  componentWillUnmount() {
    this._destroyActiveModal();
    this._disposables.dispose();
    if (this._menuPopupTimeout != null) {
      clearTimeout(this._menuPopupTimeout);
    }
  }

  _confirmCreateBookmark(name, repo) {
    this.props.createBookmark(name, repo);
    this.setState({ activeModalComponent: null });
  }

  _confirmDeleteBookmark(bookmark, repo) {
    this.props.deleteBookmark(bookmark, repo);
    this.setState({ activeModalComponent: null });
  }

  _confirmRenameBookmark(bookmark, nextName, repo) {
    this.props.renameBookmark(bookmark, nextName, repo);
    this.setState({ activeModalComponent: null });
  }

  _destroyActiveModal() {
    const panel = this._activeModalPanel;
    if (panel != null) {
      _reactDom.default.unmountComponentAtNode(panel.getItem());
      panel.destroy();
      this._activeModalPanel = null;
    }
  }

  _renderActiveModal() {
    if (this.state.activeModalComponent == null) {
      return;
    }

    let panel = this._activeModalPanel;
    if (panel == null) {
      const item = document.createElement('div');
      panel = this._activeModalPanel = atom.workspace.addModalPanel({ item });
    }

    _reactDom.default.render(this.state.activeModalComponent, panel.getItem());
  }

  _handleBookmarkClick(bookmark, repository) {
    this.setState({
      selectedItem: {
        bookmark,
        repository,
        type: 'bookmark'
      }
    });
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'fb-interactive-smartlog:toggle', { visible: true });
  }

  _handleBookmarkContextMenu(bookmark, repository, event) {
    // Prevent the normal context menu.
    event.stopPropagation();

    const menu = remote.Menu.buildFromTemplate([{
      click: () => {
        this.props.updateToBookmark(bookmark, repository);
      },
      enabled: !bookmark.active,
      label: `Update to ${bookmark.bookmark}`
    }, { type: 'separator' }, {
      click: () => {
        this.setState({
          activeModalComponent: _react.default.createElement((_DeleteBookmarkModalComponent || _load_DeleteBookmarkModalComponent()).default, {
            bookmark: bookmark,
            onCancel: () => {
              this.setState({ activeModalComponent: null });
            },
            onDelete: this._confirmDeleteBookmark,
            repository: repository
          })
        });
      },
      label: `Delete ${bookmark.bookmark}...`
    }, {
      click: () => {
        this.setState({
          activeModalComponent: _react.default.createElement((_RenameBookmarkModalComponent || _load_RenameBookmarkModalComponent()).default, {
            bookmark: bookmark,
            onCancel: () => {
              this.setState({ activeModalComponent: null });
            },
            onRename: this._confirmRenameBookmark,
            repository: repository
          })
        });
      },
      label: `Rename ${bookmark.bookmark}...`
    }]);

    // Store event position because React cleans up SyntheticEvent objects.
    // @see https://fb.me/react-event-pooling
    const clientX = event.clientX;
    const clientY = event.clientY;

    this.setState({
      selectedItem: {
        bookmark,
        repository,
        type: 'bookmark'
      }
    }, () => {
      // Circumvent Electron / OS X render blocking bug.
      // @see https://github.com/electron/electron/issues/1854
      this._menuPopupTimeout = setTimeout(() => {
        menu.popup(remote.getCurrentWindow(), clientX, clientY);
      }, 35);
    });
  }

  _handleRepoGearClick(repo, event) {
    this.setState({
      activeModalComponent: _react.default.createElement((_CreateBookmarkModalComponent || _load_CreateBookmarkModalComponent()).default, {
        onCancel: () => {
          this.setState({ activeModalComponent: null });
        },
        onCreate: this._confirmCreateBookmark,
        repo: repo
      })
    });
  }

  render() {
    return _react.default.createElement(
      'div',
      {
        className: 'focusable-panel',
        style: { flex: 1, overflow: 'auto', position: 'relative', whiteSpace: 'normal' },
        tabIndex: '0' },
      _react.default.createElement(
        'ul',
        { className: 'list-unstyled' },
        this.props.projectDirectories.map((directory, index) => {
          const repository = this.props.projectRepositories.get(directory.getPath());
          const { uncommittedChanges } = this.props;
          const repositoryBookmarksIsLoading = repository == null ? null : this.props.repositoryBookmarksIsLoading.get(repository);

          const uncommittedChangesForDirectory = new Map();
          let bookmarks;
          let selectedItem;
          if (repository != null) {
            bookmarks = this.props.projectBookmarks.get(repository.getPath());
            if (this.state.selectedItem != null && this.state.selectedItem.repository === repository) {
              selectedItem = this.state.selectedItem;
            }

            uncommittedChangesForDirectory.set(repository.getPath(), uncommittedChanges.get(directory.getPath()) || new Map());
          }

          return _react.default.createElement((_RepositorySectionComponent || _load_RepositorySectionComponent()).default, {
            bookmarks: bookmarks,
            bookmarksIsLoading: repositoryBookmarksIsLoading,
            hasSeparator: index > 0,
            key: directory.getPath(),
            onBookmarkClick: this._handleBookmarkClick,
            onBookmarkContextMenu: this._handleBookmarkContextMenu,
            onRepoGearClick: this._handleRepoGearClick,
            repository: repository,
            selectedItem: selectedItem,
            title: directory.getBaseName(),
            uncommittedChanges: uncommittedChangesForDirectory
          });
        })
      )
    );
  }
}
exports.default = SideBarComponent;