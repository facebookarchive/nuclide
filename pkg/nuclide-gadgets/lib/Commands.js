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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _ContainerVisibility2;

function _ContainerVisibility() {
  return _ContainerVisibility2 = _interopRequireWildcard(require('./ContainerVisibility'));
}

var _createComponentItem2;

function _createComponentItem() {
  return _createComponentItem2 = _interopRequireDefault(require('./createComponentItem'));
}

var _ExpandedFlexScale2;

function _ExpandedFlexScale() {
  return _ExpandedFlexScale2 = _interopRequireWildcard(require('./ExpandedFlexScale'));
}

var _findOrCreatePaneItemLocation2;

function _findOrCreatePaneItemLocation() {
  return _findOrCreatePaneItemLocation2 = _interopRequireDefault(require('./findOrCreatePaneItemLocation'));
}

var _findPaneAndItem2;

function _findPaneAndItem() {
  return _findPaneAndItem2 = _interopRequireDefault(require('./findPaneAndItem'));
}

var _getContainerToHide2;

function _getContainerToHide() {
  return _getContainerToHide2 = _interopRequireDefault(require('./getContainerToHide'));
}

var _getResizableContainers2;

function _getResizableContainers() {
  return _getResizableContainers2 = _interopRequireDefault(require('./getResizableContainers'));
}

var _GadgetPlaceholder2;

function _GadgetPlaceholder() {
  return _GadgetPlaceholder2 = _interopRequireDefault(require('./GadgetPlaceholder'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _shallowequal2;

function _shallowequal() {
  return _shallowequal2 = _interopRequireDefault(require('shallowequal'));
}

var _wrapGadget2;

function _wrapGadget() {
  return _wrapGadget2 = _interopRequireDefault(require('./wrapGadget'));
}

/**
 * Create an object that provides commands ("action creators")
 */

var Commands = (function () {
  function Commands(observer, getState) {
    _classCallCheck(this, Commands);

    this._observer = observer;
    this._getState = getState;
  }

  _createClass(Commands, [{
    key: 'deactivate',
    value: function deactivate() {
      this._observer.next({
        type: (_ActionTypes2 || _ActionTypes()).DEACTIVATE
      });
      this._observer.complete();
    }
  }, {
    key: 'destroyGadget',
    value: function destroyGadget(gadgetId) {
      var match = (0, (_findPaneAndItem2 || _findPaneAndItem()).default)(function (item) {
        return getGadgetId(item) === gadgetId;
      });
      if (match == null) {
        return;
      }
      match.pane.destroyItem(match.item);
    }
  }, {
    key: 'cleanUpDestroyedPaneItem',
    value: function cleanUpDestroyedPaneItem(item) {
      if (!this._getState().get('components').has(item)) {
        return;
      }

      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item.element);

      this._observer.next({
        type: (_ActionTypes2 || _ActionTypes()).DESTROY_PANE_ITEM,
        payload: { item: item }
      });
    }

    /**
     * Creates a new pane item for the specified gadget. This is meant to be the single point
     * through which all pane item creation goes (new pane item creation, deserialization,
     * splitting, reopening, etc.).
     */
  }, {
    key: 'createPaneItem',
    value: function createPaneItem(gadgetId, props) {
      var isNew = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      // Look up the gadget.
      var gadget = this._getState().get('gadgets').get(gadgetId);

      // If there's no gadget registered with the provided ID, abort. Maybe the user just
      // deactivated that package.
      if (gadget == null) {
        return;
      }

      var GadgetComponent = gadget;
      var item = (0, (_createComponentItem2 || _createComponentItem()).default)((_reactForAtom2 || _reactForAtom()).React.createElement(GadgetComponent, props));

      this._observer.next({
        type: (_ActionTypes2 || _ActionTypes()).CREATE_PANE_ITEM,
        payload: {
          component: GadgetComponent,
          gadgetId: gadgetId,
          item: item,
          props: props,
          isNew: isNew
        }
      });

      return item;
    }
  }, {
    key: 'hideGadget',
    value: function hideGadget(gadgetId) {
      // Hiding a gadget doesn't just mean closing its pane; it means getting it out of the way.
      // Just closing its pane and would potentially leave siblings which, presumably, the user
      // would then have to also close. Instead, it's more useful to identify the group of gadgets
      // to which this one belongs and get it out of the way. Though groups can be nested, the most
      // useful to hide is almost certainly the topmost, so that's what we do.

      var match = (0, (_findPaneAndItem2 || _findPaneAndItem()).default)(function (item) {
        return getGadgetId(item) === gadgetId;
      });

      // If the gadget isn't present, no biggie; just no-op.
      if (match == null) {
        return;
      }

      var gadgetItem = match.item;
      var parentPane = match.pane;

      var containerToHide = (0, (_getContainerToHide2 || _getContainerToHide()).default)(parentPane);

      // If gadget is at the top level "hiding" is kind of a murky concept but we'll take it to mean
      // "close."
      if (containerToHide == null) {
        parentPane.destroyItem(gadgetItem);

        // TODO: Store the location of the closed pane for serialization so we can reopen this
        //       gadget there next time. (This isn't necessary if the gadget's default location is
        //       at the top, but is if it was moved there.)
        return;
      }

      (_ContainerVisibility2 || _ContainerVisibility()).hide(containerToHide);
    }
  }, {
    key: 'registerGadget',
    value: function registerGadget(gadget) {
      // Wrap the gadget so it has Atom-specific stuff.
      gadget = (0, (_wrapGadget2 || _wrapGadget()).default)(gadget);

      this._observer.next({
        type: (_ActionTypes2 || _ActionTypes()).REGISTER_GADGET,
        payload: { gadget: gadget }
      });
    }

    /**
     * Make sure all of the pane items reflect the current state of the app.
     */
  }, {
    key: 'renderPaneItems',
    value: function renderPaneItems() {
      var _this = this;

      var state = this._getState();

      atom.workspace.getPanes().forEach(function (pane) {
        var items = pane.getItems();
        var activeItem = pane.getActiveItem();

        // Iterate in reverse so that we can't get tripped up by the items we're adding.
        for (var index = items.length - 1; index >= 0; index--) {
          var item = items[index];

          // If the item is a placeholder, try to replace it. If we were successful, then we know
          // the item is up-to-date, so there's no need to update it and we can move on to the
          // next item.
          if (_this.replacePlaceholder(item, pane, index) != null) {
            continue;
          }

          var GadgetComponent = state.get('components').get(item);

          // If there's no component for this item, it isn't a gadget.
          if (GadgetComponent == null) {
            continue;
          }

          // Update the props for the item.
          var oldProps = state.get('props').get(item);
          var newProps = _extends({}, oldProps, {
            active: item === activeItem
          });

          // Don't re-render if the props haven't changed.
          if ((0, (_shallowequal2 || _shallowequal()).default)(oldProps, newProps)) {
            continue;
          }

          // Re-render the item with the new props.
          (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(GadgetComponent, newProps), item.element);

          _this._observer.next({
            type: (_ActionTypes2 || _ActionTypes()).UPDATE_PANE_ITEM,
            payload: {
              item: item,
              props: newProps
            }
          });
        }
      });
    }

    /**
     * Replace the item if it is a placeholder, returning the new item.
     */
  }, {
    key: 'replacePlaceholder',
    value: function replacePlaceholder(item, pane, index) {
      if (!(item instanceof (_GadgetPlaceholder2 || _GadgetPlaceholder()).default)) {
        return null;
      }

      var gadgetId = item.getGadgetId();
      var gadget = this._getState().get('gadgets').get(gadgetId);

      if (gadget == null) {
        // Still don't have the gadget.
        return null;
      }

      // Now that we have the gadget, we can deserialize the state. **IMPORTANT:** if it
      // doesn't have any (e.g. it's `== null`) that's okay! It allows components to provide a
      // default initial state in their constructor; for example:
      //
      //     constructor(props) {
      //       super(props);
      //       this.state = props.initialState || {count: 1};
      //     }
      var rawInitialGadgetState = item.getRawInitialGadgetState();
      var initialState = typeof gadget.deserializeState === 'function' ? gadget.deserializeState(rawInitialGadgetState) : rawInitialGadgetState;

      var active = pane.getActiveItem() === item;
      var realItem = this.createPaneItem(gadgetId, { initialState: initialState, active: active }, false);

      if (realItem == null) {
        return;
      }

      // Copy the metadata about the container from the placeholder.
      // TODO(matthewwithanm): Decide how to assign `_expandedFlexScale` to `HTMLElement` to remove
      //   this `any` cast.
      realItem._expandedFlexScale = item._expandedFlexScale;

      // Replace the placeholder with the real item. We'll add the real item first and then
      // remove the old one so that we don't risk dropping down to zero items.
      pane.addItem(realItem, { index: index + 1 });
      pane.destroyItem(item);
      if (active) {
        pane.setActiveItem(realItem);
      }

      return realItem;
    }

    /**
     * Ensure that a gadget of the specified gadgetId is visible, creating one if necessary.
     */
  }, {
    key: 'showGadget',
    value: function showGadget(gadgetId) {
      var match = (0, (_findPaneAndItem2 || _findPaneAndItem()).default)(function (item) {
        return getGadgetId(item) === gadgetId;
      });

      if (match == null) {
        // If the gadget isn't in the workspace, create it.
        var newItem = this.createPaneItem(gadgetId);

        if (newItem == null) {
          return;
        }

        var gadget = this._getState().get('gadgets').get(gadgetId);
        var defaultLocation = gadget.defaultLocation || 'active-pane';
        var _pane = (0, (_findOrCreatePaneItemLocation2 || _findOrCreatePaneItemLocation()).default)(defaultLocation);
        _pane.addItem(newItem);
        _pane.activateItem(newItem);
        return newItem;
      }

      var item = match.item;
      var pane = match.pane;

      pane.activateItem(item);

      // If the item isn't in a hidable container (i.e. it's a top-level pane item), we're done.
      var hiddenContainer = (0, (_getContainerToHide2 || _getContainerToHide()).default)(pane);
      if (hiddenContainer == null) {
        return item;
      }

      // Show all of the containers recursively up the tree.
      for (var container of (0, (_getResizableContainers2 || _getResizableContainers()).default)(hiddenContainer)) {
        (_ContainerVisibility2 || _ContainerVisibility()).show(container);
      }

      return item;
    }
  }, {
    key: 'toggleGadget',
    value: function toggleGadget(gadgetId) {
      // Show the gadget if it doesn't already exist in the workspace.
      var match = (0, (_findPaneAndItem2 || _findPaneAndItem()).default)(function (item) {
        return getGadgetId(item) === gadgetId;
      });
      if (match == null) {
        this.showGadget(gadgetId);
        return;
      }

      var pane = match.pane;

      // Show the gadget if it's hidden.
      for (var container of (0, (_getResizableContainers2 || _getResizableContainers()).default)(pane)) {
        if ((_ContainerVisibility2 || _ContainerVisibility()).isHidden(container)) {
          this.showGadget(gadgetId);
          return;
        }
      }

      this.hideGadget(gadgetId);
    }
  }, {
    key: 'unregisterGadget',
    value: function unregisterGadget(gadgetId) {
      this._observer.next({
        type: (_ActionTypes2 || _ActionTypes()).UNREGISTER_GADGET,
        payload: { gadgetId: gadgetId }
      });
    }

    /**
     * Update the provided container's expanded flex scale to its current flex scale.
     */
  }, {
    key: 'updateExpandedFlexScale',
    value: function updateExpandedFlexScale(container) {
      var flexScale = container.getFlexScale();

      // If the flex scale is zero, the container isn't expanded.
      if (flexScale === 0) {
        return;
      }

      (_ExpandedFlexScale2 || _ExpandedFlexScale()).set(container, flexScale);
    }
  }]);

  return Commands;
})();

exports.default = Commands;

function getGadgetId(item) {
  return item.getGadgetId ? item.getGadgetId() : item.constructor.gadgetId;
}
module.exports = exports.default;