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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('../../nuclide-logging');

var getLogger = _require2.getLogger;

var _require3 = require('../../nuclide-ui/lib/PanelComponent');

var PanelComponent = _require3.PanelComponent;

var _require4 = require('react-for-atom');

var React = _require4.React;
var ReactDOM = _require4.ReactDOM;

/**
 * Type consumed by the side bar service's `registerView` function.
 *
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
 * - `getComponent`: `() => (typeof React.Component)` - When the registered view is shown, a React
 *   element of the type returned from `getComponent` is mounted into the side bar. React lifecycle
 *   methods may be used normally. When another view is shown, the active view's React element is
 *   unmounted.
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
    hidden: false,
    initialLength: 240,
    views: new Map()
  };
}

function getActiveViewInstance(activeState) {
  if (activeState.activeViewId != null) {
    return activeState.views.get(activeState.activeViewId);
  }
}

/**
 * Returns `true` if `element` or one of its descendants has focus. This is used to determine when
 * to toggle focus between the side-bar's views and the active text editor. Views might have
 * `tabindex` attributes on descendants, and so a view's descendants have to be searched for a
 * potential `activeElement`.
 */
function elementHasOrContainsFocus(element) {
  return document.activeElement === element || element.contains(document.activeElement);
}

function blurPanel() {
  var child = ReactDOM.findDOMNode(panelComponent.getChildComponent());
  if (elementHasOrContainsFocus(child)) {
    atom.workspace.getActivePane().activate();
  }
}

function focusPanel() {
  var child = ReactDOM.findDOMNode(panelComponent.getChildComponent());
  if (!elementHasOrContainsFocus(child)) {
    child.focus();
  }
}

function renderPanel(renderState, onDidRender) {
  var activeViewInstance = getActiveViewInstance(renderState);
  var hidden = activeViewInstance == null || renderState.hidden;
  var component = ReactDOM.render(React.createElement(
    PanelComponent,
    {
      dock: 'left',
      // Keep the side-bar hidden when there is no active view instance.
      hidden: hidden,
      initialLength: renderState.initialLength,
      noScroll: true },
    activeViewInstance == null ? React.createElement('div', null) : React.createElement(activeViewInstance.view.getComponent(), { hidden: hidden })
  ), item, onDidRender);
  (0, _assert2['default'])(component instanceof PanelComponent);
  panelComponent = component;
}

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
    nextState = _extends({}, state, {
      hidden: forceHidden == null ? !state.hidden : forceHidden
    });
  } else {
    // If this is not already the active view, switch to it and ensure the side bar is visible or is
    // the specified `display` value.
    nextState = _extends({}, state, {
      activeViewId: viewId,
      hidden: forceHidden == null ? false : forceHidden
    });
  }

  // If the side bar became visible or if it was already visible and the active view changed, call
  // the next active view's `onDidShow` so it can respond to becoming visible.
  var didShow = nextState.hidden === false && state.hidden === true || !nextState.hidden && nextState.activeViewId !== state.activeViewId;

  // Store the next state.
  state = nextState;

  if (didShow) {
    (function () {
      var activeViewInstance = getActiveViewInstance(state);
      var onDidShow = undefined;
      if (activeViewInstance != null) {
        onDidShow = function () {
          focusPanel();
          activeViewInstance.view.onDidShow();
        };
      }
      renderPanel(state, onDidShow);
    })();
  } else {
    renderPanel(state);
    blurPanel();
  }
}

var Service = {
  registerView: function registerView(view) {
    if (state.views.has(view.viewId)) {
      logger.warn('A view with ID \'' + view.viewId + '\' is already registered.');
      return;
    }

    // If there's no active view yet, activate this one immediately.
    if (state.activeViewId == null) {
      state = _extends({}, state, {
        activeViewId: view.viewId
      });
    }

    // Listen for the view's toggle command.
    var commandDisposable = atom.commands.add('atom-workspace', view.toggleCommand, function (event) {
      // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
      toggleView(view.viewId, event.detail);
    });
    disposables.add(commandDisposable);

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.set(view.viewId, { commandDisposable: commandDisposable, view: view });
    state = _extends({}, state, {
      views: state.views
    });

    renderPanel(state);
  },
  destroyView: function destroyView(viewId) {
    var viewInstance = state.views.get(viewId);

    if (viewInstance == null) {
      logger.warn('No view with ID \'' + viewId + '\' is registered. Nothing to remove.');
      return;
    }

    // Stop listening for this view's toggle command.
    var commandDisposable = viewInstance.commandDisposable;
    disposables.remove(commandDisposable);
    commandDisposable.dispose();

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views['delete'](viewId);
    state = _extends({}, state, {
      views: state.views
    });

    // If this was the active view, choose the first remaining view (in insertion order) or, if
    // there are no remaining views, choose nothing (`undefined`).
    if (viewId === state.activeViewId) {
      state = _extends({}, state, {
        activeViewId: state.views.keys().next().value
      });
    }

    renderPanel(state);
  }
};

/**
 * The type provided to service consumers.
 */

function provideNuclideSideBar() {
  return Service;
}

function activate(deserializedState) {
  logger = getLogger('nuclide-side-bar');
  disposables = new CompositeDisposable();

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle', function (event) {
    // Pass the already-active view ID to simply toggle the side bar's visibility.
    // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
    toggleView(state.activeViewId, event.detail);
  }));

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle-focus', function () {
    var child = ReactDOM.findDOMNode(panelComponent.getChildComponent());
    if (elementHasOrContainsFocus(child)) {
      atom.workspace.getActivePane().activate();
    } else {
      child.focus();
    }
  }));

  item = document.createElement('div');
  item.style.display = 'flex';
  item.style.height = 'inherit';
  panel = atom.workspace.addLeftPanel({ item: item });
  state = _extends({}, getDefaultState(), deserializedState);

  // Initializes `panelComponent` so it does not need to be considered nullable.
  renderPanel(state);
}

function deactivate() {
  ReactDOM.unmountComponentAtNode(item);
  // Contains the `commandDisposable` Objects for all currently-registered views.
  disposables.dispose();
  state.views.clear();
  panel.destroy();
}

function serialize() {
  return {
    activeViewId: state.activeViewId,
    hidden: state.hidden,
    initialLength: panelComponent.getLength()
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