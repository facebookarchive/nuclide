"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _atom = require("atom");

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _DragResizeContainer() {
  const data = require("../../../modules/nuclide-commons-ui/DragResizeContainer");

  _DragResizeContainer = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Constants() {
  const data = require("../lib/Constants");

  _Constants = function () {
    return data;
  };

  return data;
}

function _FileTreeHelpers() {
  const data = _interopRequireDefault(require("../lib/FileTreeHelpers"));

  _FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _VirtualizedFileTree() {
  const data = require("./VirtualizedFileTree");

  _VirtualizedFileTree = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _FileTreeSideBarFilterComponent() {
  const data = _interopRequireDefault(require("./FileTreeSideBarFilterComponent"));

  _FileTreeSideBarFilterComponent = function () {
    return data;
  };

  return data;
}

function _FileTreeToolbarComponent() {
  const data = require("./FileTreeToolbarComponent");

  _FileTreeToolbarComponent = function () {
    return data;
  };

  return data;
}

function _OpenFilesListComponent() {
  const data = require("./OpenFilesListComponent");

  _OpenFilesListComponent = function () {
    return data;
  };

  return data;
}

function _LockableHeightComponent() {
  const data = require("./LockableHeightComponent");

  _LockableHeightComponent = function () {
    return data;
  };

  return data;
}

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _MultiRootChangedFilesView() {
  const data = require("../../nuclide-ui/MultiRootChangedFilesView");

  _MultiRootChangedFilesView = function () {
    return data;
  };

  return data;
}

function _PanelComponentScroller() {
  const data = require("../../../modules/nuclide-commons-ui/PanelComponentScroller");

  _PanelComponentScroller = function () {
    return data;
  };

  return data;
}

function _observableDom() {
  const data = require("../../../modules/nuclide-commons-ui/observable-dom");

  _observableDom = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _Section() {
  const data = require("../../../modules/nuclide-commons-ui/Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

function _ContextMenu() {
  const data = require("../../../modules/nuclide-commons-atom/ContextMenu");

  _ContextMenu = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
    return data;
  };

  return data;
}

function _reselect() {
  const data = require("reselect");

  _reselect = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
class FileTreeSidebarComponent extends React.Component {
  // $FlowFixMe flow does not recognize VirtualizedFileTree as React component
  constructor(props) {
    super(props);

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
        throw new Error("Invariant violation: \"scroller instanceof HTMLElement\"");
      }

      this._scrollerElements.next(scroller);
    };

    this._handleFocus = event => {
      if (event.target === _reactDom.default.findDOMNode(this)) {
        this.focus();
      }
    };

    this._handleFileTreeHovered = () => {
      this.setState({
        isFileTreeHovered: true
      });
    };

    this._handleFileTreeUnhovered = () => {
      this.setState({
        isFileTreeHovered: false
      });
    };

    this._processExternalUpdate = () => {
      const shouldRenderToolbar = !Selectors().isEmpty(this.props.store);
      const openFilesUris = Selectors().getOpenFilesWorkingSet(this.props.store).getAbsoluteUris();
      const uncommittedFileChanges = Selectors().getFileChanges(this.props.store);
      const generatedOpenChangedFiles = Selectors().getGeneratedOpenChangedFiles(this.props.store);
      const isCalculatingChanges = Selectors().getIsCalculatingChanges(this.props.store);
      const title = this.getTitle();
      const path = this.getPath();
      const workingSetsStore = Selectors().getWorkingSetsStore(this.props.store);
      const filter = Selectors().getFilter(this.props.store);
      const filterFound = Selectors().getFilterFound(this.props.store);
      const foldersExpanded = Selectors().getFoldersExpanded(this.props.store);
      const uncommittedChangesExpanded = Selectors().getUncommittedChangesExpanded(this.props.store);
      const openFilesExpanded = Selectors().getOpenFilesExpanded(this.props.store);
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
        this.setState({
          isFileTreeHovered: false
        });
      }

      this.props.actions.setFoldersExpanded(!isCollapsed);
    };

    this._handleOpenFilesExpandedChange = isCollapsed => {
      this.props.actions.setOpenFilesExpanded(!isCollapsed);
    };

    this._handleUncommittedFilesExpandedChange = isCollapsed => {
      (0, _nuclideAnalytics().track)('filetree-uncommitted-file-changes-toggle');
      this.props.actions.setUncommittedChangesExpanded(!isCollapsed);
    };

    this._handleUncommittedChangesKindDownArrow = event => {
      if (!(_electron.remote != null)) {
        throw new Error("Invariant violation: \"remote != null\"");
      }

      const menu = new _electron.remote.Menu();

      for (const enumKey in _Constants().ShowUncommittedChangesKind) {
        const kind = _Constants().ShowUncommittedChangesKind[enumKey];

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

      menu.popup({
        x: event.clientX,
        y: event.clientY,
        async: true
      });
      this._menu = menu;
      event.stopPropagation();
    };

    this._handleScroll = scrollTop => {
      // Do not store in state to not cause extra rendering loops on update
      this._scrollerScrollTop = scrollTop;
    };

    this._getFilteredUncommittedFileChanges = (0, _reselect().createSelector)([state => state.uncommittedFileChanges], filterMultiRootFileChanges);
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
      uncommittedFileChanges: _immutable().default.Map(),
      generatedOpenChangedFiles: _immutable().default.Map(),
      isCalculatingChanges: false,
      path: 'No Current Working Directory',
      title: 'File Tree',
      isFileTreeHovered: false,
      workingSetsStore: Selectors().getWorkingSetsStore(this.props.store),
      filter: Selectors().getFilter(this.props.store),
      filterFound: Selectors().getFilterFound(this.props.store),
      foldersExpanded: Selectors().getFoldersExpanded(this.props.store),
      uncommittedChangesExpanded: Selectors().getUncommittedChangesExpanded(this.props.store),
      openFilesExpanded: Selectors().getOpenFilesExpanded(this.props.store)
    };
    this._showOpenConfigValues = (0, _observable().cacheWhileSubscribed)(_featureConfig().default.observeAsStream(_Constants().SHOW_OPEN_FILE_CONFIG_KEY));
    this._showUncommittedConfigValue = (0, _observable().cacheWhileSubscribed)(_featureConfig().default.observeAsStream(_Constants().SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY));
    this._showUncommittedKindConfigValue = _FileTreeHelpers().default.observeUncommittedChangesKindConfigKey();
    this._scrollerElements = new _RxMin.Subject();
    this._scrollerScrollTop = 0;
    this._scrollerRef = null;
    this._disposables = new (_UniversalDisposable().default)(this._emitter, this._subscribeToResizeEvents());
  }

  componentDidMount() {
    const componentDOMNode = _reactDom.default.findDOMNode(this);

    if (!(componentDOMNode instanceof HTMLElement)) {
      throw new Error("Invariant violation: \"componentDOMNode instanceof HTMLElement\"");
    }

    this._processExternalUpdate();

    this._disposables.add(this.props.store.subscribe(this._processExternalUpdate), observeAllModifiedStatusChanges().let((0, _observable().toggle)(this._showOpenConfigValues)).subscribe(() => this._setModifiedUris()), this._monitorActiveUri(), this._showOpenConfigValues.subscribe(showOpenFiles => this.setState({
      showOpenFiles
    })), this._showUncommittedConfigValue.subscribe(showUncommittedChanges => this.setState({
      showUncommittedChanges
    })), this._showUncommittedKindConfigValue.subscribe(showUncommittedChangesKind => this.setState({
      showUncommittedChangesKind
    })), // Customize the context menu to remove items that match the 'atom-pane' selector.
    _RxMin.Observable.fromEvent(componentDOMNode, 'contextmenu').switchMap(event => {
      if (event.button !== 2) {
        return _RxMin.Observable.never();
      }

      event.preventDefault();
      event.stopPropagation(); // Find all the item sets that match the 'atom-pane' selector. We're going to remove these
      // by changing their selector.

      const paneItemSets = atom.contextMenu.itemSets.filter(itemSet => itemSet.selector === 'atom-pane'); // Override the selector while we get the template.

      paneItemSets.forEach(itemSet => {
        itemSet.selector = 'do-not-match-anything';
      });
      const menuTemplate = atom.contextMenu.templateForEvent(event);
      paneItemSets.forEach(itemSet => {
        itemSet.selector = 'atom-pane';
      }); // Wrap the disposable in an observable. This way we don't have to manually track these
      // disposables, they'll be managed for us.

      return _RxMin.Observable.create(() => (0, _ContextMenu().showMenuForEvent)(event, menuTemplate));
    }).subscribe(), (0, _observePaneItemVisibility().default)(this).subscribe(visible => {
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
      if (_featureConfig().default.get(_Constants().REVEAL_FILE_ON_SWITCH_SETTING)) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:reveal-active-file');
      }

      this.props.actions.clearFilter();
    }
  }

  _subscribeToResizeEvents() {
    const scrollerRects = this._scrollerElements.switchMap(scroller => {
      if (scroller == null) {
        return _RxMin.Observable.empty();
      }

      return new (_observableDom().ResizeObservable)(scroller).map(arr => {
        if (arr.length === 0) {
          return null;
        }

        return arr[arr.length - 1].contentRect;
      });
    });

    return scrollerRects.let(_observable().compact).subscribe(rect => this.setState({
      scrollerHeight: rect.height,
      scrollerWidth: rect.width
    }));
  }

  _renderToolbar(workingSetsStore) {
    return React.createElement("div", {
      className: "nuclide-file-tree-fixed"
    }, React.createElement(_FileTreeSideBarFilterComponent().default, {
      key: "filter",
      filter: this.state.filter,
      found: this.state.filterFound
    }), this.state.foldersExpanded && React.createElement(_FileTreeToolbarComponent().FileTreeToolbarComponent, {
      key: "toolbar",
      workingSetsStore: workingSetsStore,
      store: this.props.store,
      actions: this.props.actions
    }));
  }

  _renderUncommittedChangesSection() {
    const uncommittedChangesList = React.createElement("div", {
      className: "nuclide-file-tree-sidebar-uncommitted-changes"
    }, React.createElement(_MultiRootChangedFilesView().MultiRootChangedFilesView, {
      analyticsSurface: "file-tree-uncommitted-changes",
      commandPrefix: "file-tree-sidebar",
      enableInlineActions: true,
      fileStatuses: this._getFilteredUncommittedFileChanges(this.state),
      generatedTypes: this.state.generatedOpenChangedFiles,
      selectedFile: this.state.activeUri,
      hideEmptyFolders: true,
      onFileChosen: this._onFileChosen,
      openInDiffViewOption: true
    }));
    const showDropdown = Array.from(this.state.uncommittedFileChanges.keys()).some(path => {
      const repo = (0, _nuclideVcsBase().repositoryForPath)(path);
      return repo != null && repo.getType() === 'hg';
    });
    const dropdownIcon = !showDropdown ? null : React.createElement(_Icon().Icon, {
      icon: "triangle-down",
      className: "nuclide-file-tree-toolbar-fader nuclide-ui-dropdown-icon",
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
    const calculatingChangesSpinner = !this.state.isCalculatingChanges ? null : React.createElement("span", {
      className: "nuclide-file-tree-spinner"
    }, "\xA0", React.createElement(_LoadingSpinner().LoadingSpinner, {
      className: "inline-block",
      size: _LoadingSpinner().LoadingSpinnerSizes.EXTRA_SMALL
    }));
    const uncommittedChangesHeadline = // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
    React.createElement("span", {
      ref: (0, _addTooltip().default)({
        title: dropdownTooltip
      })
    }, React.createElement("span", {
      className: "nuclide-dropdown-label-text-wrapper"
    }, this.state.showUncommittedChangesKind.toUpperCase()), dropdownIcon, calculatingChangesSpinner);
    return React.createElement("div", {
      className: "nuclide-file-tree-uncommitted-changes-container",
      "data-show-uncommitted-changes-kind": this.state.showUncommittedChangesKind
    }, React.createElement(_Section().Section, {
      className: "nuclide-file-tree-section-caption",
      collapsable: true,
      collapsed: !this.state.uncommittedChangesExpanded,
      headline: uncommittedChangesHeadline,
      onChange: this._handleUncommittedFilesExpandedChange,
      size: "small"
    }, React.createElement(_DragResizeContainer().DragResizeContainer, null, React.createElement(_PanelComponentScroller().PanelComponentScroller, {
      className: "nuclide-file-tree-sidebar-uncommitted-changes-container"
    }, uncommittedChangesList))));
  }

  _renderOpenFilesSection() {
    const openFilesList = this.state.openFilesExpanded ? React.createElement(_OpenFilesListComponent().OpenFilesListComponent, {
      uris: this.state.openFilesUris,
      modifiedUris: this.state.modifiedUris,
      generatedTypes: this.state.generatedOpenChangedFiles,
      activeUri: this.state.activeUri,
      store: this.props.store,
      actions: this.props.actions
    }) : null;
    return React.createElement(_LockableHeightComponent().LockableHeight, {
      isLocked: this.state.isFileTreeHovered
    }, React.createElement(_Section().Section, {
      className: "nuclide-file-tree-section-caption nuclide-file-tree-open-files-section",
      collapsable: true,
      collapsed: !this.state.openFilesExpanded,
      headline: "OPEN FILES",
      onChange: this._handleOpenFilesExpandedChange,
      size: "small"
    }, openFilesList));
  }

  _renderFoldersCaption() {
    return React.createElement(_Section().Section, {
      className: "nuclide-file-tree-section-caption",
      headline: "FOLDERS",
      collapsable: true,
      collapsed: !this.state.foldersExpanded,
      onChange: this._handleFoldersExpandedChange,
      size: "small"
    });
  }

  render() {
    const workingSetsStore = this.state.workingSetsStore;
    const toolbar = this.state.shouldRenderToolbar && workingSetsStore != null ? this._renderToolbar(workingSetsStore) : null;
    const uncommittedChangesSection = this.state.showUncommittedChanges ? this._renderUncommittedChangesSection() : null;
    const openFilesSection = this.state.showOpenFiles && this.state.openFilesUris.length > 0 ? this._renderOpenFilesSection() : null;
    const foldersCaption = uncommittedChangesSection != null || openFilesSection != null ? this._renderFoldersCaption() : null; // Include `tabIndex` so this component can be focused by calling its native `focus` method.

    return React.createElement("div", {
      className: "nuclide-file-tree-toolbar-container",
      onFocus: this._handleFocus,
      tabIndex: 0
    }, uncommittedChangesSection, openFilesSection, foldersCaption, toolbar, this.state.foldersExpanded && React.createElement(_VirtualizedFileTree().VirtualizedFileTree, {
      ref: this._setScrollerRef,
      onMouseEnter: this._handleFileTreeHovered,
      onMouseLeave: this._handleFileTreeUnhovered,
      onScroll: this._handleScroll,
      height: this.state.scrollerHeight,
      width: this.state.scrollerWidth,
      initialScrollTop: this._scrollerScrollTop,
      store: this.props.store,
      actions: this.props.actions
    }));
  }

  _onFileChosen(filePath) {
    (0, _nuclideAnalytics().track)('filetree-uncommitted-file-changes-file-open');
    (0, _goToLocation().goToLocation)(filePath);
  }

  _handleShowUncommittedChangesKindChange(showUncommittedChangesKind) {
    switch (showUncommittedChangesKind) {
      case _Constants().ShowUncommittedChangesKind.UNCOMMITTED:
        (0, _nuclideAnalytics().track)('filetree-changes-kind-uncommitted');
        break;

      case _Constants().ShowUncommittedChangesKind.HEAD:
        (0, _nuclideAnalytics().track)('filetree-changes-kind-head');
        break;

      case _Constants().ShowUncommittedChangesKind.STACK:
        (0, _nuclideAnalytics().track)('filetree-changes-kind-stack');
        break;
    }

    _featureConfig().default.set(_Constants().SHOW_UNCOMMITTED_CHANGES_KIND_CONFIG_KEY, showUncommittedChangesKind);
  }

  _setModifiedUris() {
    const modifiedUris = getCurrentBuffers().filter(buffer => buffer.isModified()).map(buffer => buffer.getPath() || '').filter(path => path !== '');
    this.setState({
      modifiedUris
    });
  }

  _monitorActiveUri() {
    const activeEditors = (0, _event().observableFromSubscribeFunction)(atom.workspace.observeActiveTextEditor.bind(atom.workspace));
    return new (_UniversalDisposable().default)(activeEditors.debounceTime(100).let((0, _observable().toggle)(this._showOpenConfigValues)).subscribe(editor => {
      if (editor == null || typeof editor.getPath !== 'function' || editor.getPath() == null) {
        this.setState({
          activeUri: null
        });
        return;
      }

      this.setState({
        activeUri: editor.getPath()
      });
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
      throw new Error("Invariant violation: \"el instanceof HTMLElement\"");
    }

    el.focus();
  }

  getTitle() {
    const cwdKey = Selectors().getCwdKey(this.props.store);

    if (cwdKey == null) {
      return 'File Tree';
    }

    return _nuclideUri().default.basename(cwdKey);
  } // This is unfortunate, but Atom uses getTitle() to get the text in the tab and getPath() to get
  // the text in the tool-tip.


  getPath() {
    const cwdKey = Selectors().getCwdKey(this.props.store);

    if (cwdKey == null) {
      return 'No Current Working Directory';
    }

    const trimmed = _nuclideUri().default.trimTrailingSeparator(cwdKey);

    const directory = _nuclideUri().default.getPath(trimmed);

    const host = _nuclideUri().default.getHostnameOpt(trimmed);

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
    return _Constants().WORKSPACE_VIEW_URI;
  }

  didChangeVisibility(visible) {
    this.setState({
      hidden: !visible
    });
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

exports.default = FileTreeSidebarComponent;

function observeAllModifiedStatusChanges() {
  const paneItemChangeEvents = _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, _event().observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).startWith(undefined);

  return paneItemChangeEvents.map(getCurrentBuffers).switchMap(buffers => _RxMin.Observable.merge(...buffers.map(buffer => {
    return (0, _event().observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer));
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
  const filteredFileChanges = new Map(); // Filtering the changes to make sure they only show up under the directory the
  // file exists under.

  for (const [root, fileChanges] of unfilteredFileChanges) {
    const filteredFiles = new Map(fileChanges.filter((_, filePath) => filePath.startsWith(root)));

    if (filteredFiles.size !== 0) {
      filteredFileChanges.set(root, filteredFiles);
    }
  }

  return filteredFileChanges;
}