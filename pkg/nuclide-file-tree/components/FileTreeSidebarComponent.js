'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/observePaneItemVisibility'));
}

var _DragResizeContainer;

function _load_DragResizeContainer() {
  return _DragResizeContainer = require('../../../modules/nuclide-commons-ui/DragResizeContainer');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../../modules/nuclide-commons-ui/addTooltip'));
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
  return _LoadingSpinner = require('../../../modules/nuclide-commons-ui/LoadingSpinner');
}

var _VirtualizedFileTree;

function _load_VirtualizedFileTree() {
  return _VirtualizedFileTree = require('./VirtualizedFileTree');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../modules/nuclide-commons-ui/Icon');
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
  return _PanelComponentScroller = require('../../../modules/nuclide-commons-ui/PanelComponentScroller');
}

var _observableDom;

function _load_observableDom() {
  return _observableDom = require('../../../modules/nuclide-commons-ui/observable-dom');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _Section;

function _load_Section() {
  return _Section = require('../../../modules/nuclide-commons-ui/Section');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _electron = require('electron');

var _ContextMenu;

function _load_ContextMenu() {
  return _ContextMenu = require('../../../modules/nuclide-commons-atom/ContextMenu');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _reselect;

function _load_reselect() {
  return _reselect = require('reselect');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class FileTreeSidebarComponent extends _react.Component {
  // $FlowFixMe flow does not recognize VirtualizedFileTree as React component
  constructor() {
    super();

    this._setScrollerRef = node => {
      this._scrollerRef = node;
      if (node == null) {
        this._scrollerElements.next(null);
        return;
      }

      const scroller = _reactDom.default.findDOMNode(node);
      if (scroller == null) {
        this._scrollerElements.next(null);
        return;
      }

      if (!(scroller instanceof HTMLElement)) {
        throw new Error('Invariant violation: "scroller instanceof HTMLElement"');
      }

      this._scrollerElements.next(scroller);
    };

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
      const openFilesUris = this._store.getOpenFilesWorkingSet().getAbsoluteUris();
      const uncommittedFileChanges = this._store.getFileChanges();
      const generatedOpenChangedFiles = this._store.getGeneratedOpenChangedFiles();
      const isCalculatingChanges = this._store.getIsCalculatingChanges();
      const title = this.getTitle();
      const path = this.getPath();
      const workingSetsStore = this._store.getWorkingSetsStore();
      const filter = this._store.getFilter();
      const filterFound = this._store.getFilterFound();
      const foldersExpanded = this._store.foldersExpanded;
      const uncommittedChangesExpanded = this._store.uncommittedChangesExpanded;
      const openFilesExpanded = this._store.openFilesExpanded;

      this.setState({
        shouldRenderToolbar,
        openFilesUris,
        uncommittedFileChanges,
        generatedOpenChangedFiles,
        isCalculatingChanges,
        title,
        path,
        workingSetsStore,
        filter,
        filterFound,
        foldersExpanded,
        uncommittedChangesExpanded,
        openFilesExpanded
      });

      if (title !== this.state.title || path !== this.state.path) {
        this._emitter.emit('did-change-title', title);
        this._emitter.emit('did-change-path', path);
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
      menu.popup({ x: event.clientX, y: event.clientY, async: true });
      this._menu = menu;
      event.stopPropagation();
    };

    this._handleScroll = scrollTop => {
      // Do not store in state to not cause extra rendering loops on update
      this._scrollerScrollTop = scrollTop;
    };

    this._getFilteredUncommittedFileChanges = (0, (_reselect || _load_reselect()).createSelector)([state => state.uncommittedFileChanges], filterMultiRootFileChanges);
    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._emitter = new _atom.Emitter();
    this.state = {
      hidden: false,
      shouldRenderToolbar: false,
      scrollerHeight: window.innerHeight,
      scrollerWidth: this.getPreferredWidth(),
      showOpenFiles: true,
      showUncommittedChanges: true,
      showUncommittedChangesKind: 'Uncommitted changes',
      openFilesUris: [],
      modifiedUris: [],
      activeUri: null,
      uncommittedFileChanges: (_immutable || _load_immutable()).default.Map(),
      generatedOpenChangedFiles: (_immutable || _load_immutable()).default.Map(),
      isCalculatingChanges: false,
      path: 'No Current Working Directory',
      title: 'File Tree',
      isFileTreeHovered: false,
      workingSetsStore: this._store.getWorkingSetsStore(),
      filter: this._store.getFilter(),
      filterFound: this._store.getFilterFound(),
      foldersExpanded: this._store.foldersExpanded,
      uncommittedChangesExpanded: this._store.uncommittedChangesExpanded,
      openFilesExpanded: this._store.openFilesExpanded
    };
    this._showOpenConfigValues = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).SHOW_OPEN_FILE_CONFIG_KEY));
    this._showUncommittedConfigValue = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY));
    this._showUncommittedKindConfigValue = (_FileTreeHelpers || _load_FileTreeHelpers()).default.observeUncommittedChangesKindConfigKey();

    this._scrollerElements = new _rxjsBundlesRxMinJs.Subject();
    this._scrollerScrollTop = 0;
    this._scrollerRef = null;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._emitter, this._subscribeToResizeEvents());
  }

  componentDidMount() {
    const componentDOMNode = _reactDom.default.findDOMNode(this);

    if (!(componentDOMNode instanceof HTMLElement)) {
      throw new Error('Invariant violation: "componentDOMNode instanceof HTMLElement"');
    }

    this._processExternalUpdate();

    this._disposables.add(this._store.subscribe(this._processExternalUpdate), observeAllModifiedStatusChanges().let((0, (_observable || _load_observable()).toggle)(this._showOpenConfigValues)).subscribe(() => this._setModifiedUris()), this._monitorActiveUri(), this._showOpenConfigValues.subscribe(showOpenFiles => this.setState({ showOpenFiles })), this._showUncommittedConfigValue.subscribe(showUncommittedChanges => this.setState({ showUncommittedChanges })), this._showUncommittedKindConfigValue.subscribe(showUncommittedChangesKind => this.setState({ showUncommittedChangesKind })),
    // Customize the context menu to remove items that match the 'atom-pane' selector.
    _rxjsBundlesRxMinJs.Observable.fromEvent(componentDOMNode, 'contextmenu').switchMap(event => {
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
      return _rxjsBundlesRxMinJs.Observable.create(() => (0, (_ContextMenu || _load_ContextMenu()).showMenuForEvent)(event, menuTemplate));
    }).subscribe(), (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
    if (this._menu != null) {
      this._menu.closePopup();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.hidden && !this.state.hidden) {
      // If "Reveal File on Switch" is enabled, ensure the scroll position is synced to where the
      // user expects when the side bar shows the file tree.
      if ((_featureConfig || _load_featureConfig()).default.get((_Constants || _load_Constants()).REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:reveal-active-file');
      }
      this._actions.clearFilter();
    }
  }

  _subscribeToResizeEvents() {
    const scrollerRects = this._scrollerElements.switchMap(scroller => {
      if (scroller == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      return new (_observableDom || _load_observableDom()).ResizeObservable(scroller).map(arr => {
        if (arr.length === 0) {
          return null;
        }

        return arr[arr.length - 1].contentRect;
      });
    });

    return scrollerRects.let((_observable || _load_observable()).compact).subscribe(rect => this.setState({ scrollerHeight: rect.height, scrollerWidth: rect.width }));
  }

  _renderToolbar(workingSetsStore) {
    return _react.createElement(
      'div',
      { className: 'nuclide-file-tree-fixed' },
      _react.createElement((_FileTreeSideBarFilterComponent || _load_FileTreeSideBarFilterComponent()).default, {
        key: 'filter',
        filter: this.state.filter,
        found: this.state.filterFound
      }),
      this.state.foldersExpanded && _react.createElement((_FileTreeToolbarComponent || _load_FileTreeToolbarComponent()).FileTreeToolbarComponent, {
        key: 'toolbar',
        workingSetsStore: workingSetsStore
      })
    );
  }

  _renderUncommittedChangesSection() {
    const uncommittedChangesList = _react.createElement(
      'div',
      { className: 'nuclide-file-tree-sidebar-uncommitted-changes' },
      _react.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
        analyticsSurface: 'file-tree-uncommitted-changes',
        commandPrefix: 'file-tree-sidebar',
        enableInlineActions: true,
        fileStatuses: this._getFilteredUncommittedFileChanges(this.state),
        generatedTypes: this.state.generatedOpenChangedFiles,
        selectedFile: this.state.activeUri,
        hideEmptyFolders: true,
        onFileChosen: this._onFileChosen,
        openInDiffViewOption: true
      })
    );

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

    const uncommittedChangesHeadline =
    // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
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

    return _react.createElement(
      'div',
      {
        className: 'nuclide-file-tree-uncommitted-changes-container',
        'data-show-uncommitted-changes-kind': this.state.showUncommittedChangesKind },
      _react.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-file-tree-section-caption',
          collapsable: true,
          collapsed: !this.state.uncommittedChangesExpanded,
          headline: uncommittedChangesHeadline,
          onChange: this._handleUncommittedFilesExpandedChange,
          size: 'small' },
        _react.createElement(
          (_DragResizeContainer || _load_DragResizeContainer()).DragResizeContainer,
          null,
          _react.createElement(
            (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
            { className: 'nuclide-file-tree-sidebar-uncommitted-changes-container' },
            uncommittedChangesList
          )
        )
      )
    );
  }

  _renderOpenFilesSection() {
    const openFilesList = this.state.openFilesExpanded ? _react.createElement((_OpenFilesListComponent || _load_OpenFilesListComponent()).OpenFilesListComponent, {
      uris: this.state.openFilesUris,
      modifiedUris: this.state.modifiedUris,
      generatedTypes: this.state.generatedOpenChangedFiles,
      activeUri: this.state.activeUri
    }) : null;
    return _react.createElement(
      (_LockableHeightComponent || _load_LockableHeightComponent()).LockableHeight,
      { isLocked: this.state.isFileTreeHovered },
      _react.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-file-tree-section-caption nuclide-file-tree-open-files-section',
          collapsable: true,
          collapsed: !this.state.openFilesExpanded,
          headline: 'OPEN FILES',
          onChange: this._handleOpenFilesExpandedChange,
          size: 'small' },
        openFilesList
      )
    );
  }

  _renderFoldersCaption() {
    return _react.createElement((_Section || _load_Section()).Section, {
      className: 'nuclide-file-tree-section-caption',
      headline: 'FOLDERS',
      collapsable: true,
      collapsed: !this.state.foldersExpanded,
      onChange: this._handleFoldersExpandedChange,
      size: 'small'
    });
  }

  render() {
    const workingSetsStore = this.state.workingSetsStore;
    const toolbar = this.state.shouldRenderToolbar && workingSetsStore != null ? this._renderToolbar(workingSetsStore) : null;
    const uncommittedChangesSection = this.state.showUncommittedChanges ? this._renderUncommittedChangesSection() : null;
    const openFilesSection = this.state.showOpenFiles && this.state.openFilesUris.length > 0 ? this._renderOpenFilesSection() : null;
    const foldersCaption = uncommittedChangesSection != null || openFilesSection != null ? this._renderFoldersCaption() : null;

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
      this.state.foldersExpanded && _react.createElement((_VirtualizedFileTree || _load_VirtualizedFileTree()).VirtualizedFileTree, {
        ref: this._setScrollerRef,
        onMouseEnter: this._handleFileTreeHovered,
        onMouseLeave: this._handleFileTreeUnhovered,
        onScroll: this._handleScroll,
        height: this.state.scrollerHeight,
        width: this.state.scrollerWidth,
        initialScrollTop: this._scrollerScrollTop
      })
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
    const activeEditors = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeActiveTextEditor.bind(atom.workspace));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(activeEditors.debounceTime(100).let((0, (_observable || _load_observable()).toggle)(this._showOpenConfigValues)).subscribe(editor => {
      if (editor == null || typeof editor.getPath !== 'function' || editor.getPath() == null) {
        this.setState({ activeUri: null });
        return;
      }

      this.setState({ activeUri: editor.getPath() });
    }));
  }

  isFocused() {
    if (this._scrollerRef == null) {
      return false;
    }

    const el = _reactDom.default.findDOMNode(this._scrollerRef);
    if (el == null) {
      return false;
    }
    return el.contains(document.activeElement);
  }

  focus() {
    if (this._scrollerRef == null) {
      return;
    }
    const el = _reactDom.default.findDOMNode(this._scrollerRef);
    if (el == null) {
      return;
    }

    if (!(el instanceof HTMLElement)) {
      throw new Error('Invariant violation: "el instanceof HTMLElement"');
    }

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
/* global HTMLElement */

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

function filterMultiRootFileChanges(unfilteredFileChanges) {
  const filteredFileChanges = new Map();
  // Filtering the changes to make sure they only show up under the directory the
  // file exists under.
  for (const [root, fileChanges] of unfilteredFileChanges) {
    const filteredFiles = new Map(fileChanges.filter((_, filePath) => filePath.startsWith(root)));
    if (filteredFiles.size !== 0) {
      filteredFileChanges.set(root, filteredFiles);
    }
  }

  return filteredFileChanges;
}