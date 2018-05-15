'use strict';Object.defineProperty(exports, "__esModule", { value: true });














var _react = _interopRequireWildcard(require('react'));var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _DebuggerPaneViewModel;
function _load_DebuggerPaneViewModel() {return _DebuggerPaneViewModel = _interopRequireDefault(require('./DebuggerPaneViewModel'));}var _DebuggerPaneContainerViewModel;
function _load_DebuggerPaneContainerViewModel() {return _DebuggerPaneContainerViewModel = _interopRequireDefault(require('./DebuggerPaneContainerViewModel'));}var _constants;
function _load_constants() {return _constants = require('../constants');}var _createPaneContainer;

function _load_createPaneContainer() {return _createPaneContainer = _interopRequireDefault(require('../../../../../nuclide-commons-atom/create-pane-container'));}var _destroyItemWhere;
function _load_destroyItemWhere() {return _destroyItemWhere = require('../../../../../nuclide-commons-atom/destroyItemWhere');}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _DebuggerControlsView;


function _load_DebuggerControlsView() {return _DebuggerControlsView = _interopRequireDefault(require('./DebuggerControlsView'));}var _ThreadsView;
function _load_ThreadsView() {return _ThreadsView = _interopRequireDefault(require('./ThreadsView'));}var _DebuggerCallstackComponent;
function _load_DebuggerCallstackComponent() {return _DebuggerCallstackComponent = _interopRequireDefault(require('./DebuggerCallstackComponent'));}var _BreakpointsView;
function _load_BreakpointsView() {return _BreakpointsView = _interopRequireDefault(require('./BreakpointsView'));}var _ScopesView;
function _load_ScopesView() {return _ScopesView = _interopRequireDefault(require('./ScopesView'));}var _WatchView;
function _load_WatchView() {return _WatchView = _interopRequireDefault(require('./WatchView'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}







// Configuration that defines a debugger pane. This controls what gets added
// to the workspace when starting debugging.
// Debugger views

































class DebuggerLayoutManager {









  constructor(service, state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._service = service;
    this._previousDebuggerMode = (_constants || _load_constants()).DebuggerMode.STOPPED;
    this._paneHiddenWarningShown = false;
    this._leftPaneContainerModel = null;
    this._rightPaneContainerModel = null;
    this._debuggerVisible = false;
    this._initializeDebuggerPanes();
    this._reshowDebuggerPanes(state);

    this._disposables.add(() => {
      if (this._leftPaneContainerModel != null) {
        this._leftPaneContainerModel.dispose();
      }
      if (this._rightPaneContainerModel != null) {
        this._rightPaneContainerModel.dispose();
      }
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  registerContextMenus() {
    // Add context menus to let the user restore hidden panes.
    this._debuggerPanes.forEach(pane => {
      const command = `debugger:show-window-${pane.title().replace(/ /g, '-')}`;
      this._disposables.add(
      atom.commands.add('atom-workspace', {
        [String(command)]: () => this.showHiddenDebuggerPane(pane.uri) }));



      this._disposables.add(
      atom.contextMenu.add({
        '.debugger-container': [
        {
          label: 'Debugger Views',
          submenu: [
          {
            label: `Show ${pane.title()} window`,
            command,
            shouldDisplay: event => {
              const debuggerPane = this._debuggerPanes.find(
              p => p.uri === pane.uri);

              if (
              debuggerPane != null && (
              debuggerPane.isEnabled == null ||
              debuggerPane.isEnabled()))
              {
                return (
                  debuggerPane.previousLocation != null &&
                  debuggerPane.previousLocation.userHidden);

              }
              return false;
            } }] }] }));






    });
  }

  _overridePaneInitialHeight(
  dockPane,
  newFlexScale,
  desiredHeight)
  {if (!(
    dockPane.element != null)) {throw new Error('Invariant violation: "dockPane.element != null"');}

    if (newFlexScale === 1) {
      // newFlexScale === 1 when the pane is added the first time.
      // $FlowFixMe
      dockPane.element.style['flex-grow'] = '0';
      // $FlowFixMe
      dockPane.element.style['flex-basis'] = 'auto';
      // $FlowFixMe
      dockPane.element.style['overflow-y'] = 'scroll';
      // $FlowFixMe
      dockPane.element.style['min-height'] = String(desiredHeight) + 'px';
    } else {
      // Otherwise, the user must have resized the pane. Remove the override styles
      // and let it behave normally, the user is in control of the layout now.
      // $FlowFixMe
      dockPane.element.style['min-height'] = '0px';
      // $FlowFixMe
      dockPane.element.style['flex-basis'] = '';
    }
  }

  _initializeDebuggerPanes() {
    const debuggerUriBase = 'atom://nuclide/debugger-';
    const getFocusedProcess = () => this._service.viewModel.focusedProcess;

    // This configures the debugger panes. By default, they'll appear below the stepping
    // controls from top to bottom in the order they're defined here. After that, the
    // user is free to move them around.
    this._debuggerPanes = [
    {
      uri: debuggerUriBase + 'controls',
      isLifetimeView: true,
      title: () => 'Debugger',
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      isEnabled: () => true,
      createView: () => _react.createElement((_DebuggerControlsView || _load_DebuggerControlsView()).default, { service: this._service }),
      onPaneResize: (dockPane, newFlexScale) => {
        // If newFlexScale !== 1, that means the user must have resized this pane.
        // Return true to unhook this callback and let the pane resize per Atom's
        // default behavior. The user is now responsible for the pane's height.
        return newFlexScale !== 1;
      } },

    {
      uri: debuggerUriBase + 'callstack',
      isLifetimeView: false,
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      title: () => 'Call Stack',
      isEnabled: () => true,
      createView: () =>
      _react.createElement((_DebuggerCallstackComponent || _load_DebuggerCallstackComponent()).default, { service: this._service }),

      debuggerModeFilter: mode =>
      mode !== (_constants || _load_constants()).DebuggerMode.STOPPED },

    {
      uri: debuggerUriBase + 'breakpoints',
      isLifetimeView: false,
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      title: () => 'Breakpoints',
      isEnabled: () => true,
      createView: () => _react.createElement((_BreakpointsView || _load_BreakpointsView()).default, { service: this._service }) },

    {
      uri: debuggerUriBase + 'scopes',
      isLifetimeView: false,
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      title: () => 'Scopes',
      isEnabled: () => true,
      createView: () => _react.createElement((_ScopesView || _load_ScopesView()).default, { service: this._service }),
      debuggerModeFilter: mode =>
      mode !== (_constants || _load_constants()).DebuggerMode.STOPPED },

    {
      uri: debuggerUriBase + 'watch-expressions',
      isLifetimeView: false,
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      title: () => 'Watch Expressions',
      isEnabled: () => true,
      createView: () => _react.createElement((_WatchView || _load_WatchView()).default, { service: this._service }) },

    {
      uri: debuggerUriBase + 'threads',
      isLifetimeView: false,
      defaultLocation: (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION,
      title: () =>
      getFocusedProcess() == null ?
      'Threads' :
      (0, (_nullthrows || _load_nullthrows()).default)(getFocusedProcess()).configuration.properties.
      threadsComponentTitle,
      isEnabled: () =>
      getFocusedProcess() == null ?
      false :
      (0, (_nullthrows || _load_nullthrows()).default)(getFocusedProcess()).configuration.capabilities.
      threads,
      createView: () => _react.createElement((_ThreadsView || _load_ThreadsView()).default, { service: this._service }),
      debuggerModeFilter: mode =>
      mode !== (_constants || _load_constants()).DebuggerMode.STOPPED }];



    this._restoreDebuggerPaneLocations();
  }

  _reshowDebuggerPanes(state) {
    if (state && state.showDebugger) {
      this.showDebuggerViews();
      this._getWorkspaceDocks().forEach((dock, index) => {
        if (
        dock.dock.isVisible != null &&
        state.workspaceDocksVisibility != null &&
        !state.workspaceDocksVisibility[index] &&
        dock.dock.isVisible() &&
        dock.dock.hide != null)
        {
          dock.dock.hide();
        }
      });

      // Hiding the docks might have changed the visibility of the debugger
      // if the only docks containing debugger panes are now hidden.
      this._updateDebuggerVisibility();
    }
  }

  _updateDebuggerVisibility() {
    this._debuggerVisible = false;

    // See if any visible docks contain a pane that contains a debugger pane.
    this._getWorkspaceDocks().forEach(dock => {
      if (dock.dock.isVisible != null && dock.dock.isVisible()) {
        dock.dock.getPanes().forEach(pane => {
          if (
          pane.
          getItems().
          find(
          item =>
          item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default ||
          item instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default) !=
          null)
          {
            this._debuggerVisible = true;
          }
        });
      }
    });
  }

  showHiddenDebuggerPane(uri) {
    const pane = this._debuggerPanes.find(p => p.uri === uri);
    if (pane != null && pane.previousLocation != null) {
      pane.previousLocation.userHidden = false;
    }

    this.showDebuggerViews();
  }

  getModelForDebuggerUri(uri) {
    const config = this._debuggerPanes.find(pane => pane.uri === uri);
    if (config != null) {
      return new (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default(config, config.isLifetimeView, pane =>
      this._paneDestroyed(pane));

    }

    return null;
  }

  _getWorkspaceDocks()



  {
    const docks = new Array(4);if (!(

    atom.workspace.getLeftDock != null)) {throw new Error('Invariant violation: "atom.workspace.getLeftDock != null"');}
    docks[0] = {
      name: 'left',
      dock: atom.workspace.getLeftDock(),
      orientation: 'vertical' };if (!(


    atom.workspace.getBottomDock != null)) {throw new Error('Invariant violation: "atom.workspace.getBottomDock != null"');}
    docks[1] = {
      name: 'bottom',
      dock: atom.workspace.getBottomDock(),
      orientation: 'horizontal' };if (!(


    atom.workspace.getCenter != null)) {throw new Error('Invariant violation: "atom.workspace.getCenter != null"');}
    docks[2] = {
      name: 'center',
      dock: atom.workspace.getCenter(),
      orientation: 'horizontal' };if (!(


    atom.workspace.getRightDock != null)) {throw new Error('Invariant violation: "atom.workspace.getRightDock != null"');}
    docks[3] = {
      name: 'right',
      dock: atom.workspace.getRightDock(),
      orientation: 'vertical' };


    return docks;
  }

  _isDockEmpty(dock) {
    const panes = dock.getPanes();

    // A dock is empty for our purposes if it has nothing visible in it. If a dock
    // with no items is left open, Atom implicitly adds a single pane with no items
    // in it, so check for no panes, or a single pane with no items.
    return (
      panes.length === 0 ||
      panes.length === 1 && panes[0].getItems().length === 0);

  }

  _appendItemToDock(
  paneConfig,
  dock,
  item,
  debuggerItemsPerDock)
  {
    const panes = dock.getPanes();if (!(
    panes.length >= 1)) {throw new Error('Invariant violation: "panes.length >= 1"');}

    const dockPane = panes[panes.length - 1];
    if (this._isDockEmpty(dock)) {
      dockPane.addItem(item);
    } else {
      let dockConfig = this._getWorkspaceDocks().find(d => d.dock === dock);
      if (dockConfig == null) {
        // This item is being added to a nested PaneContainer rather than
        // directly to a dock. This is only done for vertical layouts.
        dockConfig = { orientation: 'vertical' };
      }

      if (dockConfig.orientation === 'horizontal') {
        // Add the item as a new tab in the existing pane to the right of the current active pane for the dock.
        dockPane.addItem(item);
        try {
          dockPane.activateItem(item);
        } catch (e) {
          // During testing, I saw some cases where Atom threw trying to activate an item
          // that was still in progress of being added. This was tested on a Beta release
          // and may indicate a temporary bug. However, there is no reason to throw here
          // and stop laying out the debugger if an item could not be set as active.
        }
      } else {
        // When adding to a vertical dock that is not empty, but contains no debugger
        // items, add the debugger pane container as a new tab item. Otherwise, append
        // downward.
        if (debuggerItemsPerDock.get(dock) == null) {
          dockPane.addItem(item);
          dockPane.activateItem(item);
        } else {
          dockPane.splitDown({
            items: [item] });

        }
      }
    }

    // Keep track of which dock(s) we've appended debugger panes into. This
    // allows us to quickly check if the dock needs to be split to separate
    // debugger panes and pre-existing panes that have nothing to do with
    // the debugger.
    if (debuggerItemsPerDock.get(dock) == null) {
      debuggerItemsPerDock.set(dock, 1);
    } else {
      const itemCount = debuggerItemsPerDock.get(dock);
      debuggerItemsPerDock.set(dock, itemCount + 1);
    }

    if (dock.isVisible != null && dock.show != null && !dock.isVisible()) {
      dock.show();
    }

    // If the debugger pane config has a custom layout callback, hook it up now.
    if (paneConfig != null && paneConfig.onPaneResize != null) {
      const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      disposables.add(dockPane.onWillDestroy(() => disposables.dispose()));
      disposables.add(
      dockPane.onDidChangeFlexScale(newFlexScale => {if (!(
        paneConfig.onPaneResize != null)) {throw new Error('Invariant violation: "paneConfig.onPaneResize != null"');}
        if (paneConfig.onPaneResize(dockPane, newFlexScale)) {
          // The callback has requested to be unregistered.
          disposables.dispose();
        }
      }));

    }
  }

  resetLayout() {
    // Remove all debugger panes from the UI.
    this.hideDebuggerViews(false);

    // Forget all their previous locations.
    for (const debuggerPane of this._debuggerPanes) {
      debuggerPane.previousLocation = null;
      const key = this._getPaneStorageKey(debuggerPane.uri);
      localStorage.setItem(key, '');
    }

    // Forget all previous dock sizes;
    for (const dockInfo of this._getWorkspaceDocks()) {
      const { name } = dockInfo;
      const key = this._getPaneStorageKey('dock-size' + name);
      localStorage.removeItem(key);
    }

    // Pop the debugger open with the default layout.
    this._debuggerPanes = [];
    this._paneHiddenWarningShown = false;
    this._initializeDebuggerPanes();
    this.showDebuggerViews();
  }

  _getPaneStorageKey(uri) {
    return 'debugger-pane-location-' + uri;
  }

  _deserializeSavedLocation(savedItem) {
    try {
      const obj = JSON.parse(savedItem);
      if (
      obj != null &&
      obj.dock != null &&
      obj.layoutIndex != null &&
      obj.userHidden != null)
      {
        return obj;
      }
    } catch (e) {}

    return null;
  }

  _restoreDebuggerPaneLocations() {
    // See if there are saved previous locations for the debugger panes.
    for (const debuggerPane of this._debuggerPanes) {
      const savedItem = localStorage.getItem(
      this._getPaneStorageKey(debuggerPane.uri));

      if (savedItem != null) {
        debuggerPane.previousLocation = this._deserializeSavedLocation(
        savedItem);

      }
    }
  }

  _saveDebuggerPaneLocations() {
    for (const dockInfo of this._getWorkspaceDocks()) {
      const { name, dock } = dockInfo;
      const panes = dock.getPanes();
      let layoutIndex = 0;
      let dockContainsDebuggerItem = false;
      for (const pane of panes) {
        for (const item of pane.getItems()) {
          const paneItems = [];
          if (item instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default) {
            paneItems.push(...item.getAllItems());
          } else {
            paneItems.push(item);
          }

          for (const itemToSave of paneItems) {
            if (itemToSave instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default) {
              const location = {
                dock: name,
                layoutIndex,
                userHidden: false };


              dockContainsDebuggerItem = true;
              itemToSave.getConfig().previousLocation = location;
              layoutIndex++;
            }
          }
        }
      }

      const key = this._getPaneStorageKey('dock-size' + name);
      if (dockContainsDebuggerItem && dock.state != null) {
        // Save the size of a dock only if it contains a debugger item.
        const sizeInfo = JSON.stringify(dock.state.size);
        localStorage.setItem(key, sizeInfo);
      } else {
        localStorage.removeItem(key);
      }
    }

    // Serialize to storage.
    for (const debuggerPane of this._debuggerPanes) {
      const loc = JSON.stringify(debuggerPane.previousLocation);
      const key = this._getPaneStorageKey(debuggerPane.uri);
      localStorage.setItem(key, loc);
    }
  }

  _shouldDestroyPaneItem(mode, item) {
    if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default) {
      const config = item.getConfig();
      if (
      config.debuggerModeFilter != null &&
      !config.debuggerModeFilter(mode))
      {
        item.setRemovedFromLayout(true);
        return true;
      }
    }
    return false;
  }

  debuggerModeChanged() {
    const mode = this._service.getDebuggerMode();

    // Most panes disappear when the debugger is stopped, only keep
    // the ones that should still be shown.
    if (
    mode === (_constants || _load_constants()).DebuggerMode.STOPPING &&
    this._previousDebuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPED)
    {
      this._saveDebuggerPaneLocations();
    } else if (mode === (_constants || _load_constants()).DebuggerMode.STOPPED) {
      (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => {
        if (item instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default) {
          // Forward the destruction logic to the contianer.
          item.destroyWhere(innerItem =>
          this._shouldDestroyPaneItem(mode, innerItem));


          this._destroyContainerIfEmpty(item);
          return false;
        }

        return this._shouldDestroyPaneItem(mode, item);
      });
    }

    this._previousDebuggerMode = mode;
  }

  _countPanesForTargetDock(dockName, defaultDockName) {
    const mode = this._service.getDebuggerMode();
    return this._debuggerPanes.
    filter(
    // Filter out any panes that the user has hidden or that aren't visible
    // in the current debug mode.
    debuggerPane =>
    (debuggerPane.previousLocation == null ||
    !debuggerPane.previousLocation.userHidden) && (
    debuggerPane.debuggerModeFilter == null ||
    debuggerPane.debuggerModeFilter(mode))).

    map(debuggerPane => {
      // Map each debugger pane to the name of the dock it will belong to.
      if (debuggerPane.previousLocation != null) {
        const previousDock = this._getWorkspaceDocks().find(
        d =>
        debuggerPane.previousLocation != null &&
        d.name === debuggerPane.previousLocation.dock);

        if (previousDock != null) {
          return previousDock.name;
        }
      }
      return defaultDockName;
    }).
    filter(targetDockName => targetDockName === dockName).length;
  }

  _getSavedDebuggerPaneSize(dock)



  {
    const key = this._getPaneStorageKey('dock-size' + dock.name);
    const savedItem = localStorage.getItem(key);
    if (savedItem != null) {
      const sizeInfo = JSON.parse(savedItem);
      if (!Number.isNaN(sizeInfo)) {
        return sizeInfo;
      }
    }

    return null;
  }

  showDebuggerViews() {
    // Hide any debugger panes other than the controls so we have a known
    // starting point for preparing the layout.
    this.hideDebuggerViews(true);

    const addedItemsByDock = new Map();
    const defaultDock = this._getWorkspaceDocks().find(
    d => d.name === (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION);if (!(

    defaultDock != null)) {throw new Error('Invariant violation: "defaultDock != null"');}

    const leftDock = this._getWorkspaceDocks().find(d => d.name === 'left');if (!(
    leftDock != null)) {throw new Error('Invariant violation: "leftDock != null"');}

    let leftPaneContainer = null;
    if (this._countPanesForTargetDock(leftDock.name, defaultDock.name) > 0) {
      leftPaneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
      const size = this._getSavedDebuggerPaneSize(leftDock);
      this._leftPaneContainerModel = this._addPaneContainerToWorkspace(
      leftPaneContainer,
      leftDock.dock,
      addedItemsByDock,
      size);

    }

    const rightDock = this._getWorkspaceDocks().find(d => d.name === 'right');if (!(
    rightDock != null)) {throw new Error('Invariant violation: "rightDock != null"');}

    let rightPaneContainer = null;
    if (this._countPanesForTargetDock(rightDock.name, defaultDock.name) > 0) {
      rightPaneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
      const size = this._getSavedDebuggerPaneSize(rightDock);
      this._rightPaneContainerModel = this._addPaneContainerToWorkspace(
      rightPaneContainer,
      rightDock.dock,
      addedItemsByDock,
      size);

    }

    // Lay out the remaining debugger panes according to their configurations.
    // Sort the debugger panes by the index at which they appeared the last
    // time they were positioned, so we maintain the relative ordering of
    // debugger panes within the same dock.
    const mode = this._service.getDebuggerMode();
    this._debuggerPanes.
    slice().
    sort((a, b) => {
      const aPos =
      a.previousLocation == null ? 0 : a.previousLocation.layoutIndex;
      const bPos =
      b.previousLocation == null ? 0 : b.previousLocation.layoutIndex;
      return aPos - bPos;
    }).
    filter(
    debuggerPane =>
    (debuggerPane.isEnabled == null || debuggerPane.isEnabled()) && (
    debuggerPane.previousLocation == null ||
    !debuggerPane.previousLocation.userHidden)).

    forEach(debuggerPane => {
      let targetDock = defaultDock;

      // If this pane had a previous location, restore to the previous dock.
      const loc =
      debuggerPane.previousLocation != null ?
      debuggerPane.previousLocation.dock :
      debuggerPane.defaultLocation;
      const previousDock = this._getWorkspaceDocks().find(
      d => d.name === loc);

      if (previousDock != null) {
        targetDock = previousDock;
      }

      // Render to a nested pane container for the two vertical docks
      // rather than adding the item directly to the dock itself.
      let targetContainer = targetDock.dock;
      if (targetDock.name === 'left') {
        targetContainer = leftPaneContainer;
      } else if (targetDock.name === 'right') {
        targetContainer = rightPaneContainer;
      }

      if (
      debuggerPane.debuggerModeFilter == null ||
      debuggerPane.debuggerModeFilter(mode))
      {if (!(
        targetContainer != null)) {throw new Error('Invariant violation: "targetContainer != null"');}
        const size = this._getSavedDebuggerPaneSize(targetDock);
        this._appendItemToDock(
        debuggerPane,
        targetContainer,
        new (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default(
        debuggerPane,
        debuggerPane.isLifetimeView,
        pane => this._paneDestroyed(pane),
        size),

        addedItemsByDock);

      }
    });

    this._debuggerVisible = true;
  }

  _addPaneContainerToWorkspace(
  container,
  dock,
  addedItemsByDock,
  dockSize)
  {
    const containerModel = new (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default(
    container,
    dockSize);

    this._appendItemToDock(null, dock, containerModel, addedItemsByDock);

    return containerModel;
  }

  _paneDestroyed(pane) {
    if (pane.isLifetimeView) {
      // Lifetime views are not hidden and remembered like the unimportant views.
      // This view being destroyed means the debugger is exiting completely, and
      // this view is never remembered as "hidden by the user" because it's reqiured
      // for running the debugger.
      const mode = this._service.getDebuggerMode();
      if (mode === (_constants || _load_constants()).DebuggerMode.RUNNING || mode === (_constants || _load_constants()).DebuggerMode.PAUSED) {
        this._saveDebuggerPaneLocations();
      }

      this.hideDebuggerViews(false);
      this._service.stopProcess();
      return;
    }

    // Views can be selectively hidden by the user while the debugger is
    // running and that preference should be remembered.
    const config = this._debuggerPanes.find(p => p.uri === pane.uri);if (!(
    config != null)) {throw new Error('Invariant violation: "config != null"');}

    if (config.previousLocation == null) {
      config.previousLocation = {
        dock: '',
        layoutIndex: 0,
        userHidden: false };

    }

    if (config.isEnabled == null || config.isEnabled()) {
      const mode = this._service.getDebuggerMode();
      if (
      config.debuggerModeFilter == null ||
      config.debuggerModeFilter(mode))
      {if (!(
        config.previousLocation != null)) {throw new Error('Invariant violation: "config.previousLocation != null"');}
        config.previousLocation.userHidden = true;

        // Show a notification telling the user how to get the pane back
        // only once per session.
        if (!this._paneHiddenWarningShown) {
          this._paneHiddenWarningShown = true;

          atom.notifications.addInfo(
          `${config.title()} has been hidden. Right click any Debugger pane to bring it back.`);

        }
      }
    }

    // If hiding this view left an empty debugger pane container, destroy the container.
    this._destroyContainerIfEmpty(this._leftPaneContainerModel);
    this._destroyContainerIfEmpty(this._rightPaneContainerModel);
  }

  _destroyContainerIfEmpty(container) {
    if (container != null && container.getAllItems().length === 0) {
      const parent = container.getParentPane();
      if (parent != null) {
        parent.removeItem(container);
        container.destroy();
      }
    }
  }

  hideDebuggerViews(performingLayout) {
    // Docks do not toggle closed automatically when we remove all their items.
    // They can contain things other than the debugger items though, and could
    // have been left open and empty by the user. Toggle closed any docks that
    // end up empty only as a result of closing the debugger.
    const docks = this._getWorkspaceDocks();
    const previouslyEmpty = docks.map(dock => this._isDockEmpty(dock.dock));

    // Find and destroy all debugger items, and the panes that contained them.
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().forEach(item => {
        if (
        item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default ||
        item instanceof (_DebuggerPaneContainerViewModel || _load_DebuggerPaneContainerViewModel()).default)
        {
          // Remove the view model.
          item.setRemovedFromLayout(true);
          pane.destroyItem(item);

          // If removing the model left an empty pane, remove the pane.
          if (pane.getItems().length === 0) {
            pane.destroy();
          }
        }
      });
    });

    // If any docks became empty as a result of closing those panes, hide the dock.
    if (!performingLayout) {
      docks.
      map(dock => this._isDockEmpty(dock.dock)).
      forEach((empty, index) => {
        if (empty && !previouslyEmpty[index]) {
          docks[index].dock.hide();
        }
      });
    }

    if (this._leftPaneContainerModel != null) {
      this._leftPaneContainerModel.setRemovedFromLayout(true);if (!(
      this._leftPaneContainerModel != null)) {throw new Error('Invariant violation: "this._leftPaneContainerModel != null"');}
      this._leftPaneContainerModel.dispose();
      this._leftPaneContainerModel = null;
    }

    if (this._rightPaneContainerModel != null) {
      this._rightPaneContainerModel.setRemovedFromLayout(true);if (!(
      this._rightPaneContainerModel != null)) {throw new Error('Invariant violation: "this._rightPaneContainerModel != null"');}
      this._rightPaneContainerModel.dispose();
      this._rightPaneContainerModel = null;
    }

    this._debuggerVisible = false;
  }

  isDebuggerVisible() {
    return this._debuggerVisible;
  }

  getWorkspaceDocksVisibility() {
    this._saveDebuggerPaneLocations();
    return this._getWorkspaceDocks().map(dock => {
      return dock.dock.isVisible != null && dock.dock.isVisible();
    });
  }}exports.default = DebuggerLayoutManager; /**
                                              * Copyright (c) 2017-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the BSD-style license found in the
                                              * LICENSE file in the root directory of this source tree. An additional grant
                                              * of patent rights can be found in the PATENTS file in the same directory.
                                              *
                                              * 
                                              * @format
                                              */ /* global localStorage */