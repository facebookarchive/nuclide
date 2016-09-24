'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Logger} from '../../nuclide-logging/lib/types';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';

import {CompositeDisposable} from 'atom';
import debounce from '../../commons-node/debounce';
import {getLogger} from '../../nuclide-logging';
import invariant from 'assert';
import {PanelComponent} from '../../nuclide-ui/PanelComponent';
import {React, ReactDOM} from 'react-for-atom';
import SideBarPanelComponent from './SideBarPanelComponent';

type ViewInstance = {
  commandDisposable: IDisposable,
  view: View,
};

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
type View = {
  getComponent: () => Class<any>, // TODO(ssorallen): Should be polymorphic `Class<React.Component>`
  onDidShow: () => mixed,
  title: string,
  toggleCommand: string,
  viewId: string,
};

type State = {
  activeViewId: ?string,
  autoViewId: ?string,
  hidden: boolean,
  initialLength: number,
  views: Map<string, ViewInstance>,
};

let disposables: ?CompositeDisposable;
let logger: Logger;
let panel: ?atom$Panel;
let panelComponent: ?PanelComponent;
let state: State;

function getDefaultState(): State {
  return {
    activeViewId: null,
    autoViewId: null,
    hidden: false,
    initialLength: 240,
    views: new Map(),
  };
}

function setState(nextState: Object, onDidRender?: ?() => mixed, immediate?: boolean): void {
  const mergedState = {
    ...state,
    ...nextState,
  };
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

function getActiveViewInstance(activeState: State): ?ViewInstance {
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

function blurPanel(): void {
  if (panelComponent == null) {
    return;
  }

  const child = ReactDOM.findDOMNode(panelComponent.getChildComponent());
  if (child.contains(document.activeElement)) {
    atom.workspace.getActivePane().activate();
  }
}

function focusPanel(): void {
  if (panelComponent == null) {
    return;
  }

  const child = panelComponent.getChildComponent();
  if (!ReactDOM.findDOMNode(child).contains(document.activeElement)) {
    invariant(child instanceof SideBarPanelComponent);
    child.focus();
  }
}

function renderPanelSync(renderState: State, onDidRender?: ?() => mixed): void {
  // This function is debounced, so it may run after the package has been deactivated.
  if (panel == null) {
    return;
  }

  const activeViewInstance = getActiveViewInstance(renderState);
  const hidden = (activeViewInstance == null) || renderState.hidden;
  const activeViewId = activeViewInstance == null ? null : activeViewInstance.view.viewId;

  const viewMenuItems = Array.from(renderState.views.values()).map(viewInstance => ({
    label: viewInstance.view.title,
    value: viewInstance.view.viewId,
  }));

  const component = ReactDOM.render(
    <PanelComponent
      dock="left"
      // Keep the side-bar hidden when there is no active view instance.
      hidden={hidden}
      initialLength={renderState.initialLength}
      noScroll>
      <SideBarPanelComponent
        menuItems={viewMenuItems}
        onSelectedViewMenuItemChange={value => {
          toggleView(value, {display: true});
        }}
        selectedViewMenuItemValue={activeViewId}>
        {activeViewInstance == null
          ? <div />
          : React.createElement(activeViewInstance.view.getComponent(), {hidden})}
      </SideBarPanelComponent>
    </PanelComponent>,
    panel.getItem(),
    onDidRender,
  );
  invariant(component instanceof PanelComponent);
  panelComponent = component;
}
const renderPanel = debounce(renderPanelSync, 50);

function toggleView(viewId: ?string, options?: {display: boolean}) {
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
      hidden: (forceHidden == null) ? !state.hidden : forceHidden,
    };
  } else {
    // If this is not already the active view, switch to it and ensure the side bar is visible or is
    // the specified `display` value.
    nextState = {
      activeViewId: viewId,
      hidden: (forceHidden == null) ? false : forceHidden,
    };
  }

  // If the side bar became visible or if it was already visible and the active view changed, call
  // the next active view's `onDidShow` so it can respond to becoming visible.
  const panelBecameVisible = (nextState.hidden === false && state.hidden === true);
  const viewBecameVisible = !nextState.hidden
    && (nextState.activeViewId != null && (nextState.activeViewId !== state.activeViewId));
  const didShow = panelBecameVisible || viewBecameVisible;

  if (didShow) {
    const onDidShow = function() {
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
  registerView(view: View): void {
    if (state.views.has(view.viewId)) {
      logger.warn(`A view with ID '${view.viewId}' is already registered.`);
      return;
    }

    const nextState = {};

    // Track the last registered view ID in case no user selection is ever made.
    nextState.autoViewId = view.viewId;

    const commandDisposable = atom.commands.add('atom-workspace', view.toggleCommand, event => {
      // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
      toggleView(view.viewId, event.detail);
    });
    invariant(disposables != null);
    disposables.add(commandDisposable);

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.set(view.viewId, {commandDisposable, view});
    nextState.views = state.views;

    // If this is the view that was last serialized, render synchronously and immediately so the
    // side-bar appears quickly on start up.
    setState(nextState, null, state.activeViewId === view.viewId);
  },
  destroyView(viewId: string): void {
    const viewInstance = state.views.get(viewId);

    if (viewInstance == null) {
      logger.warn(`No view with ID '${viewId}' is registered. Nothing to remove.`);
      return;
    }

    invariant(disposables != null);
    const commandDisposable = viewInstance.commandDisposable;
    disposables.remove(commandDisposable);
    commandDisposable.dispose();

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.delete(viewId);
    let nextState = {views: state.views};

    // If this was the active view, choose the first remaining view (in insertion order) or, if
    // there are no remaining views, choose nothing (`undefined`).
    if (viewId === state.autoViewId) {
      nextState = {
        ...nextState,
        autoViewId: state.views.keys().next().value,
      };
    }

    setState(nextState);
  },
};

/**
 * The type provided to service consumers.
 */
export type NuclideSideBarService = typeof Service;

export function provideNuclideSideBar(): NuclideSideBarService {
  return Service;
}

export function activate(deserializedState: ?Object) {
  logger = getLogger('nuclide-side-bar');
  disposables = new CompositeDisposable();

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
    if (ReactDOM.findDOMNode(child).contains(document.activeElement)) {
      atom.workspace.getActivePane().activate();
    } else {
      invariant(child instanceof SideBarPanelComponent);
      child.focus();
    }
  }));

  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.height = 'inherit';
  panel = atom.workspace.addLeftPanel({item});
  const nextState = {...getDefaultState(), ...deserializedState};

  if (nextState.activeViewId == null) {
    // Special case the file-tree so it renders synchronously if `null` was previously serialized.
    nextState.activeViewId = 'nuclide-file-tree';
  }

  // Initializes `panelComponent` so it does not need to be considered nullable.
  setState(nextState);
}

export function deactivate() {
  if (panel != null) {
    ReactDOM.unmountComponentAtNode(panel.getItem());
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

export function serialize(): Object {
  return {
    activeViewId: state.activeViewId,
    hidden: state.hidden,
    // If no render has yet happened, use the last stored length in the state (likely the default).
    initialLength: (panelComponent == null) ? state.initialLength : panelComponent.getLength(),
  };
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  const isVisible = () => !state.hidden;
  return {
    name: 'nuclide-side-bar',
    isVisible,
    toggle(): void {
      toggleView(state.activeViewId);
    },
  };
}
