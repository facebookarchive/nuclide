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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ActionTypes = require('./ActionTypes');

var ActionTypes = _interopRequireWildcard(_ActionTypes);

var _ContainerVisibility = require('./ContainerVisibility');

var ContainerVisibility = _interopRequireWildcard(_ContainerVisibility);

var _createComponentItem = require('./createComponentItem');

var _createComponentItem2 = _interopRequireDefault(_createComponentItem);

var _ExpandedFlexScale = require('./ExpandedFlexScale');

var ExpandedFlexScale = _interopRequireWildcard(_ExpandedFlexScale);

var _findOrCreatePaneItemLocation = require('./findOrCreatePaneItemLocation');

var _findOrCreatePaneItemLocation2 = _interopRequireDefault(_findOrCreatePaneItemLocation);

var _findPaneAndItem = require('./findPaneAndItem');

var _findPaneAndItem2 = _interopRequireDefault(_findPaneAndItem);

var _getContainerToHide = require('./getContainerToHide');

var _getContainerToHide2 = _interopRequireDefault(_getContainerToHide);

var _getResizableContainers = require('./getResizableContainers');

var _getResizableContainers2 = _interopRequireDefault(_getResizableContainers);

var _GadgetPlaceholder = require('./GadgetPlaceholder');

var _GadgetPlaceholder2 = _interopRequireDefault(_GadgetPlaceholder);

var _reactForAtom = require('react-for-atom');

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _wrapGadget = require('./wrapGadget');

var _wrapGadget2 = _interopRequireDefault(_wrapGadget);

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
        type: ActionTypes.DEACTIVATE
      });
      this._observer.complete();
    }
  }, {
    key: 'destroyGadget',
    value: function destroyGadget(gadgetId) {
      var match = (0, _findPaneAndItem2['default'])(function (item) {
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

      _reactForAtom.ReactDOM.unmountComponentAtNode(item.element);

      this._observer.next({
        type: ActionTypes.DESTROY_PANE_ITEM,
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
      var item = (0, _createComponentItem2['default'])(_reactForAtom.React.createElement(GadgetComponent, props));

      this._observer.next({
        type: ActionTypes.CREATE_PANE_ITEM,
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

      var match = (0, _findPaneAndItem2['default'])(function (item) {
        return getGadgetId(item) === gadgetId;
      });

      // If the gadget isn't present, no biggie; just no-op.
      if (match == null) {
        return;
      }

      var gadgetItem = match.item;
      var parentPane = match.pane;

      var containerToHide = (0, _getContainerToHide2['default'])(parentPane);

      // If gadget is at the top level "hiding" is kind of a murky concept but we'll take it to mean
      // "close."
      if (containerToHide == null) {
        parentPane.destroyItem(gadgetItem);

        // TODO: Store the location of the closed pane for serialization so we can reopen this
        //       gadget there next time. (This isn't necessary if the gadget's default location is
        //       at the top, but is if it was moved there.)
        return;
      }

      ContainerVisibility.hide(containerToHide);
    }
  }, {
    key: 'registerGadget',
    value: function registerGadget(gadget) {
      // Wrap the gadget so it has Atom-specific stuff.
      gadget = (0, _wrapGadget2['default'])(gadget);

      this._observer.next({
        type: ActionTypes.REGISTER_GADGET,
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
          if ((0, _shallowequal2['default'])(oldProps, newProps)) {
            continue;
          }

          // Re-render the item with the new props.
          _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(GadgetComponent, newProps), item.element);

          // $FlowIssue(t10268095)
          _this._observer.next({
            type: ActionTypes.UPDATE_PANE_ITEM,
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
      if (!(item instanceof _GadgetPlaceholder2['default'])) {
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
      pane.addItem(realItem, index + 1);
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
      var match = (0, _findPaneAndItem2['default'])(function (item) {
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
        var _pane = (0, _findOrCreatePaneItemLocation2['default'])(defaultLocation);
        _pane.addItem(newItem);
        _pane.activateItem(newItem);
        return newItem;
      }

      var item = match.item;
      var pane = match.pane;

      pane.activateItem(item);

      // If the item isn't in a hidable container (i.e. it's a top-level pane item), we're done.
      var hiddenContainer = (0, _getContainerToHide2['default'])(pane);
      if (hiddenContainer == null) {
        return item;
      }

      // Show all of the containers recursively up the tree.
      for (var container of (0, _getResizableContainers2['default'])(hiddenContainer)) {
        ContainerVisibility.show(container);
      }

      return item;
    }
  }, {
    key: 'toggleGadget',
    value: function toggleGadget(gadgetId) {
      // Show the gadget if it doesn't already exist in the workspace.
      var match = (0, _findPaneAndItem2['default'])(function (item) {
        return getGadgetId(item) === gadgetId;
      });
      if (match == null) {
        this.showGadget(gadgetId);
        return;
      }

      var pane = match.pane;

      // Show the gadget if it's hidden.
      for (var container of (0, _getResizableContainers2['default'])(pane)) {
        if (ContainerVisibility.isHidden(container)) {
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
        type: ActionTypes.UNREGISTER_GADGET,
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

      ExpandedFlexScale.set(container, flexScale);
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;

function getGadgetId(item) {
  return item.getGadgetId ? item.getGadgetId() : item.constructor.gadgetId;
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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T0FDUjs7VUFFTSxJQUFJLEdBQUksS0FBSyxDQUFiLElBQUk7OztBQUdYLFdBQUssSUFBTSxTQUFTLElBQUkseUNBQXVCLElBQUksQ0FBQyxFQUFFO0FBQ3BELFlBQUksbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzNDLGNBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUIsaUJBQU87U0FDUjtPQUNGOztBQUVELFVBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0I7OztXQUVlLDBCQUFDLFFBQWdCLEVBQVE7QUFDdkMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDbEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxpQkFBaUI7QUFDbkMsZUFBTyxFQUFFLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBQztPQUNwQixDQUFDLENBQUM7S0FDSjs7Ozs7OztXQUtzQixpQ0FBQyxTQUE0QixFQUFRO0FBQzFELFVBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7O0FBRzNDLFVBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtBQUNuQixlQUFPO09BQ1I7O0FBRUQsdUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3Qzs7O1NBOVNrQixRQUFROzs7cUJBQVIsUUFBUTs7QUFrVDdCLFNBQVMsV0FBVyxDQUFDLElBQVksRUFBVTtBQUN6QyxTQUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0NBQzFFIiwiZmlsZSI6IkNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldCwgR2FkZ2V0TG9jYXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHR5cGUge1BhbmVJdGVtQ29udGFpbmVyfSBmcm9tICcuLi90eXBlcy9QYW5lSXRlbUNvbnRhaW5lcic7XG5pbXBvcnQgdHlwZSB7QWN0aW9ufSBmcm9tICcuLi90eXBlcy9BY3Rpb24nO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCAqIGFzIENvbnRhaW5lclZpc2liaWxpdHkgZnJvbSAnLi9Db250YWluZXJWaXNpYmlsaXR5JztcbmltcG9ydCBjcmVhdGVDb21wb25lbnRJdGVtIGZyb20gJy4vY3JlYXRlQ29tcG9uZW50SXRlbSc7XG5pbXBvcnQgKiBhcyBFeHBhbmRlZEZsZXhTY2FsZSBmcm9tICcuL0V4cGFuZGVkRmxleFNjYWxlJztcbmltcG9ydCBmaW5kT3JDcmVhdGVQYW5lSXRlbUxvY2F0aW9uIGZyb20gJy4vZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbic7XG5pbXBvcnQgZmluZFBhbmVBbmRJdGVtIGZyb20gJy4vZmluZFBhbmVBbmRJdGVtJztcbmltcG9ydCBnZXRDb250YWluZXJUb0hpZGUgZnJvbSAnLi9nZXRDb250YWluZXJUb0hpZGUnO1xuaW1wb3J0IGdldFJlc2l6YWJsZUNvbnRhaW5lcnMgZnJvbSAnLi9nZXRSZXNpemFibGVDb250YWluZXJzJztcbmltcG9ydCBHYWRnZXRQbGFjZWhvbGRlciBmcm9tICcuL0dhZGdldFBsYWNlaG9sZGVyJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHNoYWxsb3dFcXVhbCBmcm9tICdzaGFsbG93ZXF1YWwnO1xuaW1wb3J0IHdyYXBHYWRnZXQgZnJvbSAnLi93cmFwR2FkZ2V0JztcblxuLyoqXG4gKiBDcmVhdGUgYW4gb2JqZWN0IHRoYXQgcHJvdmlkZXMgY29tbWFuZHMgKFwiYWN0aW9uIGNyZWF0b3JzXCIpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcblxuICBfb2JzZXJ2ZXI6IHJ4JElPYnNlcnZlcjxBY3Rpb24+O1xuICBfZ2V0U3RhdGU6ICgpID0+IEltbXV0YWJsZS5NYXA7XG5cbiAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6IHJ4JElPYnNlcnZlcjxBY3Rpb24+LCBnZXRTdGF0ZTogKCkgPT4gSW1tdXRhYmxlLk1hcCkge1xuICAgIHRoaXMuX29ic2VydmVyID0gb2JzZXJ2ZXI7XG4gICAgdGhpcy5fZ2V0U3RhdGUgPSBnZXRTdGF0ZTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERUFDVElWQVRFLFxuICAgIH0pO1xuICAgIHRoaXMuX29ic2VydmVyLmNvbXBsZXRlKCk7XG4gIH1cblxuICBkZXN0cm95R2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbWF0Y2gucGFuZS5kZXN0cm95SXRlbShtYXRjaC5pdGVtKTtcbiAgfVxuXG4gIGNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2dldFN0YXRlKCkuZ2V0KCdjb21wb25lbnRzJykuaGFzKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShpdGVtLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIubmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERVNUUk9ZX1BBTkVfSVRFTSxcbiAgICAgIHBheWxvYWQ6IHtpdGVtfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHBhbmUgaXRlbSBmb3IgdGhlIHNwZWNpZmllZCBnYWRnZXQuIFRoaXMgaXMgbWVhbnQgdG8gYmUgdGhlIHNpbmdsZSBwb2ludFxuICAgKiB0aHJvdWdoIHdoaWNoIGFsbCBwYW5lIGl0ZW0gY3JlYXRpb24gZ29lcyAobmV3IHBhbmUgaXRlbSBjcmVhdGlvbiwgZGVzZXJpYWxpemF0aW9uLFxuICAgKiBzcGxpdHRpbmcsIHJlb3BlbmluZywgZXRjLikuXG4gICAqL1xuICBjcmVhdGVQYW5lSXRlbShnYWRnZXRJZDogc3RyaW5nLCBwcm9wcz86IE9iamVjdCwgaXNOZXc6IGJvb2xlYW4gPSB0cnVlKTogP0hUTUxFbGVtZW50IHtcbiAgICAvLyBMb29rIHVwIHRoZSBnYWRnZXQuXG4gICAgY29uc3QgZ2FkZ2V0ID0gdGhpcy5fZ2V0U3RhdGUoKS5nZXQoJ2dhZGdldHMnKS5nZXQoZ2FkZ2V0SWQpO1xuXG4gICAgLy8gSWYgdGhlcmUncyBubyBnYWRnZXQgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwcm92aWRlZCBJRCwgYWJvcnQuIE1heWJlIHRoZSB1c2VyIGp1c3RcbiAgICAvLyBkZWFjdGl2YXRlZCB0aGF0IHBhY2thZ2UuXG4gICAgaWYgKGdhZGdldCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgR2FkZ2V0Q29tcG9uZW50ID0gZ2FkZ2V0O1xuICAgIGNvbnN0IGl0ZW0gPSBjcmVhdGVDb21wb25lbnRJdGVtKDxHYWRnZXRDb21wb25lbnQgey4uLnByb3BzfSAvPik7XG5cbiAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLkNSRUFURV9QQU5FX0lURU0sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGNvbXBvbmVudDogR2FkZ2V0Q29tcG9uZW50LFxuICAgICAgICBnYWRnZXRJZCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIGlzTmV3LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgaGlkZUdhZGdldChnYWRnZXRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gSGlkaW5nIGEgZ2FkZ2V0IGRvZXNuJ3QganVzdCBtZWFuIGNsb3NpbmcgaXRzIHBhbmU7IGl0IG1lYW5zIGdldHRpbmcgaXQgb3V0IG9mIHRoZSB3YXkuXG4gICAgLy8gSnVzdCBjbG9zaW5nIGl0cyBwYW5lIGFuZCB3b3VsZCBwb3RlbnRpYWxseSBsZWF2ZSBzaWJsaW5ncyB3aGljaCwgcHJlc3VtYWJseSwgdGhlIHVzZXJcbiAgICAvLyB3b3VsZCB0aGVuIGhhdmUgdG8gYWxzbyBjbG9zZS4gSW5zdGVhZCwgaXQncyBtb3JlIHVzZWZ1bCB0byBpZGVudGlmeSB0aGUgZ3JvdXAgb2YgZ2FkZ2V0c1xuICAgIC8vIHRvIHdoaWNoIHRoaXMgb25lIGJlbG9uZ3MgYW5kIGdldCBpdCBvdXQgb2YgdGhlIHdheS4gVGhvdWdoIGdyb3VwcyBjYW4gYmUgbmVzdGVkLCB0aGUgbW9zdFxuICAgIC8vIHVzZWZ1bCB0byBoaWRlIGlzIGFsbW9zdCBjZXJ0YWlubHkgdGhlIHRvcG1vc3QsIHNvIHRoYXQncyB3aGF0IHdlIGRvLlxuXG4gICAgY29uc3QgbWF0Y2ggPSBmaW5kUGFuZUFuZEl0ZW0oaXRlbSA9PiBnZXRHYWRnZXRJZChpdGVtKSA9PT0gZ2FkZ2V0SWQpO1xuXG4gICAgLy8gSWYgdGhlIGdhZGdldCBpc24ndCBwcmVzZW50LCBubyBiaWdnaWU7IGp1c3Qgbm8tb3AuXG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7aXRlbTogZ2FkZ2V0SXRlbSwgcGFuZTogcGFyZW50UGFuZX0gPSBtYXRjaDtcbiAgICBjb25zdCBjb250YWluZXJUb0hpZGUgPSBnZXRDb250YWluZXJUb0hpZGUocGFyZW50UGFuZSk7XG5cbiAgICAvLyBJZiBnYWRnZXQgaXMgYXQgdGhlIHRvcCBsZXZlbCBcImhpZGluZ1wiIGlzIGtpbmQgb2YgYSBtdXJreSBjb25jZXB0IGJ1dCB3ZSdsbCB0YWtlIGl0IHRvIG1lYW5cbiAgICAvLyBcImNsb3NlLlwiXG4gICAgaWYgKGNvbnRhaW5lclRvSGlkZSA9PSBudWxsKSB7XG4gICAgICBwYXJlbnRQYW5lLmRlc3Ryb3lJdGVtKGdhZGdldEl0ZW0pO1xuXG4gICAgICAvLyBUT0RPOiBTdG9yZSB0aGUgbG9jYXRpb24gb2YgdGhlIGNsb3NlZCBwYW5lIGZvciBzZXJpYWxpemF0aW9uIHNvIHdlIGNhbiByZW9wZW4gdGhpc1xuICAgICAgLy8gICAgICAgZ2FkZ2V0IHRoZXJlIG5leHQgdGltZS4gKFRoaXMgaXNuJ3QgbmVjZXNzYXJ5IGlmIHRoZSBnYWRnZXQncyBkZWZhdWx0IGxvY2F0aW9uIGlzXG4gICAgICAvLyAgICAgICBhdCB0aGUgdG9wLCBidXQgaXMgaWYgaXQgd2FzIG1vdmVkIHRoZXJlLilcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDb250YWluZXJWaXNpYmlsaXR5LmhpZGUoY29udGFpbmVyVG9IaWRlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyR2FkZ2V0KGdhZGdldDogR2FkZ2V0KTogdm9pZCB7XG4gICAgLy8gV3JhcCB0aGUgZ2FkZ2V0IHNvIGl0IGhhcyBBdG9tLXNwZWNpZmljIHN0dWZmLlxuICAgIGdhZGdldCA9IHdyYXBHYWRnZXQoZ2FkZ2V0KTtcblxuICAgIHRoaXMuX29ic2VydmVyLm5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuUkVHSVNURVJfR0FER0VULFxuICAgICAgcGF5bG9hZDoge2dhZGdldH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBzdXJlIGFsbCBvZiB0aGUgcGFuZSBpdGVtcyByZWZsZWN0IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHAuXG4gICAqL1xuICByZW5kZXJQYW5lSXRlbXMoKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9nZXRTdGF0ZSgpO1xuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgLmZvckVhY2gocGFuZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gcGFuZS5nZXRJdGVtcygpO1xuICAgICAgICBjb25zdCBhY3RpdmVJdGVtID0gcGFuZS5nZXRBY3RpdmVJdGVtKCk7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBpbiByZXZlcnNlIHNvIHRoYXQgd2UgY2FuJ3QgZ2V0IHRyaXBwZWQgdXAgYnkgdGhlIGl0ZW1zIHdlJ3JlIGFkZGluZy5cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSBpdGVtcy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XTtcblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVtIGlzIGEgcGxhY2Vob2xkZXIsIHRyeSB0byByZXBsYWNlIGl0LiBJZiB3ZSB3ZXJlIHN1Y2Nlc3NmdWwsIHRoZW4gd2Uga25vd1xuICAgICAgICAgIC8vIHRoZSBpdGVtIGlzIHVwLXRvLWRhdGUsIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byB1cGRhdGUgaXQgYW5kIHdlIGNhbiBtb3ZlIG9uIHRvIHRoZVxuICAgICAgICAgIC8vIG5leHQgaXRlbS5cbiAgICAgICAgICBpZiAodGhpcy5yZXBsYWNlUGxhY2Vob2xkZXIoaXRlbSwgcGFuZSwgaW5kZXgpICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IEdhZGdldENvbXBvbmVudCA9IHN0YXRlLmdldCgnY29tcG9uZW50cycpLmdldChpdGVtKTtcblxuICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gY29tcG9uZW50IGZvciB0aGlzIGl0ZW0sIGl0IGlzbid0IGEgZ2FkZ2V0LlxuICAgICAgICAgIGlmIChHYWRnZXRDb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwcm9wcyBmb3IgdGhlIGl0ZW0uXG4gICAgICAgICAgY29uc3Qgb2xkUHJvcHMgPSBzdGF0ZS5nZXQoJ3Byb3BzJykuZ2V0KGl0ZW0pO1xuICAgICAgICAgIGNvbnN0IG5ld1Byb3BzID0ge1xuICAgICAgICAgICAgLi4ub2xkUHJvcHMsXG4gICAgICAgICAgICBhY3RpdmU6IGl0ZW0gPT09IGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIERvbid0IHJlLXJlbmRlciBpZiB0aGUgcHJvcHMgaGF2ZW4ndCBjaGFuZ2VkLlxuICAgICAgICAgIGlmIChzaGFsbG93RXF1YWwob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmUtcmVuZGVyIHRoZSBpdGVtIHdpdGggdGhlIG5ldyBwcm9wcy5cbiAgICAgICAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgICAgICA8R2FkZ2V0Q29tcG9uZW50IHsuLi5uZXdQcm9wc30gLz4sXG4gICAgICAgICAgICBpdGVtLmVsZW1lbnQsXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vICRGbG93SXNzdWUodDEwMjY4MDk1KVxuICAgICAgICAgIHRoaXMuX29ic2VydmVyLm5leHQoe1xuICAgICAgICAgICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX1BBTkVfSVRFTSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgcHJvcHM6IG5ld1Byb3BzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgaXRlbSBpZiBpdCBpcyBhIHBsYWNlaG9sZGVyLCByZXR1cm5pbmcgdGhlIG5ldyBpdGVtLlxuICAgKi9cbiAgcmVwbGFjZVBsYWNlaG9sZGVyKGl0ZW06IE9iamVjdCwgcGFuZTogYXRvbSRQYW5lLCBpbmRleDogbnVtYmVyKTogP09iamVjdCB7XG4gICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEdhZGdldFBsYWNlaG9sZGVyKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZ2FkZ2V0SWQgPSBpdGVtLmdldEdhZGdldElkKCk7XG4gICAgY29uc3QgZ2FkZ2V0ID0gdGhpcy5fZ2V0U3RhdGUoKS5nZXQoJ2dhZGdldHMnKS5nZXQoZ2FkZ2V0SWQpO1xuXG4gICAgaWYgKGdhZGdldCA9PSBudWxsKSB7XG4gICAgICAvLyBTdGlsbCBkb24ndCBoYXZlIHRoZSBnYWRnZXQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIHRoZSBnYWRnZXQsIHdlIGNhbiBkZXNlcmlhbGl6ZSB0aGUgc3RhdGUuICoqSU1QT1JUQU5UOioqIGlmIGl0XG4gICAgLy8gZG9lc24ndCBoYXZlIGFueSAoZS5nLiBpdCdzIGA9PSBudWxsYCkgdGhhdCdzIG9rYXkhIEl0IGFsbG93cyBjb21wb25lbnRzIHRvIHByb3ZpZGUgYVxuICAgIC8vIGRlZmF1bHQgaW5pdGlhbCBzdGF0ZSBpbiB0aGVpciBjb25zdHJ1Y3RvcjsgZm9yIGV4YW1wbGU6XG4gICAgLy9cbiAgICAvLyAgICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAvLyAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgLy8gICAgICAgdGhpcy5zdGF0ZSA9IHByb3BzLmluaXRpYWxTdGF0ZSB8fCB7Y291bnQ6IDF9O1xuICAgIC8vICAgICB9XG4gICAgY29uc3QgcmF3SW5pdGlhbEdhZGdldFN0YXRlID0gaXRlbS5nZXRSYXdJbml0aWFsR2FkZ2V0U3RhdGUoKTtcbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSAoXG4gICAgICB0eXBlb2YgZ2FkZ2V0LmRlc2VyaWFsaXplU3RhdGUgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBnYWRnZXQuZGVzZXJpYWxpemVTdGF0ZShyYXdJbml0aWFsR2FkZ2V0U3RhdGUpIDogcmF3SW5pdGlhbEdhZGdldFN0YXRlXG4gICAgKTtcblxuICAgIGNvbnN0IGFjdGl2ZSA9IHBhbmUuZ2V0QWN0aXZlSXRlbSgpID09PSBpdGVtO1xuICAgIGNvbnN0IHJlYWxJdGVtID0gdGhpcy5jcmVhdGVQYW5lSXRlbShnYWRnZXRJZCwge2luaXRpYWxTdGF0ZSwgYWN0aXZlfSwgZmFsc2UpO1xuXG4gICAgaWYgKHJlYWxJdGVtID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBtZXRhZGF0YSBhYm91dCB0aGUgY29udGFpbmVyIGZyb20gdGhlIHBsYWNlaG9sZGVyLlxuICAgIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBEZWNpZGUgaG93IHRvIGFzc2lnbiBgX2V4cGFuZGVkRmxleFNjYWxlYCB0byBgSFRNTEVsZW1lbnRgIHRvIHJlbW92ZVxuICAgIC8vICAgdGhpcyBgYW55YCBjYXN0LlxuICAgIChyZWFsSXRlbTogYW55KS5fZXhwYW5kZWRGbGV4U2NhbGUgPSBpdGVtLl9leHBhbmRlZEZsZXhTY2FsZTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIHBsYWNlaG9sZGVyIHdpdGggdGhlIHJlYWwgaXRlbS4gV2UnbGwgYWRkIHRoZSByZWFsIGl0ZW0gZmlyc3QgYW5kIHRoZW5cbiAgICAvLyByZW1vdmUgdGhlIG9sZCBvbmUgc28gdGhhdCB3ZSBkb24ndCByaXNrIGRyb3BwaW5nIGRvd24gdG8gemVybyBpdGVtcy5cbiAgICBwYW5lLmFkZEl0ZW0ocmVhbEl0ZW0sIGluZGV4ICsgMSk7XG4gICAgcGFuZS5kZXN0cm95SXRlbShpdGVtKTtcbiAgICBpZiAoYWN0aXZlKSB7XG4gICAgICBwYW5lLnNldEFjdGl2ZUl0ZW0ocmVhbEl0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiByZWFsSXRlbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCBhIGdhZGdldCBvZiB0aGUgc3BlY2lmaWVkIGdhZGdldElkIGlzIHZpc2libGUsIGNyZWF0aW5nIG9uZSBpZiBuZWNlc3NhcnkuXG4gICAqL1xuICBzaG93R2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiA/T2JqZWN0IHtcbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG5cbiAgICBpZiAobWF0Y2ggPT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlIGdhZGdldCBpc24ndCBpbiB0aGUgd29ya3NwYWNlLCBjcmVhdGUgaXQuXG4gICAgICBjb25zdCBuZXdJdGVtID0gdGhpcy5jcmVhdGVQYW5lSXRlbShnYWRnZXRJZCk7XG5cbiAgICAgIGlmIChuZXdJdGVtID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnYWRnZXQgPSB0aGlzLl9nZXRTdGF0ZSgpLmdldCgnZ2FkZ2V0cycpLmdldChnYWRnZXRJZCk7XG4gICAgICBjb25zdCBkZWZhdWx0TG9jYXRpb246IEdhZGdldExvY2F0aW9uID0gZ2FkZ2V0LmRlZmF1bHRMb2NhdGlvbiB8fCAnYWN0aXZlLXBhbmUnO1xuICAgICAgY29uc3QgcGFuZSA9IGZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24oZGVmYXVsdExvY2F0aW9uKTtcbiAgICAgIHBhbmUuYWRkSXRlbShuZXdJdGVtKTtcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG5ld0l0ZW0pO1xuICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgfVxuXG4gICAgY29uc3Qge2l0ZW0sIHBhbmV9ID0gbWF0Y2g7XG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSk7XG5cbiAgICAvLyBJZiB0aGUgaXRlbSBpc24ndCBpbiBhIGhpZGFibGUgY29udGFpbmVyIChpLmUuIGl0J3MgYSB0b3AtbGV2ZWwgcGFuZSBpdGVtKSwgd2UncmUgZG9uZS5cbiAgICBjb25zdCBoaWRkZW5Db250YWluZXIgPSBnZXRDb250YWluZXJUb0hpZGUocGFuZSk7XG4gICAgaWYgKGhpZGRlbkNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICAvLyBTaG93IGFsbCBvZiB0aGUgY29udGFpbmVycyByZWN1cnNpdmVseSB1cCB0aGUgdHJlZS5cbiAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiBnZXRSZXNpemFibGVDb250YWluZXJzKGhpZGRlbkNvbnRhaW5lcikpIHtcbiAgICAgIENvbnRhaW5lclZpc2liaWxpdHkuc2hvdyhjb250YWluZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgdG9nZ2xlR2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBTaG93IHRoZSBnYWRnZXQgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIHRoZSB3b3Jrc3BhY2UuXG4gICAgY29uc3QgbWF0Y2ggPSBmaW5kUGFuZUFuZEl0ZW0oaXRlbSA9PiBnZXRHYWRnZXRJZChpdGVtKSA9PT0gZ2FkZ2V0SWQpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnNob3dHYWRnZXQoZ2FkZ2V0SWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtwYW5lfSA9IG1hdGNoO1xuXG4gICAgLy8gU2hvdyB0aGUgZ2FkZ2V0IGlmIGl0J3MgaGlkZGVuLlxuICAgIGZvciAoY29uc3QgY29udGFpbmVyIG9mIGdldFJlc2l6YWJsZUNvbnRhaW5lcnMocGFuZSkpIHtcbiAgICAgIGlmIChDb250YWluZXJWaXNpYmlsaXR5LmlzSGlkZGVuKGNvbnRhaW5lcikpIHtcbiAgICAgICAgdGhpcy5zaG93R2FkZ2V0KGdhZGdldElkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaGlkZUdhZGdldChnYWRnZXRJZCk7XG4gIH1cblxuICB1bnJlZ2lzdGVyR2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5uZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlVOUkVHSVNURVJfR0FER0VULFxuICAgICAgcGF5bG9hZDoge2dhZGdldElkfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHByb3ZpZGVkIGNvbnRhaW5lcidzIGV4cGFuZGVkIGZsZXggc2NhbGUgdG8gaXRzIGN1cnJlbnQgZmxleCBzY2FsZS5cbiAgICovXG4gIHVwZGF0ZUV4cGFuZGVkRmxleFNjYWxlKGNvbnRhaW5lcjogUGFuZUl0ZW1Db250YWluZXIpOiB2b2lkIHtcbiAgICBjb25zdCBmbGV4U2NhbGUgPSBjb250YWluZXIuZ2V0RmxleFNjYWxlKCk7XG5cbiAgICAvLyBJZiB0aGUgZmxleCBzY2FsZSBpcyB6ZXJvLCB0aGUgY29udGFpbmVyIGlzbid0IGV4cGFuZGVkLlxuICAgIGlmIChmbGV4U2NhbGUgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBFeHBhbmRlZEZsZXhTY2FsZS5zZXQoY29udGFpbmVyLCBmbGV4U2NhbGUpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gZ2V0R2FkZ2V0SWQoaXRlbTogT2JqZWN0KTogc3RyaW5nIHtcbiAgcmV0dXJuIGl0ZW0uZ2V0R2FkZ2V0SWQgPyBpdGVtLmdldEdhZGdldElkKCkgOiBpdGVtLmNvbnN0cnVjdG9yLmdhZGdldElkO1xufVxuIl19