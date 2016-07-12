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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.provideNuclideSideBar = provideNuclideSideBar;
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _SideBarPanelComponent2;

function _SideBarPanelComponent() {
  return _SideBarPanelComponent2 = _interopRequireDefault(require('./SideBarPanelComponent'));
}

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

var disposables = undefined;
var item = undefined;
var logger = undefined;
var panel = undefined;
var panelComponent = undefined;
var state = undefined;

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
  var mergedState = _extends({}, state, nextState);
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
  var viewId = undefined;
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

  var child = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(panelComponent.getChildComponent());
  if (child.contains(document.activeElement)) {
    atom.workspace.getActivePane().activate();
  }
}

function focusPanel() {
  if (panelComponent == null) {
    return;
  }

  var child = panelComponent.getChildComponent();
  if (!(_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(child).contains(document.activeElement)) {
    (0, (_assert2 || _assert()).default)(child instanceof (_SideBarPanelComponent2 || _SideBarPanelComponent()).default);
    child.focus();
  }
}

function renderPanelSync(renderState, onDidRender) {
  var activeViewInstance = getActiveViewInstance(renderState);
  var hidden = activeViewInstance == null || renderState.hidden;
  var activeViewId = activeViewInstance == null ? null : activeViewInstance.view.viewId;

  var viewMenuItems = Array.from(renderState.views.values()).map(function (viewInstance) {
    return {
      label: viewInstance.view.title,
      value: viewInstance.view.viewId
    };
  });

  var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(
    (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
    {
      dock: 'left',
      // Keep the side-bar hidden when there is no active view instance.
      hidden: hidden,
      initialLength: renderState.initialLength,
      noScroll: true },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_SideBarPanelComponent2 || _SideBarPanelComponent()).default,
      {
        menuItems: viewMenuItems,
        onSelectedViewMenuItemChange: function (value) {
          toggleView(value, { display: true });
        },
        selectedViewMenuItemValue: activeViewId },
      activeViewInstance == null ? (_reactForAtom2 || _reactForAtom()).React.createElement('div', null) : (_reactForAtom2 || _reactForAtom()).React.createElement(activeViewInstance.view.getComponent(), { hidden: hidden })
    )
  ), item, onDidRender);
  (0, (_assert2 || _assert()).default)(component instanceof (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent);
  panelComponent = component;
}
var renderPanel = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(renderPanelSync, 50);

function toggleView(viewId, options) {
  // If `display` is specified in the event details, use it as the `hidden` value rather than
  // toggle. This enables consumers to force hide/show without first asking for the visibility
  // state.
  var forceHidden = undefined;
  if (options != null) {
    forceHidden = !options.display;
  }

  var nextState = undefined;
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
  var panelBecameVisible = nextState.hidden === false && state.hidden === true;
  var viewBecameVisible = !nextState.hidden && nextState.activeViewId != null && nextState.activeViewId !== state.activeViewId;
  var didShow = panelBecameVisible || viewBecameVisible;

  if (didShow) {
    var _onDidShow = function _onDidShow() {
      var activeViewInstance = getActiveViewInstance(state);
      if (activeViewInstance != null) {
        focusPanel();
        activeViewInstance.view.onDidShow();
      }
    };
    setState(nextState, _onDidShow, true /* render immediately; user expects fast UI response */);
  } else {
      setState(nextState, blurPanel, true /* render immediately; user expects fast UI response */);
    }
}

var Service = {
  registerView: function registerView(view) {
    if (state.views.has(view.viewId)) {
      logger.warn('A view with ID \'' + view.viewId + '\' is already registered.');
      return;
    }

    var nextState = {};

    // Track the last registered view ID in case no user selection is ever made.
    nextState.autoViewId = view.viewId;

    var commandDisposable = atom.commands.add('atom-workspace', view.toggleCommand, function (event) {
      // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
      toggleView(view.viewId, event.detail);
    });
    disposables.add(commandDisposable);

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.set(view.viewId, { commandDisposable: commandDisposable, view: view });
    nextState.views = state.views;

    // If this is the view that was last serialized, render synchronously and immediately so the
    // side-bar appears quickly on start up.
    setState(nextState, null, state.activeViewId === view.viewId);
  },
  destroyView: function destroyView(viewId) {
    var viewInstance = state.views.get(viewId);

    if (viewInstance == null) {
      logger.warn('No view with ID \'' + viewId + '\' is registered. Nothing to remove.');
      return;
    }

    var commandDisposable = viewInstance.commandDisposable;
    disposables.remove(commandDisposable);
    commandDisposable.dispose();

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.delete(viewId);
    var nextState = { views: state.views };

    // If this was the active view, choose the first remaining view (in insertion order) or, if
    // there are no remaining views, choose nothing (`undefined`).
    if (viewId === state.autoViewId) {
      nextState = _extends({}, nextState, {
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
  logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)('nuclide-side-bar');
  disposables = new (_atom2 || _atom()).CompositeDisposable();

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle', function (event) {
    // Pass the already-active view ID to simply toggle the side bar's visibility.
    // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
    toggleView(state.activeViewId, event.detail);
  }));

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle-focus', function () {
    if (panelComponent == null) {
      return;
    }

    var child = panelComponent.getChildComponent();
    if ((_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(child).contains(document.activeElement)) {
      atom.workspace.getActivePane().activate();
    } else {
      (0, (_assert2 || _assert()).default)(child instanceof (_SideBarPanelComponent2 || _SideBarPanelComponent()).default);
      child.focus();
    }
  }));

  item = document.createElement('div');
  item.style.display = 'flex';
  item.style.height = 'inherit';
  panel = atom.workspace.addLeftPanel({ item: item });
  var nextState = _extends({}, getDefaultState(), deserializedState);

  if (nextState.activeViewId == null) {
    // Special case the file-tree so it renders synchronously if `null` was previously serialized.
    nextState.activeViewId = 'nuclide-file-tree';
  }

  // Initializes `panelComponent` so it does not need to be considered nullable.
  setState(nextState);
}

function deactivate() {
  (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
  // Contains the `commandDisposable` Objects for all currently-registered views.
  disposables.dispose();
  panel.destroy();
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
  var isVisible = function isVisible() {
    return !state.hidden;
  };
  return {
    name: 'nuclide-side-bar',
    isVisible: isVisible,
    toggle: function toggle() {
      toggleView(state.activeViewId);
    }
  };
}

// TODO(ssorallen): Should be polymorphic `Class<React.Component>`