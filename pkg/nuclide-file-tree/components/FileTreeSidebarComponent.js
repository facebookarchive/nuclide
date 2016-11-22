'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FileTree;

function _load_FileTree() {
  return _FileTree = require('./FileTree');
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
  return _PanelComponentScroller = require('../../nuclide-ui/PanelComponentScroller');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';
const SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChanges';

let FileTreeSidebarComponent = class FileTreeSidebarComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this.state = {
      shouldRenderToolbar: false,
      scrollerHeight: 0,
      scrollerScrollTop: 0,
      showOpenFiles: true,
      showUncommittedChanges: true,
      openFilesUris: [],
      modifiedUris: [],
      activeUri: null,
      hasUncommittedChanges: false,
      uncommittedFileChanges: new Map()
    };
    this._showOpenConfigValues = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream(SHOW_OPEN_FILE_CONFIG_KEY));
    this._showUncommittedConfigValue = (0, (_observable || _load_observable()).cacheWhileSubscribed)((_featureConfig || _load_featureConfig()).default.observeAsStream(SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY));

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._afRequestId = null;
    this._scrollWasTriggeredProgrammatically = false;
    this._handleFocus = this._handleFocus.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._scrollToPosition = this._scrollToPosition.bind(this);
    this._processExternalUpdate = this._processExternalUpdate.bind(this);
    this._handleOpenFilesExpandedChange = this._handleOpenFilesExpandedChange.bind(this);
    this._handleUncommittedFilesExpandedChange = this._handleUncommittedFilesExpandedChange.bind(this);
  }

  componentDidMount() {
    this._processExternalUpdate();

    window.addEventListener('resize', this._onViewChange);
    this._afRequestId = window.requestAnimationFrame(() => {
      this._onViewChange();
      this._afRequestId = null;
    });

    this._disposables.add(this._store.subscribe(this._processExternalUpdate), atom.project.onDidChangePaths(this._processExternalUpdate), (0, (_observable || _load_observable()).toggle)(observeAllModifiedStatusChanges(), this._showOpenConfigValues).subscribe(() => this._setModifiedUris()), this._monitorActiveUri(), this._showOpenConfigValues.subscribe(showOpenFiles => this.setState({ showOpenFiles: showOpenFiles })), this._showUncommittedConfigValue.subscribe(showUncommittedChanges => this.setState({ showUncommittedChanges: showUncommittedChanges })), () => {
      window.removeEventListener('resize', this._onViewChange);
      if (this._afRequestId != null) {
        window.cancelAnimationFrame(this._afRequestId);
      }
    });
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden && !this.props.hidden) {
      this._actions.clearFilter();
      this._onViewChange();
    }
  }

  _handleFocus(event) {
    // Delegate focus to the FileTree component if this component gains focus because the FileTree
    // matches the selectors targeted by themes to show the containing panel has focus.
    if (event.target === _reactForAtom.ReactDOM.findDOMNode(this)) {
      _reactForAtom.ReactDOM.findDOMNode(this.refs.fileTree).focus();
    }
  }

  render() {
    const workingSetsStore = this._store.getWorkingSetsStore();
    let toolbar;
    if (this.state.shouldRenderToolbar && workingSetsStore != null) {
      toolbar = [_reactForAtom.React.createElement((_FileTreeSideBarFilterComponent || _load_FileTreeSideBarFilterComponent()).default, {
        key: 'filter',
        filter: this._store.getFilter(),
        found: this._store.getFilterFound()
      }), _reactForAtom.React.createElement((_FileTreeToolbarComponent || _load_FileTreeToolbarComponent()).FileTreeToolbarComponent, {
        key: 'toolbar',
        workingSetsStore: workingSetsStore
      })];
    }

    let uncommittedChangesSection;
    if (this.state.showUncommittedChanges && this.state.hasUncommittedChanges) {
      const uncommittedChangesList = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-file-tree-sidebar-uncommitted-changes' },
        _reactForAtom.React.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
          commandPrefix: 'file-tree-sidebar',
          fileChanges: this.state.uncommittedFileChanges,
          selectedFile: this.state.activeUri,
          hideEmptyFolders: true,
          onFileChosen: this._onFileChosen
        })
      );

      uncommittedChangesSection = _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-file-tree-section-caption',
          collapsable: true,
          collapsed: !this._store.uncommittedChangesExpanded,
          headline: 'UNCOMMITTED CHANGES',
          onChange: this._handleUncommittedFilesExpandedChange,
          size: 'small' },
        uncommittedChangesList
      );
    }

    let openFilesSection = null;
    let openFilesList = null;
    if (this.state.showOpenFiles && this.state.openFilesUris.length > 0) {
      if (this._store.openFilesExpanded) {
        openFilesList = _reactForAtom.React.createElement((_OpenFilesListComponent || _load_OpenFilesListComponent()).OpenFilesListComponent, {
          uris: this.state.openFilesUris,
          modifiedUris: this.state.modifiedUris,
          activeUri: this.state.activeUri
        });
      }
      openFilesSection = _reactForAtom.React.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-file-tree-section-caption',
          collapsable: true,
          collapsed: !this._store.openFilesExpanded,
          headline: 'OPEN FILES',
          onChange: this._handleOpenFilesExpandedChange,
          size: 'small' },
        openFilesList
      );
    }

    let foldersCaption;
    if (uncommittedChangesSection != null || openFilesSection != null) {
      foldersCaption = _reactForAtom.React.createElement((_Section || _load_Section()).Section, { className: 'nuclide-file-tree-section-caption', headline: 'FOLDERS', size: 'small' });
    }

    // Include `tabIndex` so this component can be focused by calling its native `focus` method.
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'nuclide-file-tree-toolbar-container',
        onFocus: this._handleFocus,
        tabIndex: 0 },
      uncommittedChangesSection,
      openFilesSection,
      foldersCaption,
      _reactForAtom.React.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        {
          ref: 'scroller',
          onScroll: this._onScroll },
        toolbar,
        _reactForAtom.React.createElement((_FileTree || _load_FileTree()).FileTree, {
          ref: 'fileTree',
          containerHeight: this.state.scrollerHeight,
          containerScrollTop: this.state.scrollerScrollTop,
          scrollToPosition: this._scrollToPosition
        })
      )
    );
  }

  _processExternalUpdate() {
    const shouldRenderToolbar = !this._store.roots.isEmpty();
    const openFilesUris = this._store.getOpenFilesWorkingSet().getUris();

    if (shouldRenderToolbar !== this.state.shouldRenderToolbar || openFilesUris !== this.state.openFilesUris) {
      this.setState({ shouldRenderToolbar: shouldRenderToolbar, openFilesUris: openFilesUris });
    } else {
      // Note: It's safe to call forceUpdate here because the change events are de-bounced.
      this.forceUpdate();
    }

    // Since we maintain the list of active directories for sidebar, the only way
    // to know if the section is empty or not is by checking each directory entry
    // and checking if they are empty. If all are empty hide the section.
    const uncommittedFileChanges = this._store.getFileChanges();
    const hasUncommittedChanges = Array.from(uncommittedFileChanges.values()).some(fileChanges => fileChanges.size > 0);

    this.setState({ uncommittedFileChanges: uncommittedFileChanges, hasUncommittedChanges: hasUncommittedChanges });
  }

  _onFileChosen(filePath) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-file-open');
    atom.workspace.open(filePath);
  }

  _handleOpenFilesExpandedChange(isCollapsed) {
    this._actions.setOpenFilesExpanded(!isCollapsed);
  }

  _handleUncommittedFilesExpandedChange(isCollapsed) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-toggle');
    this._actions.setUncommittedChangesExpanded(!isCollapsed);
  }

  _setModifiedUris() {
    const modifiedUris = getCurrentBuffers().filter(buffer => buffer.isModified()).map(buffer => buffer.getPath() || '').filter(path => path !== '');

    this.setState({ modifiedUris: modifiedUris });
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

  _onViewChange() {
    const node = _reactForAtom.ReactDOM.findDOMNode(this.refs.scroller);
    const clientHeight = node.clientHeight,
          scrollTop = node.scrollTop;


    if (clientHeight !== this.state.scrollerHeight || scrollTop !== this.state.scrollerScrollTop) {
      this.setState({ scrollerHeight: clientHeight, scrollerScrollTop: scrollTop });
    }
  }

  _onScroll() {
    if (!this._scrollWasTriggeredProgrammatically) {
      this._actions.clearTrackedNode();
    }
    this._scrollWasTriggeredProgrammatically = false;
    this._onViewChange();
  }

  _scrollToPosition(top, height) {
    const requestedBottom = top + height;
    const currentBottom = this.state.scrollerScrollTop + this.state.scrollerHeight;
    if (top > this.state.scrollerScrollTop && requestedBottom <= currentBottom) {
      return; // Already in the view
    }

    const node = _reactForAtom.ReactDOM.findDOMNode(this.refs.scroller);
    if (node == null) {
      return;
    }
    const newTop = Math.max(top + height / 2 - this.state.scrollerHeight / 2, 0);
    setImmediate(() => {
      try {
        // For the rather unlikely chance that the node is already gone from the DOM
        this._scrollWasTriggeredProgrammatically = true;
        node.scrollTop = newTop;
        this.setState({ scrollerScrollTop: newTop });
      } catch (e) {}
    });
  }
};


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

module.exports = FileTreeSidebarComponent;