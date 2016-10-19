var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

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

var _libFileTreeActions;

function _load_libFileTreeActions() {
  return _libFileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _libFileTreeStore;

function _load_libFileTreeStore() {
  return _libFileTreeStore = require('../lib/FileTreeStore');
}

var _nuclideUiMultiRootChangedFilesView;

function _load_nuclideUiMultiRootChangedFilesView() {
  return _nuclideUiMultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _nuclideUiPanelComponentScroller;

function _load_nuclideUiPanelComponentScroller() {
  return _nuclideUiPanelComponentScroller = require('../../nuclide-ui/PanelComponentScroller');
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _nuclideUiSection;

function _load_nuclideUiSection() {
  return _nuclideUiSection = require('../../nuclide-ui/Section');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';
var SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChanges';

var FileTreeSidebarComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarComponent, _React$Component);

  function FileTreeSidebarComponent(props) {
    _classCallCheck(this, FileTreeSidebarComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarComponent.prototype), 'constructor', this).call(this, props);

    this._actions = (_libFileTreeActions || _load_libFileTreeActions()).default.getInstance();
    this._store = (_libFileTreeStore || _load_libFileTreeStore()).FileTreeStore.getInstance();
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
    this._showOpenConfigValues = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observeAsStream(SHOW_OPEN_FILE_CONFIG_KEY).cache(1);
    this._showUncommittedConfigValue = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observeAsStream(SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY).cache(1);

    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
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

  _createClass(FileTreeSidebarComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      this._processExternalUpdate();

      window.addEventListener('resize', this._onViewChange);
      this._afRequestId = window.requestAnimationFrame(function () {
        _this._onViewChange();
        _this._afRequestId = null;
      });

      this._disposables.add(this._store.subscribe(this._processExternalUpdate), atom.project.onDidChangePaths(this._processExternalUpdate), (0, (_commonsNodeObservable || _load_commonsNodeObservable()).toggle)(observeAllModifiedStatusChanges(), this._showOpenConfigValues).subscribe(function () {
        return _this._setModifiedUris();
      }), this._monitorActiveUri(), this._showOpenConfigValues.subscribe(function (showOpenFiles) {
        return _this.setState({ showOpenFiles: showOpenFiles });
      }), this._showUncommittedConfigValue.subscribe(function (showUncommittedChanges) {
        return _this.setState({ showUncommittedChanges: showUncommittedChanges });
      }), function () {
        window.removeEventListener('resize', _this._onViewChange);
        if (_this._afRequestId != null) {
          window.cancelAnimationFrame(_this._afRequestId);
        }
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.hidden && !this.props.hidden) {
        this._actions.clearFilter();
        this._onViewChange();
      }
    }
  }, {
    key: '_handleFocus',
    value: function _handleFocus(event) {
      // Delegate focus to the FileTree component if this component gains focus because the FileTree
      // matches the selectors targeted by themes to show the containing panel has focus.
      if (event.target === (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this)) {
        (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.fileTree).focus();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var workingSetsStore = this._store.getWorkingSetsStore();
      var toolbar = undefined;
      if (this.state.shouldRenderToolbar && workingSetsStore != null) {
        toolbar = [(_reactForAtom || _load_reactForAtom()).React.createElement((_FileTreeSideBarFilterComponent || _load_FileTreeSideBarFilterComponent()).default, {
          key: 'filter',
          filter: this._store.getFilter(),
          found: this._store.getFilterFound()
        }), (_reactForAtom || _load_reactForAtom()).React.createElement((_FileTreeToolbarComponent || _load_FileTreeToolbarComponent()).FileTreeToolbarComponent, {
          key: 'toolbar',
          workingSetsStore: workingSetsStore
        })];
      }

      var uncommittedChangesSection = undefined;
      if (this.state.showUncommittedChanges && this.state.hasUncommittedChanges) {
        var uncommittedChangesList = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-file-tree-sidebar-uncommitted-changes' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiMultiRootChangedFilesView || _load_nuclideUiMultiRootChangedFilesView()).MultiRootChangedFilesView, {
            commandPrefix: 'file-tree-sidebar',
            fileChanges: this.state.uncommittedFileChanges,
            selectedFile: this.state.activeUri,
            hideEmptyFolders: true,
            onFileChosen: this._onFileChosen
          })
        );

        uncommittedChangesSection = (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
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

      var openFilesSection = null;
      var openFilesList = null;
      if (this.state.showOpenFiles && this.state.openFilesUris.length > 0) {
        if (this._store.openFilesExpanded) {
          openFilesList = (_reactForAtom || _load_reactForAtom()).React.createElement((_OpenFilesListComponent || _load_OpenFilesListComponent()).OpenFilesListComponent, {
            uris: this.state.openFilesUris,
            modifiedUris: this.state.modifiedUris,
            activeUri: this.state.activeUri
          });
        }
        openFilesSection = (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiSection || _load_nuclideUiSection()).Section,
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

      var foldersCaption = undefined;
      if (uncommittedChangesSection != null || openFilesSection != null) {
        foldersCaption = (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiSection || _load_nuclideUiSection()).Section, { className: 'nuclide-file-tree-section-caption', headline: 'FOLDERS', size: 'small' });
      }

      // Include `tabIndex` so this component can be focused by calling its native `focus` method.
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        {
          className: 'nuclide-file-tree-toolbar-container',
          onFocus: this._handleFocus,
          tabIndex: 0 },
        uncommittedChangesSection,
        openFilesSection,
        toolbar,
        foldersCaption,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiPanelComponentScroller || _load_nuclideUiPanelComponentScroller()).PanelComponentScroller,
          {
            ref: 'scroller',
            onScroll: this._onScroll },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_FileTree || _load_FileTree()).FileTree, {
            ref: 'fileTree',
            containerHeight: this.state.scrollerHeight,
            containerScrollTop: this.state.scrollerScrollTop,
            scrollToPosition: this._scrollToPosition
          })
        )
      );
    }
  }, {
    key: '_processExternalUpdate',
    value: function _processExternalUpdate() {
      var shouldRenderToolbar = !this._store.roots.isEmpty();
      var openFilesUris = this._store.getOpenFilesWorkingSet().getUris();

      if (shouldRenderToolbar !== this.state.shouldRenderToolbar || openFilesUris !== this.state.openFilesUris) {
        this.setState({ shouldRenderToolbar: shouldRenderToolbar, openFilesUris: openFilesUris });
      } else {
        // Note: It's safe to call forceUpdate here because the change events are de-bounced.
        this.forceUpdate();
      }

      // Since we maintain the list of active directories for sidebar, the only way
      // to know if the section is empty or not is by checking each directory entry
      // and checking if they are empty. If all are empty hide the section.
      var uncommittedFileChanges = this._store.getFileChanges();
      var hasUncommittedChanges = Array.from(uncommittedFileChanges.values()).some(function (fileChanges) {
        return fileChanges.size > 0;
      });

      this.setState({ uncommittedFileChanges: uncommittedFileChanges, hasUncommittedChanges: hasUncommittedChanges });
    }
  }, {
    key: '_onFileChosen',
    value: function _onFileChosen(filePath) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-file-open');
      atom.workspace.open(filePath);
    }
  }, {
    key: '_handleOpenFilesExpandedChange',
    value: function _handleOpenFilesExpandedChange(isCollapsed) {
      this._actions.setOpenFilesExpanded(!isCollapsed);
    }
  }, {
    key: '_handleUncommittedFilesExpandedChange',
    value: function _handleUncommittedFilesExpandedChange(isCollapsed) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-uncommitted-file-changes-toggle');
      this._actions.setUncommittedChangesExpanded(!isCollapsed);
    }
  }, {
    key: '_setModifiedUris',
    value: function _setModifiedUris() {
      var modifiedUris = getCurrentBuffers().filter(function (buffer) {
        return buffer.isModified();
      }).map(function (buffer) {
        return buffer.getPath() || '';
      }).filter(function (path) {
        return path !== '';
      });

      this.setState({ modifiedUris: modifiedUris });
    }
  }, {
    key: '_monitorActiveUri',
    value: function _monitorActiveUri() {
      var _this2 = this;

      var activeEditors = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidStopChangingActivePaneItem.bind(atom.workspace));

      return new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default((0, (_commonsNodeObservable || _load_commonsNodeObservable()).toggle)(activeEditors, this._showOpenConfigValues).subscribe(function (editor) {
        if (editor == null || typeof editor.getPath !== 'function' || editor.getPath() == null) {
          _this2.setState({ activeUri: null });
          return;
        }

        _this2.setState({ activeUri: editor.getPath() });
      }));
    }
  }, {
    key: '_onViewChange',
    value: function _onViewChange() {
      var node = (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.scroller);
      var clientHeight = node.clientHeight;
      var scrollTop = node.scrollTop;

      if (clientHeight !== this.state.scrollerHeight || scrollTop !== this.state.scrollerScrollTop) {
        this.setState({ scrollerHeight: clientHeight, scrollerScrollTop: scrollTop });
      }
    }
  }, {
    key: '_onScroll',
    value: function _onScroll() {
      if (!this._scrollWasTriggeredProgrammatically) {
        this._actions.clearTrackedNode();
      }
      this._scrollWasTriggeredProgrammatically = false;
      this._onViewChange();
    }
  }, {
    key: '_scrollToPosition',
    value: function _scrollToPosition(top, height) {
      var _this3 = this;

      var requestedBottom = top + height;
      var currentBottom = this.state.scrollerScrollTop + this.state.scrollerHeight;
      if (top > this.state.scrollerScrollTop && requestedBottom <= currentBottom) {
        return; // Already in the view
      }

      var node = (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.scroller);
      if (node == null) {
        return;
      }
      var newTop = Math.max(top + height / 2 - this.state.scrollerHeight / 2, 0);
      setImmediate(function () {
        try {
          // For the rather unlikely chance that the node is already gone from the DOM
          _this3._scrollWasTriggeredProgrammatically = true;
          node.scrollTop = newTop;
          _this3.setState({ scrollerScrollTop: newTop });
        } catch (e) {}
      });
    }
  }]);

  return FileTreeSidebarComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

function observeAllModifiedStatusChanges() {
  var paneItemChangeEvents = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).startWith(undefined);

  return paneItemChangeEvents.map(getCurrentBuffers).switchMap(function (buffers) {
    var _Observable;

    return (_Observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(buffers.map(function (buffer) {
      return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer));
    })));
  });
}

function getCurrentBuffers() {
  var buffers = [];
  var editors = atom.workspace.getTextEditors();
  editors.forEach(function (te) {
    var buffer = te.getBuffer();

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