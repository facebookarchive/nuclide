'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Logger} from '../../logging/lib/types';

const {CompositeDisposable} = require('atom');
const {getLogger} = require('../../logging');
const {object} = require('../../commons');
const {PanelComponent} = require('../../ui/panel');
const {
  React,
  ReactDOM,
} = require('react-for-atom');

type NuclideSideBarViewInstance = {
  commandDisposable: IDisposable,
  view: NuclideSideBarView,
};

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
type NuclideSideBarView = {
  toggleCommand: string,
  getComponent: () => (typeof React.Component),
  viewId: string,
};

type State = {
  activeViewId: ?string,
  hidden: boolean,
  initialLength: number,
  views: Map<string, NuclideSideBarViewInstance>,
};

let disposables: CompositeDisposable;
let item: HTMLElement;
let logger: Logger;
let panel: atom$Panel;
let panelComponent: PanelComponent;
let state: State;

function getDefaultState(): State {
  return {
    activeViewId: null,
    hidden: false,
    initialLength: 240,
    views: new Map(),
  };
}

function renderPanel(renderState) {
  let activeViewInstance;
  if (renderState.activeViewId != null) {
    activeViewInstance = renderState.views.get(renderState.activeViewId);
  }

  panelComponent = ReactDOM.render(
    <PanelComponent
      dock="left"
      hidden={renderState.hidden}
      initialLength={renderState.initialLength}>
      {activeViewInstance == null
        ? <div />
        : React.createElement(activeViewInstance.view.getComponent())}
    </PanelComponent>,
    item
  );
}

function toggleView(viewId: string, options?: {display: boolean}) {
  if (!state.views.has(viewId)) {
    logger.warn(`No view with ID '${viewId}' is registered. Toggling nothing.`);
    return;
  }

  // If `display` is specified in the event details, use it as the `hidden` value rather than
  // toggle. This enables consumers to force hide/show without first asking for the visibility
  // state.
  let forceHidden;
  if (options != null) {
    forceHidden = !options.display;
  }

  if (viewId === state.activeViewId) {
    // If this view is already active, just toggle the visibility of the side bar or set it to the
    // desired `display`.
    state = {
      ...state,
      hidden: (forceHidden == null) ? !state.hidden : forceHidden,
    };
  } else {
    // If this is not already the active view, switch to it and ensure the side bar is visible or is
    // the specified `display` value.
    state = {
      ...state,
      activeViewId: viewId,
      hidden: (forceHidden == null) ? false : forceHidden,
    };
  }

  renderPanel(state);
}

const NuclideSideBarService = {
  registerView(view: NuclideSideBarView): void {
    if (state.views.has(view.viewId)) {
      logger.warn(`A view with ID '${view.viewId}' is already registered.`);
      return;
    }

    // If there's no active view yet, activate this one immediately.
    if (state.activeViewId == null) {
      state = {
        ...state,
        activeViewId: view.viewId,
      };
    }

    // Listen for the view's toggle command.
    const commandDisposable = atom.commands.add('atom-workspace', view.toggleCommand, event => {
      // $FlowIssue Missing `CustomEvent` type in Flow's 'dom.js' library
      toggleView(view.viewId, event.detail);
    });
    disposables.add(commandDisposable);

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.set(view.viewId, {commandDisposable, view});
    state = {
      ...state,
      views: state.views,
    };

    renderPanel(state);
  },
  destroyView(viewId: string): void {
    const viewInstance = state.views.get(viewId);

    if (viewInstance == null) {
      logger.warn(`No view with ID '${viewId}' is registered. Nothing to remove.`);
      return;
    }

    // Stop listening for this view's toggle command.
    const commandDisposable = viewInstance.commandDisposable;
    disposables.remove(commandDisposable);
    commandDisposable.dispose();

    // `Map` is not actually immutable, but use the immutable paradigm to keep updating consistent
    // for all values in `state`.
    state.views.delete(viewId);
    state = {
      ...state,
      views: state.views,
    };

    // If this was the active view, choose the first remaining view (in insertion order) or, if
    // there are no remaining views, choose nothing (`undefined`).
    if (viewId === state.activeViewId) {
      state = {
        ...state,
        activeViewId: state.views.keys().next().value,
      };
    }

    renderPanel(state);
  },
};

export function provideNuclideSideBar(): typeof NuclideSideBarService {
  return NuclideSideBarService;
}

export function activate(deserializedState: ?Object) {
  logger = getLogger('nuclide-side-bar');
  disposables = new CompositeDisposable();

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle', () => {
    state = {
      ...state,
      hidden: !state.hidden,
    };
    renderPanel(state);
  }));

  disposables.add(atom.commands.add('atom-workspace', 'nuclide-side-bar:toggle-focus', () => {
    const child = ReactDOM.findDOMNode(panelComponent.getChildComponent());
    if (document.activeElement === child) {
      atom.workspace.getActivePane().activate();
    } else {
      child.focus();
    }
  }));

  item = document.createElement('div');
  item.style.height = '100%';
  panel = atom.workspace.addLeftPanel({item});
  state = object.assign({}, getDefaultState(), deserializedState);

  // Initializes `panelComponent` so it does not need to be considered nullable.
  renderPanel(state);
}

export function deactivate() {
  ReactDOM.unmountComponentAtNode(item);
  state.views.clear();
  // Contains the `commandDisposable` Objects for all currently-registered views.
  disposables.dispose();
  panel.destroy();
}

export function serialize(): Object {
  return {
    activeViewId: state.activeViewId,
    hidden: state.hidden,
    initialLength: panelComponent.getLength(),
  };
}
