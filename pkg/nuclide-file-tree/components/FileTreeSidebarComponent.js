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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _FileTree2;

function _FileTree() {
  return _FileTree2 = require('./FileTree');
}

var _FileTreeSideBarFilterComponent2;

function _FileTreeSideBarFilterComponent() {
  return _FileTreeSideBarFilterComponent2 = _interopRequireDefault(require('./FileTreeSideBarFilterComponent'));
}

var _FileTreeToolbarComponent2;

function _FileTreeToolbarComponent() {
  return _FileTreeToolbarComponent2 = require('./FileTreeToolbarComponent');
}

var _OpenFilesListComponent2;

function _OpenFilesListComponent() {
  return _OpenFilesListComponent2 = require('./OpenFilesListComponent');
}

var _libFileTreeActions2;

function _libFileTreeActions() {
  return _libFileTreeActions2 = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _libFileTreeStore2;

function _libFileTreeStore() {
  return _libFileTreeStore2 = require('../lib/FileTreeStore');
}

var _nuclideUiMultiRootChangedFilesView2;

function _nuclideUiMultiRootChangedFilesView() {
  return _nuclideUiMultiRootChangedFilesView2 = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _nuclideUiPanelComponentScroller2;

function _nuclideUiPanelComponentScroller() {
  return _nuclideUiPanelComponentScroller2 = require('../../nuclide-ui/PanelComponentScroller');
}

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _url2;

function _url() {
  return _url2 = _interopRequireDefault(require('url'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _nuclideUiSection2;

function _nuclideUiSection() {
  return _nuclideUiSection2 = require('../../nuclide-ui/Section');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var SHOW_OPEN_FILE_CONFIG_KEY = 'nuclide-file-tree.showOpenFiles';
var SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY = 'nuclide-file-tree.showUncommittedChanges';

var FileTreeSidebarComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarComponent, _React$Component);

  function FileTreeSidebarComponent(props) {
    _classCallCheck(this, FileTreeSidebarComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarComponent.prototype), 'constructor', this).call(this, props);

    this._actions = (_libFileTreeActions2 || _libFileTreeActions()).default.getInstance();
    this._store = (_libFileTreeStore2 || _libFileTreeStore()).FileTreeStore.getInstance();
    this.state = {
      shouldRenderToolbar: false,
      scrollerHeight: 0,
      scrollerScrollTop: 0,
      showOpenFiles: true,
      showUncommittedChanges: true,
      openFilesUris: [],
      modifiedUris: [],
      activeUri: null
    };
    this._showOpenConfigValues = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observeAsStream(SHOW_OPEN_FILE_CONFIG_KEY).cache(1);
    this._showUncommittedConfigValue = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observeAsStream(SHOW_UNCOMMITTED_CHANGES_CONFIG_KEY).cache(1);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
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

      this._disposables.add(this._store.subscribe(this._processExternalUpdate), atom.project.onDidChangePaths(this._processExternalUpdate), new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((0, (_commonsNodeObservable2 || _commonsNodeObservable()).toggle)(observeAllModifiedStatusChanges(), this._showOpenConfigValues).subscribe(function () {
        return _this._setModifiedUris();
      })), this._monitorActiveUri(), new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._showOpenConfigValues.subscribe(function (showOpenFiles) {
        return _this.setState({ showOpenFiles: showOpenFiles });
      }), this._showUncommittedConfigValue.subscribe(function (showUncommittedChanges) {
        return _this.setState({ showUncommittedChanges: showUncommittedChanges });
      })), new (_atom2 || _atom()).Disposable(function () {
        window.removeEventListener('resize', _this._onViewChange);
        if (_this._afRequestId != null) {
          window.cancelAnimationFrame(_this._afRequestId);
        }
      }));
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
      if (event.target === (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this)) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.fileTree).focus();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var workingSetsStore = this._store.getWorkingSetsStore();
      var toolbar = undefined;
      if (this.state.shouldRenderToolbar && workingSetsStore != null) {
        toolbar = [(_reactForAtom2 || _reactForAtom()).React.createElement((_FileTreeSideBarFilterComponent2 || _FileTreeSideBarFilterComponent()).default, {
          key: 'filter',
          filter: this._store.getFilter(),
          found: this._store.getFilterFound()
        }), (_reactForAtom2 || _reactForAtom()).React.createElement((_FileTreeToolbarComponent2 || _FileTreeToolbarComponent()).FileTreeToolbarComponent, {
          key: 'toolbar',
          workingSetsStore: workingSetsStore
        })];
      }

      var uncommittedChangesSection = undefined;
      var fileChanges = this._store.getFileChanges();

      if (this.state.showUncommittedChanges && fileChanges.size > 0) {
        var uncommittedChangesList = (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiMultiRootChangedFilesView2 || _nuclideUiMultiRootChangedFilesView()).MultiRootChangedFilesView, {
          commandPrefix: 'file-tree-sidebar',
          fileChanges: this._store.getFileChanges(),
          selectedFile: this.state.activeUri,
          hideEmptyFolders: true,
          onFileChosen: this._onFileChosen
        });

        uncommittedChangesSection = (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
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
          openFilesList = (_reactForAtom2 || _reactForAtom()).React.createElement((_OpenFilesListComponent2 || _OpenFilesListComponent()).OpenFilesListComponent, {
            uris: this.state.openFilesUris,
            modifiedUris: this.state.modifiedUris,
            activeUri: this.state.activeUri
          });
        }
        openFilesSection = (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiSection2 || _nuclideUiSection()).Section,
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
        foldersCaption = (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiSection2 || _nuclideUiSection()).Section, { className: 'nuclide-file-tree-section-caption', headline: 'FOLDERS', size: 'small' });
      }

      // Include `tabIndex` so this component can be focused by calling its native `focus` method.
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: 'nuclide-file-tree-toolbar-container',
          onFocus: this._handleFocus,
          tabIndex: 0 },
        uncommittedChangesSection,
        openFilesSection,
        toolbar,
        foldersCaption,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiPanelComponentScroller2 || _nuclideUiPanelComponentScroller()).PanelComponentScroller,
          {
            ref: 'scroller',
            onScroll: this._onScroll },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_FileTree2 || _FileTree()).FileTree, {
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
    }
  }, {
    key: '_onFileChosen',
    value: function _onFileChosen(filePath) {
      var diffEntityOptions = { file: filePath };
      var formattedUrl = (_url2 || _url()).default.format({
        protocol: 'atom',
        host: 'nuclide',
        pathname: 'diff-view',
        slashes: true,
        query: diffEntityOptions
      });

      atom.workspace.open(formattedUrl);
    }
  }, {
    key: '_handleOpenFilesExpandedChange',
    value: function _handleOpenFilesExpandedChange(isCollapsed) {
      this._actions.setOpenFilesExpanded(!isCollapsed);
    }
  }, {
    key: '_handleUncommittedFilesExpandedChange',
    value: function _handleUncommittedFilesExpandedChange(isCollapsed) {
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

      var activeEditors = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidStopChangingActivePaneItem.bind(atom.workspace));

      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((0, (_commonsNodeObservable2 || _commonsNodeObservable()).toggle)(activeEditors, this._showOpenConfigValues).subscribe(function (editor) {
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
      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.scroller);
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

      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.scroller);
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

function observeAllModifiedStatusChanges() {
  var paneItemChangeEvents = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).startWith(undefined);

  return paneItemChangeEvents.map(getCurrentBuffers).switchMap(function (buffers) {
    var _Observable;

    return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(buffers.map(function (buffer) {
      return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangeModified.bind(buffer));
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