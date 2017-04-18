'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelLocation = undefined;

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
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

var _tabBarView;

function _load_tabBarView() {
  return _tabBarView = _interopRequireDefault(require('../../nuclide-ui/VendorLib/atom-tabs/lib/tab-bar-view'));
}

var _addPanel;

function _load_addPanel() {
  return _addPanel = _interopRequireDefault(require('./addPanel'));
}

var _observeAddedPaneItems;

function _load_observeAddedPaneItems() {
  return _observeAddedPaneItems = require('./observeAddedPaneItems');
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

var _PanelComponent;

function _load_PanelComponent() {
  return _PanelComponent = require('./ui/PanelComponent');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manages views for an Atom panel.
 */
class PanelLocation extends (_SimpleModel || _load_SimpleModel()).SimpleModel {

  constructor(locationId, serializedState = {}) {
    super();
    this._handlePanelResize = this._handlePanelResize.bind(this);
    const serializedData = serializedState.data || {};
    this._paneContainer = deserializePaneContainer(serializedData.paneContainer);
    this._position = (0, (_nullthrows || _load_nullthrows()).default)(locationsToPosition.get(locationId));
    this._panes = new _rxjsBundlesRxMinJs.BehaviorSubject(new Set());
    this._size = serializedData.size || null;
    this.state = {
      showDropAreas: false,
      // `visible` check is for legacy compat (<= v0.206)
      active: serializedData.active === true || serializedData.visible === true
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

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_observePanes || _load_observePanes()).observePanes)(paneContainer).subscribe(this._panes), (0, (_syncPaneItemVisibility || _load_syncPaneItemVisibility()).syncPaneItemVisibility)(this._panes,
    // $FlowFixMe: Teach Flow about Symbol.observable
    _rxjsBundlesRxMinJs.Observable.from(this).map(state => state.active).distinctUntilChanged()),

    // Add a tab bar to any panes created in the container.
    paneContainer.observePanes(pane => {
      const tabBarView = new (_tabBarView || _load_tabBarView()).default(pane);
      const paneElement = atom.views.getView(pane);
      paneElement.insertBefore(tabBarView.element, paneElement.firstChild);
      tabBarView.element.classList.add('nuclide-workspace-views-panel-location-tabs');
    }),

    // If you add an item to a panel (e.g. by drag & drop), make the panel active.
    paneItemChanges.startWith(null).map(() => this._paneContainer.getPaneItems().length).pairwise().subscribe(([prev, next]) => {
      // If the last item is removed, hide the panel.
      if (next === 0) {
        this.setState({ active: false });
      } else if (next > prev) {
        // If there are more items now than there were before, show the panel.
        this.setState({ active: true });
      }
    }),

    // Show the drop areas while dragging.
    _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'dragstart').filter(event => isTab(event.target)).switchMap(() => _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(true), _rxjsBundlesRxMinJs.Observable.merge(
    // Use the capturing phase in case the event propagation is stopped.
    _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'dragend', { capture: true }), _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'drop', { capture: true })).take(1).mapTo(false)))
    // Manipulating the DOM in the dragstart handler will fire the dragend event so we defer it.
    // See https://groups.google.com/a/chromium.org/forum/?fromgroups=#!msg/chromium-bugs/YHs3orFC8Dc/ryT25b7J-NwJ
    .observeOn(_rxjsBundlesRxMinJs.Scheduler.async).subscribe(showDropAreas => {
      this.setState({ showDropAreas });
    }));

    this._disposables.add(
    // $FlowIssue: We need to teach flow about Symbol.observable.
    _rxjsBundlesRxMinJs.Observable.from(this).subscribeOn(_rxjsBundlesRxMinJs.Scheduler.animationFrame).subscribe(state => {
      this._render(state);
    }));
  }

  _render(state) {
    const shouldBeVisible = this.state.active || this.state.showDropAreas;
    const panel = this._getPanel();

    // Because we want to show something event when the panel is collapsed, we have to show it.
    if (shouldBeVisible && !panel.isVisible()) {
      panel.show();
    }

    const el = panel.getItem();
    _reactDom.default.render(_react.default.createElement((_PanelComponent || _load_PanelComponent()).PanelComponent, {
      draggingItem: state.showDropAreas,
      active: state.active,
      initialSize: this._size,
      paneContainer: this._paneContainer,
      position: this._position,
      onResize: this._handlePanelResize,
      toggle: () => {
        this.toggle();
      }
    }), el);
  }

  _getPanel() {
    if (this._panel == null) {
      const el = document.createElement('div');
      const panel = this._panel = (0, (_addPanel || _load_addPanel()).default)(this._position, {
        item: el,
        priority: 101 });
      this._disposables.add(() => {
        _reactDom.default.unmountComponentAtNode(el);
      }, () => {
        panel.destroy();
      });
      this._panel = panel;
    }
    return this._panel;
  }

  _handlePanelResize(size) {
    // If the user resizes the pane, store it so that we can serialize it for the next session.
    this._size = size;
  }

  itemIsVisible(item) {
    if (!this.state.active) {
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

  activate() {
    this.setState({ active: true });
  }

  addItem(item) {
    let pane = this._paneContainer.paneForItem(item);
    if (pane == null) {
      pane = this._paneContainer.getActivePane();
    }
    pane.addItem(item);
  }

  activateItem(item) {
    let pane = this._paneContainer.paneForItem(item);
    if (pane == null) {
      pane = this._paneContainer.getActivePane();
    }
    pane.activateItem(item);
  }

  /**
   * Hide the specified item. If the user toggles a active item, we hide the entire pane.
   */
  hideItem(item) {
    const itemIsVisible = this._paneContainer.getPanes().some(pane => pane.getActiveItem() === item);

    // If the item's already hidden, we're done.
    if (!itemIsVisible) {
      return;
    }

    // Otherwise, hide the panel altogether.
    this.setState({ active: false });
  }

  isVisible() {
    return this.state.active;
  }

  toggle() {
    this.setState({ active: !this.state.active });
  }

  serialize() {
    return {
      deserializer: 'PanelLocation',
      data: {
        paneContainer: this._paneContainer == null ? null : this._paneContainer.serialize(),
        size: this._size,
        active: this.state.active
      }
    };
  }

  onDidAddItem(cb) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_observeAddedPaneItems || _load_observeAddedPaneItems()).observeAddedPaneItems)(this._paneContainer).subscribe(cb));
  }
}

exports.PanelLocation = PanelLocation; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        */

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