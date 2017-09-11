'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('nuclide-commons-atom/observePaneItemVisibility'));
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Constants;

function _load_Constants() {
  return _Constants = require('../lib/Constants');
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../lib/FileTreeHelpers'));
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _FileTree;

function _load_FileTree() {
  return _FileTree = require('./FileTree');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _FileTreeSideBarFilterComponent;

function _load_FileTreeSideBarFilterComponent() {
  return _FileTreeSideBarFilterComponent = _interopRequireDefault(require('./FileTreeSideBarFilterComponent'));
}

var _FileTreeToolbarComponent;

function _load_FileTreeToolbarComponent() {
  return _FileTreeToolbarComponent = require('./FileTreeToolbarComponent');
}

var _OpenFilesListComponent;

function _load_OpenFilesListComponent() {
  return _OpenFilesListComponent = require('./OpenFilesListComponent');
}

var _LockableHeightComponent;

function _load_LockableHeightComponent() {
  return _LockableHeightComponent = require('./LockableHeightComponent');
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('nuclide-commons-ui/PanelComponentScroller');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _electron = require('electron');

var _contextMenu;

function _load_contextMenu() {
  return _contextMenu = require('../../commons-atom/context-menu');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class FileTreeSidebarComponent extends _react.Component {

  constructor() {
    super();

    this._handleFocus = event => {
      if (event.target === _reactDom.default.findDOMNode(this)) {
        this.focus();
      }
    };

    this._handleFileTreeHovered = () => {
      this.setState({ isFileTreeHovered: true });
    };

    this._handleFileTreeUnhovered = () => {
      this.setState({ isFileTreeHovered: false });
    };

    this._processExternalUpdate = () => {
      const shouldRenderToolbar = !this._store.roots.isEmpty();
      const openFilesUris = this._store.getOpenFilesWorkingSet().getUris();

      if (shouldRenderToolbar !== this.state.shouldRenderToolbar || openFilesUris !== this.state.openFilesUris) {
        this.setState({ shouldRenderToolbar, openFilesUris });
      } else {
        // Note: It's safe to call forceUpdate here because the change events are de-bounced.
        this.forceUpdate();
      }

      const uncommittedFileChanges = this._store.getFileChanges();
      const isCalculatingChanges = this._store.getIsCalculatingChanges();

      this.setState({
        uncommittedFileChanges,
        isCalculatingChanges
      });

      const title = this.getTitle();
      const path = this.getPath();
      if (title !== this.state.title || path !== this.state.path) {
        this.setState({
          title,
          path
        });
        this._emitter.emit('did-change-title', this.getTitle());
        this._emitter.emit('did-change-path', this.getPath());
      }
    };

    this._handleFoldersExpandedChange = isCollapsed => {
      if (isCollapsed) {
        this.setState({ isFileTreeHovered: false });
      }
      this._actions.setFoldersExpanded(!isCollapsed);
    };

    this._handleOpenFilesExpandedChange = isCollapsed => {
      this._actions.setOpenFilesExpanded(!isCollapsed);
    };

    this._handleUncommittedFilesExpandedChange = isCollapsed => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-toggle');
      this._actions.setUncommittedChangesExpanded(!isCollapsed);
    };

    this._handleUncommittedChangesKindDownArrow = event => {
      if (!(_electron.remote != null)) {
        throw new Error('Invariant violation: "remote != null"');
      }

      const menu = new _electron.remote.Menu();
      for (const enumKey in (_Constants || _load_Constants()).ShowUncommittedChangesKind) {
        const kind = (_Constants || _load_Constants()).ShowUncommittedChangesKind[enumKey];
        const menuItem = new _electron.remote.MenuItem({
          type: 'checkbox',
          checked: this.state.showUncommittedChangesKind === kind,
          label: kind,
          click: () => {
            this._handleShowUncommittedChangesKindChange(kind);
          }
        });
        menu.append(menuItem);
      }
      const currentWindow = _electron.remote.getCurrentWindow();
      menu.popup(currentWindow, event.clientX, event.clientY);
      event.stopPropagation();
    };

    this._getScrollerHeight = () => {
      const component = this.refs.scroller;
      if (component == null) {
        return null;
      }
      const el = _reactDom.default.findDOMNode(component);
      if (el == null) {
        return null;
      }
      // $FlowFixMe
      return el.clientHeight;
    };

    this._handleScroll = () => {
      if (!this._scrollWasTriggeredProgrammatically) {
        this._actions.clearTrackedNode();
      }
      this._scrollWasTriggeredProgrammatically = false;
      const node = _reactDom.default.findDOMNode(this.refs.scroller);
      // $FlowFixMe
      const { scrollTop } = node;
      if (scrollTop !== this.state.scrollerScrollTop) {
        this.setState({ scrollerScrollTop: scrollTop });
      }
    };

    this._scrollToPosition = (top, height, approximate) => {
      const node = _reactDom.default.findDOMNode(this.refs.scroller);
      if (node == null) {
        return;
      }

      if (!approximate) {
        this._actions.clearTrackedNodeIfNotLoading();
      }
      const requestedBottom = top + height;
      const currentBottom = this.state.scrollerScrollTop + this.state.scrollerHeight;
      if (top > this.state.scrollerScrollTop && requestedBottom <= currentBottom) {
        return; // Already in the view
      }

      const newTop = Math.max(top + height / 2 - this.state.scrollerHeight / 2, 0);
      setImmediate(() => {
        try {
          // For the rather unlikely chance that the node is already gone from the DOM
          this._scrollWasTriggeredProgrammatically = true;
          // $FlowFixMe
          node.scrollTop = newTop;
          if (this.state.scrollerScrollTop !== newTop) {
            this.setState({ scrollerScrollTop: newTop });
          }
        } catch (e) {}
      });
    };

    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._emitter = new _atom.Emitter();
    this.state = {
      hidden: false,
      shouldRenderToolbar: false,
      scrollerHeight: window.innerHeight,
      scrollerScrollTop: 0,
      showOpenFiles: true,
      showUncommittedChanges: true,
      showUncommittedChangesKind: 'Uncommitted changes',
      openFilesUris: [],
      modifiedUris: [],
      activeUri: null,
      uncommittedFileChanges: new Map(),
      isCalculatingChanges: false,
      areStackChangesEnabled: false,
      path: 'No Current Working Directory',
      title: 'File Tree',
      isFileTreeHovered: false
    };
    this._showOpenConfigValues = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).SHOW_OPEN_FILE_CONFIG_KEY));
    this._showUncommittedConfigValue = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY));
    this._showUncommittedKindConfigValue = (_FileTreeHelpers || _load_FileTreeHelpers()).default.observeUncommittedChangesKindConfigKey();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._emitter);
    this._scrollWasTriggeredProgrammatically = false;
  }

  componentDidMount() {
    this._processExternalUpdate();

    const remeasureEvents = _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(null), _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'resize'), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.commands.onDidDispatch.bind(atom.commands)).filter(event => event.type === 'nuclide-file-tree:toggle'), _rxjsBundlesRxMinJs.Observable.interval(2000));

    this._disposables.add(this._store.subscribe(this._processExternalUpdate), atom.project.onDidChangePaths(this._processExternalUpdate), (0, (_observable || _load_observable()).toggle)(observeAllModifiedStatusChanges(), this._showOpenConfigValues).subscribe(() => this._setModifiedUris()), this._monitorActiveUri(), _rxjsBundlesRxMinJs.Observable.fromPromise((_FileTreeHelpers || _load_FileTreeHelpers()).default.areStackChangesEnabled()).subscribe(areStackChangesEnabled => this.setState({ areStackChangesEnabled })), this._showOpenConfigValues.subscribe(showOpenFiles => this.setState({ showOpenFiles })), this._showUncommittedConfigValue.subscribe(showUncommittedChanges => this.setState({ showUncommittedChanges })), this._showUncommittedKindConfigValue.subscribe(showUncommittedChangesKind => this.setState({ showUncommittedChangesKind })), (0, (_observable || _load_observable()).compact)((0, (_observable || _load_observable()).throttle)(remeasureEvents, () => (_observable || _load_observable()).nextAnimationFrame).map(() => this._getScrollerHeight())).distinctUntilChanged().subscribe(scrollerHeight => {
      this.setState({ scrollerHeight });
    }),
    // Customize the context menu to remove items that match the 'atom-pane' selector.
    _rxjsBundlesRxMinJs.Observable.fromEvent(_reactDom.default.findDOMNode(this), 'contextmenu').switchMap(event => {
      if (event.button !== 2) {
        return _rxjsBundlesRxMinJs.Observable.never();
      }

      event.preventDefault();
      event.stopPropagation();

      // Find all the item sets that match the 'atom-pane' selector. We're going to remove these
      // by changing their selector.
      const paneItemSets = atom.contextMenu.itemSets.filter(itemSet => itemSet.selector === 'atom-pane');
      // Override the selector while we get the template.
      paneItemSets.forEach(itemSet => {
        itemSet.selector = 'do-not-match-anything';
      });
      const menuTemplate = atom.contextMenu.templateForEvent(event);
      paneItemSets.forEach(itemSet => {
        itemSet.selector = 'atom-pane';
      });
      // Wrap the disposable in an observable. This way we don't have to manually track these
      // disposables, they'll be managed for us.
      return _rxjsBundlesRxMinJs.Observable.create(() => (0, (_contextMenu || _load_contextMenu()).showMenuForEvent)(event, menuTemplate));
    }).subscribe(), (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.hidden && !this.state.hidden) {
      // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
      // user expects when the side bar shows the file tree.
      if ((_featureConfig || _load_featureConfig()).default.get((_Constants || _load_Constants()).REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:reveal-active-file');
      }
      this._actions.clearFilter();
      const scrollerHeight = this._getScrollerHeight();
      if (scrollerHeight != null) {
        this.setState({ scrollerHeight });
      }
    }

    const node = _reactDom.default.findDOMNode(this.refs.scroller);
    if (node) {
      // $FlowFixMe
      node.scrollTop = this.state.scrollerScrollTop;
    }
  }

  render() {
    const workingSetsStore = this._store.getWorkingSetsStore();
    let toolbar;
    if (this.state.shouldRenderToolbar && workingSetsStore != null) {
      toolbar = _react.createElement(
        'div',
        { className: 'nuclide-file-tree-fixed' },
        _react.createElement((_FileTreeSideBarFilterComponent || _load_FileTreeSideBarFilterComponent()).default, {
          key: 'filter',
          filter: this._store.getFilter(),
          found: this._store.getFilterFound()
        }),
        this._store.foldersExpanded && _react.createElement((_FileTreeToolbarComponent || _load_FileTreeToolbarComponent()).FileTreeToolbarComponent, {
          key: 'toolbar',
          workingSetsStore: workingSetsStore
        })
      );
    }

    let uncommittedChangesSection;
    let uncommittedChangesHeadline;
    if (this.state.showUncommittedChanges) {
      const uncommittedChangesList = _react.createElement(
        'div',
        { className: 'nuclide-file-tree-sidebar-uncommitted-changes' },
        _react.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
          analyticsSurface: 'file-tree-uncommitted-changes',
          commandPrefix: 'file-tree-sidebar',
          enableInlineActions: true,
          fileStatuses: (0, (_nuclideVcsBase || _load_nuclideVcsBase()).filterMultiRootFileChanges)(this.state.uncommittedFileChanges),
          selectedFile: this.state.activeUri,
          hideEmptyFolders: true,
          onFileChosen: this._onFileChosen,
          openInDiffViewOption: true
        })
      );

      if (!this.state.areStackChangesEnabled) {
        uncommittedChangesHeadline = 'UNCOMMITTED CHANGES';
      } else {
        const showDropdown = Array.from(this.state.uncommittedFileChanges.keys()).some(path => {
          const repo = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(path);
          return repo != null && repo.getType() === 'hg';
        });

        const dropdownIcon = !showDropdown ? null : _react.createElement((_Icon || _load_Icon()).Icon, {
          icon: 'triangle-down',
          className: 'nuclide-file-tree-toolbar-fader nuclide-ui-dropdown-icon',
          onClick: this._handleUncommittedChangesKindDownArrow
        });

        const dropdownTooltip = `<div style="text-align: left;">
This section shows the file changes you've made:<br />
<br />
<b>UNCOMMITTED</b><br />
Just the changes that you have yet to amend/commit.<br />
<br />
<b>HEAD</b><br />
Just the changes that you've already amended/committed.<br />
<br />
<b>STACK</b><br />
All the changes across your entire stacked diff.
</div>`;

        const calculatingChangesSpinner = !this.state.isCalculatingChanges ? null : _react.createElement(
          'span',
          { className: 'nuclide-file-tree-spinner' },
          '\xA0',
          _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
            className: 'inline-block',
            size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
          })
        );

        uncommittedChangesHeadline =
        // $FlowFixMe(>=0.53.0) Flow suppress
        _react.createElement(
          'span',
          { ref: (0, (_addTooltip || _load_addTooltip()).default)({ title: dropdownTooltip }) },
          _react.createElement(
            'span',
            { className: 'nuclide-dropdown-label-text-wrapper' },
            this.state.showUncommittedChangesKind.toUpperCase()
          ),
          dropdownIcon,
          calculatingChangesSpinner
        );
      }

      uncommittedChangesSection = _react.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-file-tree-section-caption',
          collapsable: true,
          collapsed: !this._store.uncommittedChangesExpanded,
          headline: uncommittedChangesHeadline,
          onChange: this._handleUncommittedFilesExpandedChange,
          size: 'small' },
        _react.createElement(
          (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
          null,
          uncommittedChangesList
        )
      );
    }

    let openFilesSection = null;
    let openFilesList = null;
    if (this.state.showOpenFiles && this.state.openFilesUris.length > 0) {
      if (this._store.openFilesExpanded) {
        openFilesList = _react.createElement((_OpenFilesListComponent || _load_OpenFilesListComponent()).OpenFilesListComponent, {
          uris: this.state.openFilesUris,
          modifiedUris: this.state.modifiedUris,
          activeUri: this.state.activeUri
        });
      }
      openFilesSection = _react.createElement(
        (_LockableHeightComponent || _load_LockableHeightComponent()).LockableHeight,
        { isLocked: this.state.isFileTreeHovered },
        _react.createElement(
          (_Section || _load_Section()).Section,
          {
            className: 'nuclide-file-tree-section-caption nuclide-file-tree-open-files-section',
            collapsable: true,
            collapsed: !this._store.openFilesExpanded,
            headline: 'OPEN FILES',
            onChange: this._handleOpenFilesExpandedChange,
            size: 'small' },
          openFilesList
        )
      );
    }

    let foldersCaption;
    if (uncommittedChangesSection != null || openFilesSection != null) {
      foldersCaption = _react.createElement((_Section || _load_Section()).Section, {
        className: 'nuclide-file-tree-section-caption',
        headline: 'FOLDERS',
        collapsable: true,
        collapsed: !this._store.foldersExpanded,
        onChange: this._handleFoldersExpandedChange,
        size: 'small'
      });
    }

    // Include `tabIndex` so this component can be focused by calling its native `focus` method.
    return _react.createElement(
      'div',
      {
        className: 'nuclide-file-tree-toolbar-container',
        onFocus: this._handleFocus,
        tabIndex: 0 },
      uncommittedChangesSection,
      openFilesSection,
      foldersCaption,
      toolbar,
      this._store.foldersExpanded && _react.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        { ref: 'scroller', onScroll: this._handleScroll },
        _react.createElement((_FileTree || _load_FileTree()).FileTree, {
          ref: 'fileTree',
          containerHeight: this.state.scrollerHeight,
          containerScrollTop: this.state.scrollerScrollTop,
          scrollToPosition: this._scrollToPosition,
          onMouseEnter: this._handleFileTreeHovered,
          onMouseLeave: this._handleFileTreeUnhovered
        })
      )
    );
  }

  _onFileChosen(filePath) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-file-open');
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePath);
  }

  _handleShowUncommittedChangesKindChange(showUncommittedChangesKind) {
    switch (showUncommittedChangesKind) {
      case (_Constants || _load_Constants()).ShowUncommittedChangesKind.UNCOMMITTED:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-changes-kind-uncommitted');
        break;
      case (_Constants || _load_Constants()).ShowUncommittedChangesKind.HEAD:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-changes-kind-head');
        break;
      case (_Constants || _load_Constants()).ShowUncommittedChangesKind.STACK:
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-changes-kind-stack');
        break;
    }
    (_featureConfig || _load_featureConfig()).default.set((_Constants || _load_Constants()).SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY, showUncommittedChangesKind);
  }

  _setModifiedUris() {
    const modifiedUris = getCurrentBuffers().filter(buffer => buffer.isModified()).map(buffer => buffer.getPath() || '').filter(path => path !== '');

    this.setState({ modifiedUris });
  }

  _monitorActiveUri() {
    const activeEditors = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidStopChangingActivePaneItem.bind(atom.workspace));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_observable || _load_observable()).toggle)(activeEditors, this._showOpenConfigValues).subscribe(editor => {
      if (editor == null || typeof editor.getPath !== 'function' || editor.getPath() == null) {
        this.setState({ activeUri: null });
        return;
      }

      this.setState({ activeUri: editor.getPath() });
    }));
  }

  isFocused() {
    const el = _reactDom.default.findDOMNode(this.refs.fileTree);
    if (el == null) {
      return false;
    }
    return el.contains(document.activeElement);
  }

  focus() {
    const el = _reactDom.default.findDOMNode(this.refs.fileTree);
    if (el == null) {
      return;
    }
    // $FlowFixMe
    el.focus();
  }

  getTitle() {
    const cwdKey = this._store.getCwdKey();
    if (cwdKey == null) {
      return 'File Tree';
    }

    return (_nuclideUri || _load_nuclideUri()).default.basename(cwdKey);
  }

  // This is unfortunate, but Atom uses getTitle() to get the text in the tab and getPath() to get
  // the text in the tool-tip.
  getPath() {
    const cwdKey = this._store.getCwdKey();
    if (cwdKey == null) {
      return 'No Current Working Directory';
    }

    const trimmed = (_nuclideUri || _load_nuclideUri()).default.trimTrailingSeparator(cwdKey);
    const directory = (_nuclideUri || _load_nuclideUri()).default.getPath(trimmed);
    const host = (_nuclideUri || _load_nuclideUri()).default.getHostnameOpt(trimmed);
    if (host == null) {
      return `Current Working Directory: ${directory}`;
    }

    return `Current Working Directory: '${directory}' on '${host}'`;
  }

  getDefaultLocation() {
    return 'left';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getPreferredWidth() {
    return 300;
  }

  getIconName() {
    return 'file-directory';
  }

  getURI() {
    return (_Constants || _load_Constants()).WORKSPACE_VIEW_URI;
  }

  didChangeVisibility(visible) {
    this.setState({ hidden: !visible });
  }

  serialize() {
    return {
      deserializer: 'nuclide.FileTreeSidebarComponent'
    };
  }

  copy() {
    // The file tree store wasn't written to support multiple instances, so try to prevent it.
    return false;
  }

  isPermanentDockItem() {
    return true;
  }

  onDidChangeTitle(callback) {
    return this._emitter.on('did-change-title', callback);
  }

  onDidChangePath(callback) {
    return this._emitter.on('did-change-path', callback);
  }
}

exports.default = FileTreeSidebarComponent; /**
                                             * Copyright (c) 2015-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the license found in the LICENSE file in
                                             * the root directory of this source tree.
                                             *
                                             * 
                                             * @format
                                             */

function observeAllModifiedStatusChanges() {
  const paneItemChangeEvents = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).startWith(undefined);

  return paneItemChangeEvents.map(getCurrentBuffers).switchMap(buffers => _rxjsBundlesRxMinJs.Observable.merge(...buffers.map(buffer => {
    return (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer));
  })));
}

function getCurrentBuffers() {
  const buffers = [];
  const editors = atom.workspace.getTextEditors();
  editors.forEach(te => {
    const buffer = te.getBuffer();

    if (typeof buffer.getPath !== 'function' || buffer.getPath() == null) {
      return;
    }

    if (buffers.indexOf(buffer) < 0) {
      buffers.push(buffer);
    }
  });

  return buffers;
}