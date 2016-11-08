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
exports.PanelLocation = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _PanelRenderer;

function _load_PanelRenderer() {
  return _PanelRenderer = _interopRequireDefault(require('../../commons-atom/PanelRenderer'));
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _SimpleModel;

function _load_SimpleModel() {
  return _SimpleModel = require('../../commons-node/SimpleModel');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _observePanes;

function _load_observePanes() {
  return _observePanes = require('./observePanes');
}

var _syncPaneItemVisibility;

function _load_syncPaneItemVisibility() {
  return _syncPaneItemVisibility = require('./syncPaneItemVisibility');
}

var _PanelLocationIds;

function _load_PanelLocationIds() {
  return _PanelLocationIds = _interopRequireWildcard(require('./PanelLocationIds'));
}

var _Panel;

function _load_Panel() {
  return _Panel = require('./ui/Panel');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manages views for an Atom panel.
 */
let PanelLocation = exports.PanelLocation = class PanelLocation extends (_SimpleModel || _load_SimpleModel()).SimpleModel {

  constructor(locationId) {
    let serializedState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    super();
    this._handlePanelResize = this._handlePanelResize.bind(this);
    const serializedData = serializedState.data || {};
    this._paneContainer = deserializePaneContainer(serializedData.paneContainer);
    this._position = (0, (_nullthrows || _load_nullthrows()).default)(locationsToPosition.get(locationId));
    this._panelRenderer = new (_PanelRenderer || _load_PanelRenderer()).default({
      priority: 101, // Use a value higher than the default (100).
      location: this._position,
      createItem: this._createItem.bind(this)
    });
    this._panes = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    this._size = serializedData.size || null;
    this.state = {
      showDropAreas: false,
      visible: serializedData.visible === true
    };
  }

  /**
   * Set up the subscriptions and make this thing "live."
   */
  initialize() {
    const paneContainer = this._paneContainer;

    // Create a stream that represents a change in the items of any pane. We need to do custom logic
    // for this instead of using `PaneContainer::observePaneItems()`, or the other PaneContainer
    // item events, because those [assume that moved items are not switching pane containers][1].
    // Since we have multiple pane containers, they can.
    //
    // [1]: https://github.com/atom/atom/blob/v1.10.0/src/pane-container.coffee#L232-L236
    const paneItemChanges = this._panes.map(x => Array.from(x)).switchMap(panes => {
      const itemChanges = panes.map(pane => _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidAddItem.bind(pane)), (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidRemoveItem.bind(pane))));
      return _rxjsBundlesRxMinJs.Observable.merge(...itemChanges);
    }).share();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._panelRenderer, (0, (_observePanes || _load_observePanes()).observePanes)(paneContainer).subscribe(this._panes), (0, (_syncPaneItemVisibility || _load_syncPaneItemVisibility()).syncPaneItemVisibility)(this._panes,
    // $FlowFixMe: Teach Flow about Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this).map(state => state.visible).distinctUntilChanged()),

    // Add a tab bar to any panes created in the container.
    // TODO: Account for the disabling of the atom-tabs package. We assume that it will be
    //   activated, but that isn't necessarily true. Continuing to use the atom-tabs logic while
    //   avoiding that assumption will likely mean a change to atom-tabs that makes it more
    //   generic.
    paneContainer.observePanes(pane => {
      const tabBarView = document.createElement('ul', 'atom-tabs');
      tabBarView.classList.add('nuclide-workspace-views-panel-location-tabs');

      const initializeTabBar = () => {
        if (!(typeof tabBarView.initialize === 'function')) {
          throw new Error('Invariant violation: "typeof tabBarView.initialize === \'function\'"');
        }

        tabBarView.initialize(pane);
        const paneElement = atom.views.getView(pane);
        paneElement.insertBefore(tabBarView, paneElement.firstChild);

        const hideButtonWrapper = document.createElement('div');
        hideButtonWrapper.className = 'nuclide-workspace-views-panel-location-tabs-hide-button-wrapper';
        const hideButton = document.createElement('div');
        hideButton.className = 'nuclide-workspace-views-panel-location-tabs-hide-button';
        hideButton.onclick = () => {
          this.setState({ visible: false });
        };
        hideButtonWrapper.appendChild(hideButton);
        tabBarView.appendChild(hideButtonWrapper);
      };

      // It's possible that the tabs package may not have activated yet (and therefore that the
      // atom-tabs element won't have been upgraded). If that's the case, wait for it to do so and
      // then initialize the tab bar.
      if (typeof tabBarView.initialize === 'function') {
        initializeTabBar();
      } else {
        const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.packages.onDidActivatePackage(pkg => {
          if (typeof tabBarView.initialize === 'function') {
            initializeTabBar();
            disposables.dispose();
          }
        }), pane.onDidDestroy(() => {
          disposables.dispose();
        }));
      }
    }),

    // If you add an item to a panel (e.g. by drag & drop), make the panel visible.
    paneItemChanges.startWith(null).map(() => this._paneContainer.getPaneItems().length).pairwise().subscribe((_ref) => {
      var _ref2 = _slicedToArray(_ref, 2);

      let prev = _ref2[0],
          next = _ref2[1];

      // If the last item is removed, hide the panel.
      if (next === 0) {
        this.setState({ visible: false });
      } else if (next > prev) {
        // If there are more items now than there were before, show the panel.
        this.setState({ visible: true });
      }
    }),

    // Show the drop areas while dragging.
    _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'dragstart').filter(event => isTab(event.target)).switchMap(() => _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(true), _rxjsBundlesRxMinJs.Observable.merge(
    // Use the capturing phase in case the event propagation is stopped.
    _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'dragend', { capture: true }), _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'drop', { capture: true })).take(1).mapTo(false)))
    // Manipulating the DOM in the dragstart handler will fire the dragend event so we defer it.
    // See https://groups.google.com/a/chromium.org/forum/?fromgroups=#!msg/chromium-bugs/YHs3orFC8Dc/ryT25b7J-NwJ
    .observeOn(_rxjsBundlesRxMinJs.Scheduler.async).subscribe(showDropAreas => {
      this.setState({ showDropAreas: showDropAreas });
    }),

    // $FlowIssue: We need to teach flow about Symbol.observable.
    _rxjsBundlesRxMinJs.Observable.from(this).subscribe(state => {
      this._panelRenderer.render({
        visible: state.showDropAreas || state.visible
      });
    }));
  }

  _createItem() {
    // Create an item to display in the panel. Atom will associate this item with a view via the
    // view registry (and its `getElement` method). That view will be used to display views for this
    // panel.
    // $FlowIssue: We need to teach flow about Symbol.observable.
    const props = _rxjsBundlesRxMinJs.Observable.from(this).map(state => ({
      initialSize: this._size,
      paneContainer: this._paneContainer,
      position: this._position,
      onResize: this._handlePanelResize
    }));
    const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_Panel || _load_Panel()).Panel);
    return { getElement: () => (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_reactForAtom.React.createElement(Component, null)) };
  }

  _handlePanelResize(size) {
    // If the user resizes the pane, store it so that we can serialize it for the next session.
    this._size = size;
  }

  itemIsVisible(item) {
    if (!this.state.visible) {
      return false;
    }
    for (const pane of this._panes.getValue()) {
      if (item === pane.getActiveItem()) {
        return true;
      }
    }
    return false;
  }

  destroy() {
    this._disposables.dispose();
    this._paneContainer.destroy();
  }

  destroyItem(item) {
    for (const pane of this._panes.getValue()) {
      for (const it of pane.getItems()) {
        if (it === item) {
          pane.destroyItem(it);
        }
      }
    }
  }

  getItems() {
    const items = [];
    for (const pane of this._panes.getValue()) {
      items.push(...pane.getItems());
    }
    return items;
  }

  showItem(item) {
    let pane = this._paneContainer.paneForItem(item);
    if (pane == null) {
      pane = this._paneContainer.getActivePane();
      pane.addItem(item);
    }
    pane.activate();
    pane.activateItem(item);
    this.setState({ visible: true });
  }

  /**
   * Hide the specified item. If the user toggles a visible item, we hide the entire pane.
   */
  hideItem(item) {
    const itemIsVisible = this._paneContainer.getPanes().some(pane => pane.getActiveItem() === item);

    // If the item's already hidden, we're done.
    if (!itemIsVisible) {
      return;
    }

    // Otherwise, hide the panel altogether.
    this.setState({ visible: false });
  }

  isVisible() {
    return this.state.visible;
  }

  toggle() {
    this.setState({ visible: !this.state.visible });
  }

  serialize() {
    return {
      deserializer: 'PanelLocation',
      data: {
        paneContainer: this._paneContainer == null ? null : this._paneContainer.serialize(),
        size: this._size,
        visible: this.state.visible
      }
    };
  }
};


function deserializePaneContainer(serialized) {
  const paneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
  if (serialized != null) {
    paneContainer.deserialize(serialized, atom.deserializers);
  }
  return paneContainer;
}

const locationsToPosition = new Map([[(_PanelLocationIds || _load_PanelLocationIds()).TOP_PANEL, 'top'], [(_PanelLocationIds || _load_PanelLocationIds()).RIGHT_PANEL, 'right'], [(_PanelLocationIds || _load_PanelLocationIds()).BOTTOM_PANEL, 'bottom'], [(_PanelLocationIds || _load_PanelLocationIds()).LEFT_PANEL, 'left']]);

function isTab(element) {
  let el = element;
  while (el != null) {
    if (el.getAttribute('is') === 'tabs-tab') {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}