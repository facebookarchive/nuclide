'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _constants;











function _load_constants() {return _constants = require('../constants');}var _DebuggerPaneViewModel;



function _load_DebuggerPaneViewModel() {return _DebuggerPaneViewModel = _interopRequireDefault(require('./DebuggerPaneViewModel'));}

var _react = _interopRequireWildcard(require('react'));var _tabBarView;
function _load_tabBarView() {return _tabBarView = _interopRequireDefault(require('../../../../../nuclide-commons-ui/VendorLib/atom-tabs/lib/tab-bar-view'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _View;
function _load_View() {return _View = require('../../../../../nuclide-commons-ui/View');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                        *
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                        * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                        */const DEBUGGER_TAB_TITLE = 'Debugger';class DebuggerPaneContainerViewModel {
  constructor(paneContainer, preferredWidth) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._paneEvents = new Map();
    this._removedFromLayout = false;
    this._container = paneContainer;
    this._preferredWidth = preferredWidth;

    for (const pane of this._container.getPanes()) {
      this._deferredAddTabBarToEmptyPane(pane);
      this._addManagedPane(pane);
    }

    this._disposables.add(
    () => {
      this._forEachChildPaneItem(item => {if (!(

        item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default ||
        item instanceof DebuggerPaneContainerViewModel)) {throw new Error('Invariant violation: "item instanceof DebuggerPaneViewModel ||\\n              item instanceof DebuggerPaneContainerViewModel"');}

        item.setRemovedFromLayout(this._removedFromLayout);
        item.destroy();
      });
      this._container.destroy();
    },
    paneContainer.onDidAddPane(event => {
      const pane = event.pane;

      this._kickOutNonDebuggerItems(pane);
      if (this._container.getPanes().indexOf(pane) < 0) {
        return;
      }

      if (!this._conditionallyAddTabBarToPane(pane)) {
        // Wait until the item(s) are added to the pane, and then add a tab bar
        // above them if and only if the item's title is not the same as the
        // container tabs title (we don't want duplicate tabs right beneath each other).
        this._deferredAddTabBarToEmptyPane(pane);
      }

      this._addManagedPane(pane);
    }),
    paneContainer.onWillDestroyPane(event => {
      const disposables = this._paneEvents.get(event.pane);
      if (disposables != null) {
        disposables.dispose();
        this._paneEvents.delete(event.pane);
      }
    }),
    paneContainer.onDidDestroyPane(event => {
      // If this container is now empty, destroy it!
      const panes = this._container.getPanes();
      if (
      panes.length === 0 ||
      panes.length === 1 && panes[0].getItems().length === 0)
      {
        const parent = this.getParentPane();
        if (parent != null) {
          parent.removeItem(this);
        }
      }
    }));

  }

  _addManagedPane(pane) {
    let disposables = this._paneEvents.get(pane);
    if (disposables == null) {
      disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      this._paneEvents.set(pane, disposables);
    }

    disposables.add(
    pane.onDidAddItem(event => {
      this._kickOutNonDebuggerItems(pane);
    }));


    // Split operations on the child panes of this container are also being
    // executed on the parent pane that contains this container, which results
    // in very unexpected behavior. Prevent the parent pane from splitting.
    const parent = this.getParentPane();
    if (parent != null) {
      // $FlowFixMe
      parent.split = () => {};
    }
  }

  // If a pane is initially empty, don't add the tab bar until the first item
  // is added to the pane, otherwise we don't know what title to give the tab!
  _deferredAddTabBarToEmptyPane(pane) {
    const pendingAddTabDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    pendingAddTabDisposable.add(
    pane.onDidAddItem(event => {
      if (this._conditionallyAddTabBarToPane(pane)) {
        this._disposables.remove(pendingAddTabDisposable);
        pendingAddTabDisposable.dispose();
      }
    }));

    this._disposables.add(pendingAddTabDisposable);
  }

  _conditionallyAddTabBarToPane(pane) {
    const items = pane.getItems();
    if (items.length > 0) {
      const item = items[0];
      if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default) {
        if (item.getTitle() !== this.getTitle() || items.length > 1) {
          this._addTabBarToPane(pane);
          return true;
        }
      }
    }

    return false;
  }

  // Don't let the user add a non-debugger item to the debugger pane container. This is because
  // the container will get destroyed by the debugger going away or redoing layout, and we wouldn't
  // be able to preserve the user's other items.
  _kickOutNonDebuggerItems(pane) {
    for (const item of pane.getItems()) {
      if (item instanceof DebuggerPaneContainerViewModel) {
        if (item === this) {
          // If the container is dropped into itself, we've got a problem.
          // Call debugger:show, which will blow away this entire pane and redo
          // the debugger layout.
          // TODO: Better solution here.
          process.nextTick(() => {
            atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'debugger:show');

          });
        } else {
          // This is another debugger pane container, which contains other debugger
          // panes. Move all the other container's items to this container, and\
          // then destroy the other container.
          const otherPanes = item._container.getPanes();
          for (const otherPane of otherPanes) {
            for (const otherItem of otherPane.getItems()) {
              const idx = pane.getItems().indexOf(item);
              otherPane.moveItemToPane(otherItem, pane, idx);
              otherPane.activateItemAtIndex(idx);
            }
          }

          // Destroy the (now empty) other pane container.
          process.nextTick(() => {
            pane.destroyItem(item);
          });
        }
      } else {
        // Kick the item out to the parent pane.
        if (!(item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default)) {
          this._moveItemToParentPane(item, pane);
        }
      }
    }
  }

  _moveItemToParentPane(item, pane) {
    const parentPane = this.getParentPane();if (!(
    parentPane != null)) {throw new Error('Invariant violation: "parentPane != null"');}

    // Kick the item out to the parent pane, which must be done on next tick because the drag
    // operation currently in progress needs the item not to be destroyed before the drag
    // completes.
    process.nextTick(() => {if (!(
      parentPane != null)) {throw new Error('Invariant violation: "parentPane != null"');}
      pane.moveItemToPane(
      item,
      parentPane,
      parentPane.getItems().indexOf(this) + 1);


      // TODO: Atom bug? This is here because when setting this item active immediately after
      // moving, it sometimes (but not always) renders a blank pane...
      process.nextTick(() => {if (!(
        parentPane != null)) {throw new Error('Invariant violation: "parentPane != null"');}
        parentPane.setActiveItem(item);
      });
    });
  }

  getParentPane() {
    for (const pane of atom.workspace.getPanes()) {
      for (const item of pane.getItems()) {
        if (item === this) {
          return pane;
        }
      }
    }
    return null;
  }

  _addTabBarToPane(pane) {
    const tabBarView = new (_tabBarView || _load_tabBarView()).default(pane);
    const paneElement = atom.views.getView(pane);
    paneElement.insertBefore(tabBarView.element, paneElement.firstChild);

    // moveItemBetweenPanes conflicts with the parent tab's moveItemBetweenPanes.
    // Empty it out to get the correct behavior.
    tabBarView.moveItemBetweenPanes = () => {};
    tabBarView.element.classList.add(
    'nuclide-workspace-views-panel-location-tabs');

  }

  dispose() {
    this._disposables.dispose();
  }

  destroy() {
    if (!this._removedFromLayout) {
      // We need to differentiate between the case where destroying this pane hides one or more
      // non-essential debugger views, and where it means the user is closing the debugger.
      //
      // If closing this pane would close a lifetime view, forward the destroy request to that view,
      // which will manage tearing down the debugger. Otherwise, we are simply hiding all panes
      // contained within this pane, which is accomplished by disposing this.
      for (const pane of this._container.getPanes()) {
        for (const item of pane.getItems()) {
          if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default) {
            if (item.isLifetimeView()) {
              item.destroy();
              return;
            }
          }
        }
      }
    }

    this.dispose();
  }

  destroyWhere(callback) {
    this._forEachChildPaneItem((innerItem, pane) => {
      if (callback(innerItem)) {
        pane.destroyItem(innerItem);
      }
    });
  }

  getTitle() {
    return DEBUGGER_TAB_TITLE;
  }

  getIconName() {
    return 'nuclicon-debugger';
  }

  getDefaultLocation() {
    return (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_LOCATION;
  }

  getURI() {
    return 'atom://nuclide/debugger-container';
  }

  getPreferredWidth() {
    return this._preferredWidth == null ? (_constants || _load_constants()).DEBUGGER_PANELS_DEFAULT_WIDTH_PX :

    this._preferredWidth;
  }

  createView() {
    return _react.createElement((_View || _load_View()).View, { item: this._container });
  }

  setRemovedFromLayout(removed) {
    this._removedFromLayout = removed;

    // Propagate this command to the children of the pane container.
    this._forEachChildPaneItem(item => {
      if (item instanceof (_DebuggerPaneViewModel || _load_DebuggerPaneViewModel()).default) {
        item.setRemovedFromLayout(removed);
      }
    });
  }

  _forEachChildPaneItem(
  callback)
  {
    for (const pane of this._container.getPanes()) {
      pane.getItems().forEach(item => {
        callback(item, pane);
      });
    }
  }

  getAllItems() {
    const items = [];
    this._forEachChildPaneItem(item => {
      items.push(item);
    });

    return items;
  }

  serialize() {
    return {};
  }

  copy() {
    return false;
  }}exports.default = DebuggerPaneContainerViewModel;