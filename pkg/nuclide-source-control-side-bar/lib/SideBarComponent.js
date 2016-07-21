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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _CreateBookmarkModalComponent2;

function _CreateBookmarkModalComponent() {
  return _CreateBookmarkModalComponent2 = _interopRequireDefault(require('./CreateBookmarkModalComponent'));
}

var _DeleteBookmarkModalComponent2;

function _DeleteBookmarkModalComponent() {
  return _DeleteBookmarkModalComponent2 = _interopRequireDefault(require('./DeleteBookmarkModalComponent'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _RenameBookmarkModalComponent2;

function _RenameBookmarkModalComponent() {
  return _RenameBookmarkModalComponent2 = _interopRequireDefault(require('./RenameBookmarkModalComponent'));
}

var _RepositorySectionComponent2;

function _RepositorySectionComponent() {
  return _RepositorySectionComponent2 = _interopRequireDefault(require('./RepositorySectionComponent'));
}

var _remote2;

function _remote() {
  return _remote2 = _interopRequireDefault(require('remote'));
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var Menu = (_remote2 || _remote()).default.require('menu');

var SideBarComponent = (function (_React$Component) {
  _inherits(SideBarComponent, _React$Component);

  function SideBarComponent(props) {
    _classCallCheck(this, SideBarComponent);

    _get(Object.getPrototypeOf(SideBarComponent.prototype), 'constructor', this).call(this, props);
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this.state = {};

    this._confirmCreateBookmark = this._confirmCreateBookmark.bind(this);
    this._confirmDeleteBookmark = this._confirmDeleteBookmark.bind(this);
    this._confirmRenameBookmark = this._confirmRenameBookmark.bind(this);
    this._destroyActiveModal = this._destroyActiveModal.bind(this);
    this._handleBookmarkClick = this._handleBookmarkClick.bind(this);
    this._handleBookmarkContextMenu = this._handleBookmarkContextMenu.bind(this);
    this._handleRepoGearClick = this._handleRepoGearClick.bind(this);
    this._handleUncommittedChangesClick = this._handleUncommittedChangesClick.bind(this);
  }

  _createClass(SideBarComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', this._destroyActiveModal));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.state.activeModalComponent !== prevState.activeModalComponent) {
        if (prevState.activeModalComponent != null) {
          this._destroyActiveModal();
        }
        if (this.state.activeModalComponent != null) {
          this._renderActiveModal();
        }
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._destroyActiveModal();
      this._disposables.dispose();
      if (this._menuPopupTimeout != null) {
        clearTimeout(this._menuPopupTimeout);
      }
    }
  }, {
    key: '_confirmCreateBookmark',
    value: function _confirmCreateBookmark(name, repo) {
      this.props.createBookmark(name, repo);
      this.setState({ activeModalComponent: null });
    }
  }, {
    key: '_confirmDeleteBookmark',
    value: function _confirmDeleteBookmark(bookmark, repo) {
      this.props.deleteBookmark(bookmark, repo);
      this.setState({ activeModalComponent: null });
    }
  }, {
    key: '_confirmRenameBookmark',
    value: function _confirmRenameBookmark(bookmark, nextName, repo) {
      this.props.renameBookmark(bookmark, nextName, repo);
      this.setState({ activeModalComponent: null });
    }
  }, {
    key: '_destroyActiveModal',
    value: function _destroyActiveModal() {
      var panel = this._activeModalPanel;
      if (panel != null) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(panel.getItem());
        panel.destroy();
        this._activeModalPanel = null;
      }
    }
  }, {
    key: '_renderActiveModal',
    value: function _renderActiveModal() {
      if (this.state.activeModalComponent == null) {
        return;
      }

      var panel = this._activeModalPanel;
      if (panel == null) {
        var item = document.createElement('div');
        panel = this._activeModalPanel = atom.workspace.addModalPanel({ item: item });
      }

      (_reactForAtom2 || _reactForAtom()).ReactDOM.render(this.state.activeModalComponent, panel.getItem());
    }
  }, {
    key: '_handleBookmarkClick',
    value: function _handleBookmarkClick(bookmark, repository) {
      this.setState({
        selectedItem: {
          bookmark: bookmark,
          repository: repository,
          type: 'bookmark'
        }
      });
      atom.workspace.open((_url2 || _url()).default.format({
        hostname: 'view',
        protocol: 'fb-hg-smartlog',
        query: {
          repositoryPath: repository.getPath()
        },
        slashes: true
      }));
    }
  }, {
    key: '_handleBookmarkContextMenu',
    value: function _handleBookmarkContextMenu(bookmark, repository, event) {
      var _this = this;

      var menu = Menu.buildFromTemplate([{
        click: function click() {
          _this.props.updateToBookmark(bookmark, repository);
        },
        enabled: !bookmark.active,
        label: 'Update to ' + bookmark.bookmark
      }, { type: 'separator' }, {
        click: function click() {
          _this.setState({
            activeModalComponent: (_reactForAtom2 || _reactForAtom()).React.createElement((_DeleteBookmarkModalComponent2 || _DeleteBookmarkModalComponent()).default, {
              bookmark: bookmark,
              onCancel: function () {
                _this.setState({ activeModalComponent: null });
              },
              onDelete: _this._confirmDeleteBookmark,
              repository: repository
            })
          });
        },
        label: 'Delete ' + bookmark.bookmark + '...'
      }, {
        click: function click() {
          _this.setState({
            activeModalComponent: (_reactForAtom2 || _reactForAtom()).React.createElement((_RenameBookmarkModalComponent2 || _RenameBookmarkModalComponent()).default, {
              bookmark: bookmark,
              onCancel: function () {
                _this.setState({ activeModalComponent: null });
              },
              onRename: _this._confirmRenameBookmark,
              repository: repository
            })
          });
        },
        label: 'Rename ' + bookmark.bookmark + '...'
      }]);

      // Store event position because React cleans up SyntheticEvent objects.
      // @see https://fb.me/react-event-pooling
      var clientX = event.clientX;
      var clientY = event.clientY;

      this.setState({
        selectedItem: {
          bookmark: bookmark,
          repository: repository,
          type: 'bookmark'
        }
      }, function () {
        // Circumvent Electron / OS X render blocking bug.
        // @see https://github.com/electron/electron/issues/1854
        _this._menuPopupTimeout = setTimeout(function () {
          menu.popup((_remote2 || _remote()).default.getCurrentWindow(), clientX, clientY);
        }, 35);
      });
    }
  }, {
    key: '_handleRepoGearClick',
    value: function _handleRepoGearClick(repo, event) {
      var _this2 = this;

      this.setState({
        activeModalComponent: (_reactForAtom2 || _reactForAtom()).React.createElement((_CreateBookmarkModalComponent2 || _CreateBookmarkModalComponent()).default, {
          onCancel: function () {
            _this2.setState({ activeModalComponent: null });
          },
          onCreate: this._confirmCreateBookmark,
          repo: repo
        })
      });
    }
  }, {
    key: '_handleUncommittedChangesClick',
    value: function _handleUncommittedChangesClick(repository) {
      this.setState({
        selectedItem: {
          repository: repository,
          type: 'uncommitted'
        }
      });
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-diff-view:open');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: 'focusable-panel',
          style: { flex: 1, overflow: 'auto', position: 'relative', whiteSpace: 'normal' },
          tabIndex: '0' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ul',
          { className: 'list-unstyled' },
          this.props.projectDirectories.map(function (directory, index) {
            var repository = _this3.props.projectRepositories.get(directory.getPath());
            var repositoryBookmarksIsLoading = repository == null ? null : _this3.props.repositoryBookmarksIsLoading.get(repository);

            var bookmarks = undefined;
            var selectedItem = undefined;
            if (repository != null) {
              bookmarks = _this3.props.projectBookmarks.get(repository.getPath());
              if (_this3.state.selectedItem != null && _this3.state.selectedItem.repository === repository) {
                selectedItem = _this3.state.selectedItem;
              }
            }

            return (_reactForAtom2 || _reactForAtom()).React.createElement((_RepositorySectionComponent2 || _RepositorySectionComponent()).default, {
              bookmarks: bookmarks,
              bookmarksIsLoading: repositoryBookmarksIsLoading,
              hasSeparator: index > 0,
              key: directory.getPath(),
              onBookmarkClick: _this3._handleBookmarkClick,
              onBookmarkContextMenu: _this3._handleBookmarkContextMenu,
              onRepoGearClick: _this3._handleRepoGearClick,
              onUncommittedChangesClick: _this3._handleUncommittedChangesClick,
              repository: repository,
              selectedItem: selectedItem,
              title: directory.getBaseName()
            });
          })
        )
      );
    }
  }]);

  return SideBarComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SideBarComponent;
module.exports = exports.default;