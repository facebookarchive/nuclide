'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _disablePackage;

function _load_disablePackage() {
  return _disablePackage = _interopRequireDefault(require('../../commons-atom/disablePackage'));
}

var _disablePackage2;

function _load_disablePackage2() {
  return _disablePackage2 = require('../../commons-atom/disablePackage');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _FileTreeSidebarComponent;

function _load_FileTreeSidebarComponent() {
  return _FileTreeSidebarComponent = _interopRequireDefault(require('../components/FileTreeSidebarComponent'));
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('./FileTreeActions'));
}

var _FileTreeContextMenu;

function _load_FileTreeContextMenu() {
  return _FileTreeContextMenu = _interopRequireDefault(require('./FileTreeContextMenu'));
}

var _FileTreeSelectors;

function _load_FileTreeSelectors() {
  return _FileTreeSelectors = _interopRequireWildcard(require('./FileTreeSelectors'));
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _Constants;

function _load_Constants() {
  return _Constants = require('./Constants');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../modules/nuclide-commons-atom/destroyItemWhere');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _registerCommands;

function _load_registerCommands() {
  return _registerCommands = _interopRequireDefault(require('./registerCommands'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = _interopRequireDefault(require('./FileTreeStore'));
}

var _ProjectSelectionManager;

function _load_ProjectSelectionManager() {
  return _ProjectSelectionManager = _interopRequireDefault(require('./ProjectSelectionManager'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Minimum interval (in ms) between onChangeActivePaneItem events before revealing the active pane
 * item in the file tree.
 */
const OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS = 150; /**
                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                     * All rights reserved.
                                                     *
                                                     * This source code is licensed under the license found in the LICENSE file in
                                                     * the root directory of this source tree.
                                                     *
                                                     * 
                                                     * @format
                                                     */

const TERMINAL_CONTEXT_MENU_PRIORITY = 100;

const DESERIALIZER_VERSION = atom.workspace.getLeftDock == null ? 1 : 2;

class Activation {
  // Has the package state been restored from a previous session?
  constructor(rawState) {
    let state = rawState || {};
    const serializedVersionMatches =
    // flowlint-next-line sketchy-null-mixed:off
    (state.version || 1) === DESERIALIZER_VERSION;
    if (!serializedVersionMatches) {
      state = {};
    }

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_disablePackage || _load_disablePackage()).default)('tree-view', { reason: (_disablePackage2 || _load_disablePackage2()).DisabledReason.REIMPLEMENTED }),
    // This is a horrible hack to work around the fact that the tree view doesn't properly clean
    // up after its views when disabled as soon as it's activated. See atom/tree-view#1136
    (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observePaneItems.bind(atom.workspace))
    // Wait for any post-addition work to be done by tree-view.
    // $FlowFixMe: Add `delayWhen` to RxJS defs
    .delayWhen(() => (_observable || _load_observable()).macrotask).subscribe(item => {
      if (item != null && typeof item.getURI === 'function' && item.getURI() === 'atom://tree-view' && atom.packages.isPackageDisabled('tree-view') && atom.workspace.paneForItem(item) && // Make sure it's still in the workspace.
      typeof item.destroy === 'function') {
        item.destroy();
      }
    }), () => {
      this._actions.dispose();
    });

    this._store = new (_FileTreeStore || _load_FileTreeStore()).default();
    this._actions = new (_FileTreeActions || _load_FileTreeActions()).default(this._store);
    const initialState = state == null ? null : state.tree;
    if (initialState != null) {
      this._store.loadData(initialState);
    }
    this._disposables.add((0, (_registerCommands || _load_registerCommands()).default)(this._store, this._actions));
    this._actions.updateRootDirectories();
    this._contextMenu = new (_FileTreeContextMenu || _load_FileTreeContextMenu()).default(this._store);
    this._restored = state.restored === true;

    const excludeVcsIgnoredPathsSetting = 'core.excludeVcsIgnoredPaths';
    const hideVcsIgnoredPathsSetting = 'nuclide-file-tree.hideVcsIgnoredPaths';
    const hideIgnoredNamesSetting = 'nuclide-file-tree.hideIgnoredNames';
    const ignoredNamesSetting = 'core.ignoredNames';
    const prefixKeyNavSetting = 'nuclide-file-tree.allowKeyboardPrefixNavigation';
    const allowPendingPaneItems = 'core.allowPendingPaneItems';
    const autoExpandSingleChild = 'nuclide-file-tree.autoExpandSingleChild';
    const focusEditorOnFileSelection = 'nuclide-file-tree.focusEditorOnFileSelection';

    this._disposables.add(this._fixContextMenuHighlight(), (_featureConfig || _load_featureConfig()).default.observe(prefixKeyNavSetting, usePrefixNav => {
      // config is void during startup, signifying no config yet
      if (usePrefixNav == null) {
        return;
      }
      this._actions.setUsePrefixNav(usePrefixNav);
    }), (_featureConfig || _load_featureConfig()).default.observeAsStream((_Constants || _load_Constants()).REVEAL_FILE_ON_SWITCH_SETTING).switchMap(shouldReveal => {
      return shouldReveal ? this._currentActiveFilePath() : _rxjsBundlesRxMinJs.Observable.empty();
    }).subscribe(filePath => this._actions.revealFilePath(filePath, /* showIfHidden */false)), atom.config.observe(ignoredNamesSetting, ignoredNames => {
      let normalizedIgnoredNames;
      if (ignoredNames === '') {
        normalizedIgnoredNames = [];
      } else if (typeof ignoredNames === 'string') {
        normalizedIgnoredNames = [ignoredNames];
      } else {
        normalizedIgnoredNames = ignoredNames;
      }
      this._actions.setIgnoredNames(normalizedIgnoredNames);
    }), (_featureConfig || _load_featureConfig()).default.observe(hideIgnoredNamesSetting, hideIgnoredNames => {
      this._actions.setHideIgnoredNames(hideIgnoredNames);
    }), (_featureConfig || _load_featureConfig()).default.observe(hideVcsIgnoredPathsSetting, hideVcsIgnoredPaths => {
      this._actions.setHideVcsIgnoredPaths(hideVcsIgnoredPaths);
    }), atom.config.observe(excludeVcsIgnoredPathsSetting, excludeVcsIgnoredPaths => {
      this._actions.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
    }), atom.config.observe(allowPendingPaneItems, usePreviewTabs => {
      // config is void during startup, signifying no config yet
      if (usePreviewTabs == null) {
        return;
      }
      this._actions.setUsePreviewTabs(usePreviewTabs);
    }), (_featureConfig || _load_featureConfig()).default.observe(autoExpandSingleChild, value => {
      this._actions.setAutoExpandSingleChild(value === true);
    }), (_featureConfig || _load_featureConfig()).default.observe(focusEditorOnFileSelection, value => {
      this._actions.setFocusEditorOnFileSelection(value);
    }), atom.commands.add('atom-workspace', 'tree-view:toggle-focus', () => {
      const component = this._fileTreeComponent;
      if (component == null) {
        return;
      }
      if (component.isFocused()) {
        // Focus the center.
        const center = atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;
        center.getActivePane().activate();
      } else {
        // Focus the file tree.
        component.focus();
      }
    }), this._registerCommandAndOpener());
  }

  _fixContextMenuHighlight() {
    // Giant hack to fix the context menu highlight
    // For explanation, see https://github.com/atom/atom/pull/13266

    const { showForEvent } = atom.contextMenu;
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      atom.contextMenu.showForEvent = showForEvent;
    });
    // $FlowIgnore: Undocumented API
    atom.contextMenu.showForEvent = function (event) {
      const sub = (_observable || _load_observable()).nextAnimationFrame.repeat(3).last().subscribe(() => {
        showForEvent.call(atom.contextMenu, event);
        disposables.remove(sub);
      });
      disposables.add(sub);
    };

    return disposables;
  }

  consumeTerminal(terminal) {
    const contextMenu = this._contextMenu;
    const terminalMenuSubscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(contextMenu.addItemToShowInSection({
      label: 'New Terminal Here',
      callback() {
        const node = contextMenu.getSingleSelectedNode();

        if (!(node != null)) {
          throw new Error('Invariant violation: "node != null"');
        }

        const cwd = node.isContainer ? node.uri : (_nuclideUri || _load_nuclideUri()).default.dirname(node.uri);
        terminal.open({ cwd });
      },
      shouldDisplay() {
        const node = contextMenu.getSingleSelectedNode();
        return node != null && node.uri != null && node.uri.length > 0;
      }
    }, TERMINAL_CONTEXT_MENU_PRIORITY));
    this._disposables.add(terminalMenuSubscription);

    return terminalMenuSubscription;
  }

  consumeCwdApi(cwdApi) {
    if (this._cwdApiSubscription != null) {
      this._cwdApiSubscription.dispose();
    }
    this._actions.setCwdApi(cwdApi);
    this._cwdApiSubscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._actions.setCwdApi(null));
    return this._cwdApiSubscription;
  }

  consumeRemoteProjectsService(service) {
    this._actions.setRemoteProjectsService(service);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._actions.setRemoteProjectsService(null);
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    return {
      tree: (_FileTreeSelectors || _load_FileTreeSelectors()).serialize(this._store),
      restored: true,
      // Scrap our serialization when docks become available. Technically, we only need to scrap
      // the "restored" value, but this is simpler.
      // TODO(matthewwithanm): After docks have been in Atom stable for a while, we can just change
      //   this to "2"
      version: atom.workspace.getLeftDock == null ? 1 : 2
    };
  }

  consumeWorkingSetsStore(workingSetsStore) {
    this._actions.updateWorkingSetsStore(workingSetsStore);
    this._actions.updateWorkingSet(workingSetsStore.getCurrent());

    const currentSubscription = workingSetsStore.subscribeToCurrent(currentWorkingSet => {
      this._actions.updateWorkingSet(currentWorkingSet);
    });
    this._disposables.add(currentSubscription);

    const rebuildSignals = _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of(null), // None of the subscriptions below will trigger at startup.
    (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace)), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => atom.workspace.observeTextEditors(cb)).flatMap(textEditor => {
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(textEditor.onDidChangePath.bind(textEditor)).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(textEditor.onDidDestroy.bind(textEditor)));
    })).let((0, (_observable || _load_observable()).fastDebounce)(OPEN_FILES_UPDATE_DEBOUNCE_INTERVAL_MS));

    this._disposables.add(rebuildSignals.subscribe(() => {
      const openUris = atom.workspace.getTextEditors().filter(te => te.getPath() != null && te.getPath() !== '').map(te => te.getPath());
      const openFilesWorkingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(openUris);
      this._actions.updateOpenFilesWorkingSet(openFilesWorkingSet);
    }));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._actions.updateWorkingSetsStore(null);
      this._actions.updateWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      this._actions.updateOpenFilesWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      this._disposables.remove(currentSubscription);
      currentSubscription.dispose();
    });
  }

  _currentActiveFilePath() {
    const rawPathStream = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidStopChangingActivePaneItem.bind(atom.workspace)).startWith(null).map(() => {
      const activePaneItem = atom.workspace.getActivePaneItem();
      if (activePaneItem == null || activePaneItem.getPath == null) {
        return null;
      }

      return activePaneItem.getPath();
    });

    return (0, (_observable || _load_observable()).compact)(rawPathStream).distinctUntilChanged();
  }

  provideContextMenuForFileTree() {
    return this._contextMenu;
  }

  provideProjectSelectionManagerForFileTree() {
    return new (_ProjectSelectionManager || _load_ProjectSelectionManager()).default(this._store, this._actions);
  }

  provideFileTreeAdditionalLogFilesProvider() {
    return {
      id: 'nuclide-file-tree',
      getAdditionalLogFiles: expire => {
        const fileTreeState = (_FileTreeSelectors || _load_FileTreeSelectors()).collectDebugState(this._store);
        try {
          return Promise.resolve([{
            title: 'FileTreeState.json',
            data: JSON.stringify(fileTreeState, null, 2)
          }]);
        } catch (e) {
          return Promise.resolve([{
            title: 'FileTreeState.txt',
            data: 'Failed to collect'
          }]);
        }
      }
    };
  }

  _createView() {
    // Currently, we assume that only one will be created.
    this._fileTreeComponent = (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_FileTreeSidebarComponent || _load_FileTreeSidebarComponent()).default, { store: this._store, actions: this._actions }));
    return this._fileTreeComponent;
  }

  _registerCommandAndOpener() {
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_Constants || _load_Constants()).WORKSPACE_VIEW_URI) {
        return this._createView();
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_FileTreeSidebarComponent || _load_FileTreeSidebarComponent()).default), atom.commands.add('atom-workspace', 'tree-view:toggle', () => {
      atom.workspace.toggle((_Constants || _load_Constants()).WORKSPACE_VIEW_URI);
    }));
    (0, (_passesGK || _load_passesGK()).default)('nuclide_open_connect_menu_on_clean_startup').then(openConnectMenu => {
      if (!this._restored) {
        if (!openConnectMenu) {
          // eslint-disable-next-line nuclide-internal/atom-apis
          atom.workspace.open((_Constants || _load_Constants()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
        } else {
          (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(() => atom.project.getPaths().length).pairwise().take(1).subscribe(([oldLength, newLength]) => {
            if (oldLength === 0 && newLength === 1) {
              // eslint-disable-next-line nuclide-internal/atom-apis
              atom.workspace.open((_Constants || _load_Constants()).WORKSPACE_VIEW_URI, {
                searchAllPanes: true
              });
            }
          });
        }
      }
    });
    return disposable;
  }

  deserializeFileTreeSidebarComponent() {
    return this._fileTreeComponent || this._createView();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);