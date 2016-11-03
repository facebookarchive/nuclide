'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideNuclideSideBar = provideNuclideSideBar;
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

var _atom = require('atom');

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _PanelComponent;

function _load_PanelComponent() {
  return _PanelComponent = require('../../nuclide-ui/PanelComponent');
}

var _reactForAtom = require('react-for-atom');

var _SideBarPanelComponent;

function _load_SideBarPanelComponent() {
  return _SideBarPanelComponent = _interopRequireDefault(require('./SideBarPanelComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Type consumed by the side bar service's `registerView` function.
 *
 * - `getComponent`: `() => (typeof React.Component)` - When the registered view is shown, a React
 *   element of the type returned from `getComponent` is mounted into the side bar. React lifecycle
 *   methods may be used normally. When another view is shown, the active view's React element is
 *   unmounted.
 * - `title`: `string` - Title to display in the side-bar's dropdown that enables toggling between
 *   registered views
 * - `toggleCommand`: `string` - Atom command name for which the side bar will listen on the
 *   `atom-workspace` element. To show and hide the registered view inside the side bar, dispatch
 *   the named event via `atom.commands.dispatch(atom.views.get(atom.workspace), 'command-name')`.
 *   By default the command will toggle the view's visibility. Pass a detail object to the dispatch
 *   command to force hide or show, for example
 *   `atom.commands.dispatch(atom.views.get(atom.workspace), 'command-name', {display: true})` will
 *   show the view. If the view is already visible in the side bar, nothing will happen.
 * - `viewId`: `string` - A unique identifier for the view that can be used to later destroy the
 *   view. If a view with a given ID already exists in the side bar, attempting to register another
 *   view with the same ID has no effect.
 */
let disposables;
let logger;
let panel;
let panelComponent;
let state;

function getDefaultState() {
  return {
    activeViewId: null,
    autoViewId: null,
    hidden: false,
    initialLength: 240,
    views: new Map()
  };
}

function setState(nextState, onDidRender, immediate) {
  const mergedState = Object.assign({}, state, nextState);
  state = mergedState;

  // Calling this with `immediate === false` followed by `immediate === true` will lead to both
  // calls executing because the debounced version is not cancelable. This is okay though because
  // the state will be the same, and the render will be cheap.
  // TODO(ssorallen): Use a cancelable form of `debounce`
  if (immediate) {
    renderPanelSync(state, onDidRender);
  } else {
    renderPanel(state, onDidRender);
  }
}

function getActiveViewInstance(activeState) {
  let viewId;
  if (activeState.activeViewId != null && activeState.views.has(activeState.activeViewId)) {
    viewId = activeState.activeViewId;
  } else if (activeState.autoViewId != null && activeState.views.has(activeState.autoViewId)) {
    viewId = activeState.autoViewId;
  }

  if (viewId != null) {
    return activeState.views.get(viewId);
  }
}

function blurPanel() {
  if (panelComponent == null) {
    return;
  }

  const child = _reactForAtom.ReactDOM.findDOMNode(panelComponent.getChildComponent());
  if (child.contains(document.activeElement)) {
    atom.workspace.getActivePane().activate();
  }
}

function focusPanel() {
  if (panelComponent == null) {
    return;
  }

  const child = panelComponent.getChildComponent();
  if (!_reactForAtom.ReactDOM.findDOMNode(child).contains(document.activeElement)) {
    if (!(child instanceof (_SideBarPanelComponent || _load_SideBarPanelComponent()).default)) {
      throw new Error('Invariant violation: "child instanceof SideBarPanelComponent"');
    }

    child.focus();
  }
}

function renderPanelSync(renderState, onDidRender) {
  // This function is debounced, so it may run after the package has been deactivated.
  if (panel == null) {
    return;
  }

  const activeViewInstance = getActiveViewInstance(renderState);
  const hidden = activeViewInstance == null || renderState.hidden;
  const activeViewId = activeViewInstance == null ? null : activeViewInstance.view.viewId;

  const viewMenuItems = Array.from(renderState.views.values()).map(viewInstance => ({
    label: viewInstance.view.title,
    value: viewInstance.view.viewId
  }));

  const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
    (_PanelComponent || _load_PanelComponent()).PanelComponent,
    {
      dock: 'left'
      // Keep the side-bar hidden when there is no active view instance.
      , hidden: hidden,
      initialLength: renderState.initialLength,
      noScroll: true },
    _reactForAtom.React.createElement(
      (_SideBarPanelComponent || _load_SideBarPanelComponent()).default,
      {
        menuItems: viewMenuItems,
        onSelectedViewMenuItemChange: value => {
          toggleView(value, { display: true });
        },
        selectedViewMenuItemValue: activeViewId },
      activeViewInstance == null ? _reactForAtom.React.createElement('div', null) : _reactForAtom.React.createElement(activeViewInstance.view.getComponent(), { hidden: hidden })
    )
  ), panel.getItem(), onDidRender);

  if (!(component instanceof (_PanelComponent || _load_PanelComponent()).PanelComponent)) {
    throw new Error('Invariant violation: "component instanceof PanelComponent"');
  }

  panelComponent = component;
}
const renderPanel = (0, (_debounce || _load_debounce()).default)(renderPanelSync, 50);

function toggleView(viewId, options) {
  // If `display` is specified in the event details, use it as the `hidden` value rather than
  // toggle. This enables consumers to force hide/show without first asking for the visibility
  // state.
  let forceHidden;
  if (options != null) {
    forceHidden = !options.display;
  }

  let nextState;
  if (viewId === state.activeViewId) {
    // If this view is already active, just toggle the visibility of the side bar or set it to the
    // desired `display`.
    nextState = {
      hidden: forceHidden == null ? !state.hidden : forceHidden
    };
  } else {
    // If this is not already the active view, switch to it and ensure the side bar is visible or is
    // the specified `display` value.
    nextState = {
      activeViewId: viewId,
      hidden: forceHidden == null ? false : forceHidden
    };
  }

  // If the side bar became visible or if it was already visible and the active view changed, call
  // the next active view's `onDidShow` so it can respond to becoming visible.
  const panelBecameVisible = nextState.hidden === false && state.hidden === true;
  const viewBecameVisible = !nextState.hidden && nextState.activeViewId != null && nextState.activeViewId !== state.activeViewId;
  const didShow = panelBecameVisible || viewBecameVisible;

  if (didShow) {
    const onDidShow = function () {
      const activeViewInstance = getActiveViewInstance(state);
      if (activeViewInstance != null) {
        focusPanel();
        activeViewInstance.view.onDidShow();
      }
    };
    setState(nextState, onDidShow, true /* render immediately; user expects fast UI response */);
  } else {
    setState(nextState, blurPanel, true /* render immediately; user expects fast UI response */);
  }
}

const Service = {
  registerView: function (view) {
    if (state.views.has(view.viewId)) {
      logger.warn(`A view with ID '${ view.viewId }' is already registered.`);
      return;
    }

    const nextState = {};

    // Track the last registered view ID in case no user selection is ever made.
    nextState.autoViewId = view.viewId;

    const commandDisposable = atom.commands.add('atom-workspace', view.toggleCommand, event => {
      // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
      toggleView(view.viewId, event.detail);
    });

    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    disposables.add(commandDisposable);

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.set(view.viewId, { commandDisposable: commandDisposable, view: view });
    nextState.views = state.views;

    // If this is the view that was last serialized, render synchronously and immediately so the
    // side-bar appears quickly on start up.
    setState(nextState, null, state.activeViewId === view.viewId);
  },
  destroyView: function (viewId) {
    const viewInstance = state.views.get(viewId);

    if (viewInstance == null) {
      logger.warn(`No view with ID '${ viewId }' is registered. Nothing to remove.`);
      return;
    }

    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    const commandDisposable = viewInstance.commandDisposable;
    disposables.remove(commandDisposable);
    commandDisposable.dispose();

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.delete(viewId);
    let nextState = { views: state.views };

    // If this was the active view, choose the first remaining view (in insertion order) or, if
    // there are no remaining views, choose nothing (`undefined`).
    if (viewId === state.autoViewId) {
      nextState = Object.assign({}, nextState, {
        autoViewId: state.views.keys().next().value
      });
    }

    setState(nextState);
  }
};

/**
 * The type provided to service consumers.
 */
function provideNuclideSideBar() {
  return Service;
}

function activate(deserializedState) {
  logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)('nuclide-side-bar');
  disposables = new _atom.CompositeDisposable();

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle', event => {
    // Pass the already-active view ID to simply toggle the side bar's visibility.
    // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
    toggleView(state.activeViewId, event.detail);
  }));

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle-focus', () => {
    if (panelComponent == null) {
      return;
    }

    const child = panelComponent.getChildComponent();
    if (_reactForAtom.ReactDOM.findDOMNode(child).contains(document.activeElement)) {
      atom.workspace.getActivePane().activate();
    } else {
      if (!(child instanceof (_SideBarPanelComponent || _load_SideBarPanelComponent()).default)) {
        throw new Error('Invariant violation: "child instanceof SideBarPanelComponent"');
      }

      child.focus();
    }
  }));

  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.height = 'inherit';
  panel = atom.workspace.addLeftPanel({ item: item });
  const nextState = Object.assign({}, getDefaultState(), deserializedState);

  if (nextState.activeViewId == null) {
    // Special case the file-tree so it renders synchronously if `null` was previously serialized.
    nextState.activeViewId = 'nuclide-file-tree';
  }

  // Initializes `panelComponent` so it does not need to be considered nullable.
  setState(nextState);
}

function deactivate() {
  if (panel != null) {
    _reactForAtom.ReactDOM.unmountComponentAtNode(panel.getItem());
    panel.destroy();
    panel = null;
  }
  // Contains the `commandDisposable` Objects for all currently-registered views.
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  panelComponent = null;
}

function serialize() {
  return {
    activeViewId: state.activeViewId,
    hidden: state.hidden,
    // If no render has yet happened, use the last stored length in the state (likely the default).
    initialLength: panelComponent == null ? state.initialLength : panelComponent.getLength()
  };
}

function getDistractionFreeModeProvider() {
  const isVisible = () => !state.hidden;
  return {
    name: 'nuclide-side-bar',
    isVisible: isVisible,
    toggle: function () {
      toggleView(state.activeViewId);
    }
  };
}