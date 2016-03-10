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
      this._observer.onNext({
        type: ActionTypes.DEACTIVATE
      });
      this._observer.onCompleted();
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

      this._observer.onNext({
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

      this._observer.onNext({
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

      this._observer.onNext({
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
          _this._observer.onNext({
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
      this._observer.onNext({
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
//# sourceMappingURL=data:application/json;base64,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T0FDUjs7VUFFTSxJQUFJLEdBQUksS0FBSyxDQUFiLElBQUk7OztBQUdYLFdBQUssSUFBTSxTQUFTLElBQUkseUNBQXVCLElBQUksQ0FBQyxFQUFFO0FBQ3BELFlBQUksbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzNDLGNBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUIsaUJBQU87U0FDUjtPQUNGOztBQUVELFVBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDM0I7OztXQUVlLDBCQUFDLFFBQWdCLEVBQVE7QUFDdkMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDcEIsWUFBSSxFQUFFLFdBQVcsQ0FBQyxpQkFBaUI7QUFDbkMsZUFBTyxFQUFFLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBQztPQUNwQixDQUFDLENBQUM7S0FDSjs7Ozs7OztXQUtzQixpQ0FBQyxTQUE0QixFQUFRO0FBQzFELFVBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7O0FBRzNDLFVBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtBQUNuQixlQUFPO09BQ1I7O0FBRUQsdUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3Qzs7O1NBOVNrQixRQUFROzs7cUJBQVIsUUFBUTs7QUFrVDdCLFNBQVMsV0FBVyxDQUFDLElBQVksRUFBVTtBQUN6QyxTQUFPLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0NBQzFFIiwiZmlsZSI6IkNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldCwgR2FkZ2V0TG9jYXRpb259IGZyb20gJy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB0eXBlIHtQYW5lSXRlbUNvbnRhaW5lcn0gZnJvbSAnLi4vdHlwZXMvUGFuZUl0ZW1Db250YWluZXInO1xuaW1wb3J0IHR5cGUge0FjdGlvbn0gZnJvbSAnLi4vdHlwZXMvQWN0aW9uJztcblxuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQgKiBhcyBDb250YWluZXJWaXNpYmlsaXR5IGZyb20gJy4vQ29udGFpbmVyVmlzaWJpbGl0eSc7XG5pbXBvcnQgY3JlYXRlQ29tcG9uZW50SXRlbSBmcm9tICcuL2NyZWF0ZUNvbXBvbmVudEl0ZW0nO1xuaW1wb3J0ICogYXMgRXhwYW5kZWRGbGV4U2NhbGUgZnJvbSAnLi9FeHBhbmRlZEZsZXhTY2FsZSc7XG5pbXBvcnQgZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbiBmcm9tICcuL2ZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24nO1xuaW1wb3J0IGZpbmRQYW5lQW5kSXRlbSBmcm9tICcuL2ZpbmRQYW5lQW5kSXRlbSc7XG5pbXBvcnQgZ2V0Q29udGFpbmVyVG9IaWRlIGZyb20gJy4vZ2V0Q29udGFpbmVyVG9IaWRlJztcbmltcG9ydCBnZXRSZXNpemFibGVDb250YWluZXJzIGZyb20gJy4vZ2V0UmVzaXphYmxlQ29udGFpbmVycyc7XG5pbXBvcnQgR2FkZ2V0UGxhY2Vob2xkZXIgZnJvbSAnLi9HYWRnZXRQbGFjZWhvbGRlcic7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBzaGFsbG93RXF1YWwgZnJvbSAnc2hhbGxvd2VxdWFsJztcbmltcG9ydCB3cmFwR2FkZ2V0IGZyb20gJy4vd3JhcEdhZGdldCc7XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCB0aGF0IHByb3ZpZGVzIGNvbW1hbmRzIChcImFjdGlvbiBjcmVhdG9yc1wiKVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kcyB7XG5cbiAgX29ic2VydmVyOiByeCRJT2JzZXJ2ZXI8QWN0aW9uPjtcbiAgX2dldFN0YXRlOiAoKSA9PiBJbW11dGFibGUuTWFwO1xuXG4gIGNvbnN0cnVjdG9yKG9ic2VydmVyOiByeCRJT2JzZXJ2ZXI8QWN0aW9uPiwgZ2V0U3RhdGU6ICgpID0+IEltbXV0YWJsZS5NYXApIHtcbiAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIHRoaXMuX2dldFN0YXRlID0gZ2V0U3RhdGU7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERUFDVElWQVRFLFxuICAgIH0pO1xuICAgIHRoaXMuX29ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gIH1cblxuICBkZXN0cm95R2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbWF0Y2gucGFuZS5kZXN0cm95SXRlbShtYXRjaC5pdGVtKTtcbiAgfVxuXG4gIGNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2dldFN0YXRlKCkuZ2V0KCdjb21wb25lbnRzJykuaGFzKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShpdGVtLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLkRFU1RST1lfUEFORV9JVEVNLFxuICAgICAgcGF5bG9hZDoge2l0ZW19LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgcGFuZSBpdGVtIGZvciB0aGUgc3BlY2lmaWVkIGdhZGdldC4gVGhpcyBpcyBtZWFudCB0byBiZSB0aGUgc2luZ2xlIHBvaW50XG4gICAqIHRocm91Z2ggd2hpY2ggYWxsIHBhbmUgaXRlbSBjcmVhdGlvbiBnb2VzIChuZXcgcGFuZSBpdGVtIGNyZWF0aW9uLCBkZXNlcmlhbGl6YXRpb24sXG4gICAqIHNwbGl0dGluZywgcmVvcGVuaW5nLCBldGMuKS5cbiAgICovXG4gIGNyZWF0ZVBhbmVJdGVtKGdhZGdldElkOiBzdHJpbmcsIHByb3BzPzogT2JqZWN0LCBpc05ldzogYm9vbGVhbiA9IHRydWUpOiA/SFRNTEVsZW1lbnQge1xuICAgIC8vIExvb2sgdXAgdGhlIGdhZGdldC5cbiAgICBjb25zdCBnYWRnZXQgPSB0aGlzLl9nZXRTdGF0ZSgpLmdldCgnZ2FkZ2V0cycpLmdldChnYWRnZXRJZCk7XG5cbiAgICAvLyBJZiB0aGVyZSdzIG5vIGdhZGdldCByZWdpc3RlcmVkIHdpdGggdGhlIHByb3ZpZGVkIElELCBhYm9ydC4gTWF5YmUgdGhlIHVzZXIganVzdFxuICAgIC8vIGRlYWN0aXZhdGVkIHRoYXQgcGFja2FnZS5cbiAgICBpZiAoZ2FkZ2V0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBHYWRnZXRDb21wb25lbnQgPSBnYWRnZXQ7XG4gICAgY29uc3QgaXRlbSA9IGNyZWF0ZUNvbXBvbmVudEl0ZW0oPEdhZGdldENvbXBvbmVudCB7Li4ucHJvcHN9IC8+KTtcblxuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5DUkVBVEVfUEFORV9JVEVNLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBjb21wb25lbnQ6IEdhZGdldENvbXBvbmVudCxcbiAgICAgICAgZ2FkZ2V0SWQsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIHByb3BzLFxuICAgICAgICBpc05ldyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuXG4gIGhpZGVHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIEhpZGluZyBhIGdhZGdldCBkb2Vzbid0IGp1c3QgbWVhbiBjbG9zaW5nIGl0cyBwYW5lOyBpdCBtZWFucyBnZXR0aW5nIGl0IG91dCBvZiB0aGUgd2F5LlxuICAgIC8vIEp1c3QgY2xvc2luZyBpdHMgcGFuZSBhbmQgd291bGQgcG90ZW50aWFsbHkgbGVhdmUgc2libGluZ3Mgd2hpY2gsIHByZXN1bWFibHksIHRoZSB1c2VyXG4gICAgLy8gd291bGQgdGhlbiBoYXZlIHRvIGFsc28gY2xvc2UuIEluc3RlYWQsIGl0J3MgbW9yZSB1c2VmdWwgdG8gaWRlbnRpZnkgdGhlIGdyb3VwIG9mIGdhZGdldHNcbiAgICAvLyB0byB3aGljaCB0aGlzIG9uZSBiZWxvbmdzIGFuZCBnZXQgaXQgb3V0IG9mIHRoZSB3YXkuIFRob3VnaCBncm91cHMgY2FuIGJlIG5lc3RlZCwgdGhlIG1vc3RcbiAgICAvLyB1c2VmdWwgdG8gaGlkZSBpcyBhbG1vc3QgY2VydGFpbmx5IHRoZSB0b3Btb3N0LCBzbyB0aGF0J3Mgd2hhdCB3ZSBkby5cblxuICAgIGNvbnN0IG1hdGNoID0gZmluZFBhbmVBbmRJdGVtKGl0ZW0gPT4gZ2V0R2FkZ2V0SWQoaXRlbSkgPT09IGdhZGdldElkKTtcblxuICAgIC8vIElmIHRoZSBnYWRnZXQgaXNuJ3QgcHJlc2VudCwgbm8gYmlnZ2llOyBqdXN0IG5vLW9wLlxuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2l0ZW06IGdhZGdldEl0ZW0sIHBhbmU6IHBhcmVudFBhbmV9ID0gbWF0Y2g7XG4gICAgY29uc3QgY29udGFpbmVyVG9IaWRlID0gZ2V0Q29udGFpbmVyVG9IaWRlKHBhcmVudFBhbmUpO1xuXG4gICAgLy8gSWYgZ2FkZ2V0IGlzIGF0IHRoZSB0b3AgbGV2ZWwgXCJoaWRpbmdcIiBpcyBraW5kIG9mIGEgbXVya3kgY29uY2VwdCBidXQgd2UnbGwgdGFrZSBpdCB0byBtZWFuXG4gICAgLy8gXCJjbG9zZS5cIlxuICAgIGlmIChjb250YWluZXJUb0hpZGUgPT0gbnVsbCkge1xuICAgICAgcGFyZW50UGFuZS5kZXN0cm95SXRlbShnYWRnZXRJdGVtKTtcblxuICAgICAgLy8gVE9ETzogU3RvcmUgdGhlIGxvY2F0aW9uIG9mIHRoZSBjbG9zZWQgcGFuZSBmb3Igc2VyaWFsaXphdGlvbiBzbyB3ZSBjYW4gcmVvcGVuIHRoaXNcbiAgICAgIC8vICAgICAgIGdhZGdldCB0aGVyZSBuZXh0IHRpbWUuIChUaGlzIGlzbid0IG5lY2Vzc2FyeSBpZiB0aGUgZ2FkZ2V0J3MgZGVmYXVsdCBsb2NhdGlvbiBpc1xuICAgICAgLy8gICAgICAgYXQgdGhlIHRvcCwgYnV0IGlzIGlmIGl0IHdhcyBtb3ZlZCB0aGVyZS4pXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ29udGFpbmVyVmlzaWJpbGl0eS5oaWRlKGNvbnRhaW5lclRvSGlkZSk7XG4gIH1cblxuICByZWdpc3RlckdhZGdldChnYWRnZXQ6IEdhZGdldCk6IHZvaWQge1xuICAgIC8vIFdyYXAgdGhlIGdhZGdldCBzbyBpdCBoYXMgQXRvbS1zcGVjaWZpYyBzdHVmZi5cbiAgICBnYWRnZXQgPSB3cmFwR2FkZ2V0KGdhZGdldCk7XG5cbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuUkVHSVNURVJfR0FER0VULFxuICAgICAgcGF5bG9hZDoge2dhZGdldH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBzdXJlIGFsbCBvZiB0aGUgcGFuZSBpdGVtcyByZWZsZWN0IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHAuXG4gICAqL1xuICByZW5kZXJQYW5lSXRlbXMoKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9nZXRTdGF0ZSgpO1xuXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgLmZvckVhY2gocGFuZSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gcGFuZS5nZXRJdGVtcygpO1xuICAgICAgICBjb25zdCBhY3RpdmVJdGVtID0gcGFuZS5nZXRBY3RpdmVJdGVtKCk7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBpbiByZXZlcnNlIHNvIHRoYXQgd2UgY2FuJ3QgZ2V0IHRyaXBwZWQgdXAgYnkgdGhlIGl0ZW1zIHdlJ3JlIGFkZGluZy5cbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSBpdGVtcy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG4gICAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XTtcblxuICAgICAgICAgIC8vIElmIHRoZSBpdGVtIGlzIGEgcGxhY2Vob2xkZXIsIHRyeSB0byByZXBsYWNlIGl0LiBJZiB3ZSB3ZXJlIHN1Y2Nlc3NmdWwsIHRoZW4gd2Uga25vd1xuICAgICAgICAgIC8vIHRoZSBpdGVtIGlzIHVwLXRvLWRhdGUsIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byB1cGRhdGUgaXQgYW5kIHdlIGNhbiBtb3ZlIG9uIHRvIHRoZVxuICAgICAgICAgIC8vIG5leHQgaXRlbS5cbiAgICAgICAgICBpZiAodGhpcy5yZXBsYWNlUGxhY2Vob2xkZXIoaXRlbSwgcGFuZSwgaW5kZXgpICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IEdhZGdldENvbXBvbmVudCA9IHN0YXRlLmdldCgnY29tcG9uZW50cycpLmdldChpdGVtKTtcblxuICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gY29tcG9uZW50IGZvciB0aGlzIGl0ZW0sIGl0IGlzbid0IGEgZ2FkZ2V0LlxuICAgICAgICAgIGlmIChHYWRnZXRDb21wb25lbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwcm9wcyBmb3IgdGhlIGl0ZW0uXG4gICAgICAgICAgY29uc3Qgb2xkUHJvcHMgPSBzdGF0ZS5nZXQoJ3Byb3BzJykuZ2V0KGl0ZW0pO1xuICAgICAgICAgIGNvbnN0IG5ld1Byb3BzID0ge1xuICAgICAgICAgICAgLi4ub2xkUHJvcHMsXG4gICAgICAgICAgICBhY3RpdmU6IGl0ZW0gPT09IGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIERvbid0IHJlLXJlbmRlciBpZiB0aGUgcHJvcHMgaGF2ZW4ndCBjaGFuZ2VkLlxuICAgICAgICAgIGlmIChzaGFsbG93RXF1YWwob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmUtcmVuZGVyIHRoZSBpdGVtIHdpdGggdGhlIG5ldyBwcm9wcy5cbiAgICAgICAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICAgICAgICA8R2FkZ2V0Q29tcG9uZW50IHsuLi5uZXdQcm9wc30gLz4sXG4gICAgICAgICAgICBpdGVtLmVsZW1lbnQsXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vICRGbG93SXNzdWUodDEwMjY4MDk1KVxuICAgICAgICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICAgICAgICB0eXBlOiBBY3Rpb25UeXBlcy5VUERBVEVfUEFORV9JVEVNLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgICBwcm9wczogbmV3UHJvcHMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIHRoZSBpdGVtIGlmIGl0IGlzIGEgcGxhY2Vob2xkZXIsIHJldHVybmluZyB0aGUgbmV3IGl0ZW0uXG4gICAqL1xuICByZXBsYWNlUGxhY2Vob2xkZXIoaXRlbTogT2JqZWN0LCBwYW5lOiBhdG9tJFBhbmUsIGluZGV4OiBudW1iZXIpOiA/T2JqZWN0IHtcbiAgICBpZiAoIShpdGVtIGluc3RhbmNlb2YgR2FkZ2V0UGxhY2Vob2xkZXIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBnYWRnZXRJZCA9IGl0ZW0uZ2V0R2FkZ2V0SWQoKTtcbiAgICBjb25zdCBnYWRnZXQgPSB0aGlzLl9nZXRTdGF0ZSgpLmdldCgnZ2FkZ2V0cycpLmdldChnYWRnZXRJZCk7XG5cbiAgICBpZiAoZ2FkZ2V0ID09IG51bGwpIHtcbiAgICAgIC8vIFN0aWxsIGRvbid0IGhhdmUgdGhlIGdhZGdldC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgdGhlIGdhZGdldCwgd2UgY2FuIGRlc2VyaWFsaXplIHRoZSBzdGF0ZS4gKipJTVBPUlRBTlQ6KiogaWYgaXRcbiAgICAvLyBkb2Vzbid0IGhhdmUgYW55IChlLmcuIGl0J3MgYD09IG51bGxgKSB0aGF0J3Mgb2theSEgSXQgYWxsb3dzIGNvbXBvbmVudHMgdG8gcHJvdmlkZSBhXG4gICAgLy8gZGVmYXVsdCBpbml0aWFsIHN0YXRlIGluIHRoZWlyIGNvbnN0cnVjdG9yOyBmb3IgZXhhbXBsZTpcbiAgICAvL1xuICAgIC8vICAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIC8vICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAvLyAgICAgICB0aGlzLnN0YXRlID0gcHJvcHMuaW5pdGlhbFN0YXRlIHx8IHtjb3VudDogMX07XG4gICAgLy8gICAgIH1cbiAgICBjb25zdCByYXdJbml0aWFsR2FkZ2V0U3RhdGUgPSBpdGVtLmdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpO1xuICAgIGNvbnN0IGluaXRpYWxTdGF0ZSA9IChcbiAgICAgIHR5cGVvZiBnYWRnZXQuZGVzZXJpYWxpemVTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIGdhZGdldC5kZXNlcmlhbGl6ZVN0YXRlKHJhd0luaXRpYWxHYWRnZXRTdGF0ZSkgOiByYXdJbml0aWFsR2FkZ2V0U3RhdGVcbiAgICApO1xuXG4gICAgY29uc3QgYWN0aXZlID0gcGFuZS5nZXRBY3RpdmVJdGVtKCkgPT09IGl0ZW07XG4gICAgY29uc3QgcmVhbEl0ZW0gPSB0aGlzLmNyZWF0ZVBhbmVJdGVtKGdhZGdldElkLCB7aW5pdGlhbFN0YXRlLCBhY3RpdmV9LCBmYWxzZSk7XG5cbiAgICBpZiAocmVhbEl0ZW0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIG1ldGFkYXRhIGFib3V0IHRoZSBjb250YWluZXIgZnJvbSB0aGUgcGxhY2Vob2xkZXIuXG4gICAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IERlY2lkZSBob3cgdG8gYXNzaWduIGBfZXhwYW5kZWRGbGV4U2NhbGVgIHRvIGBIVE1MRWxlbWVudGAgdG8gcmVtb3ZlXG4gICAgLy8gICB0aGlzIGBhbnlgIGNhc3QuXG4gICAgKHJlYWxJdGVtOiBhbnkpLl9leHBhbmRlZEZsZXhTY2FsZSA9IGl0ZW0uX2V4cGFuZGVkRmxleFNjYWxlO1xuXG4gICAgLy8gUmVwbGFjZSB0aGUgcGxhY2Vob2xkZXIgd2l0aCB0aGUgcmVhbCBpdGVtLiBXZSdsbCBhZGQgdGhlIHJlYWwgaXRlbSBmaXJzdCBhbmQgdGhlblxuICAgIC8vIHJlbW92ZSB0aGUgb2xkIG9uZSBzbyB0aGF0IHdlIGRvbid0IHJpc2sgZHJvcHBpbmcgZG93biB0byB6ZXJvIGl0ZW1zLlxuICAgIHBhbmUuYWRkSXRlbShyZWFsSXRlbSwgaW5kZXggKyAxKTtcbiAgICBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pO1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHBhbmUuc2V0QWN0aXZlSXRlbShyZWFsSXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWxJdGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGEgZ2FkZ2V0IG9mIHRoZSBzcGVjaWZpZWQgZ2FkZ2V0SWQgaXMgdmlzaWJsZSwgY3JlYXRpbmcgb25lIGlmIG5lY2Vzc2FyeS5cbiAgICovXG4gIHNob3dHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6ID9PYmplY3Qge1xuICAgIGNvbnN0IG1hdGNoID0gZmluZFBhbmVBbmRJdGVtKGl0ZW0gPT4gZ2V0R2FkZ2V0SWQoaXRlbSkgPT09IGdhZGdldElkKTtcblxuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICAvLyBJZiB0aGUgZ2FkZ2V0IGlzbid0IGluIHRoZSB3b3Jrc3BhY2UsIGNyZWF0ZSBpdC5cbiAgICAgIGNvbnN0IG5ld0l0ZW0gPSB0aGlzLmNyZWF0ZVBhbmVJdGVtKGdhZGdldElkKTtcblxuICAgICAgaWYgKG5ld0l0ZW0gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdhZGdldCA9IHRoaXMuX2dldFN0YXRlKCkuZ2V0KCdnYWRnZXRzJykuZ2V0KGdhZGdldElkKTtcbiAgICAgIGNvbnN0IGRlZmF1bHRMb2NhdGlvbjogR2FkZ2V0TG9jYXRpb24gPSBnYWRnZXQuZGVmYXVsdExvY2F0aW9uIHx8ICdhY3RpdmUtcGFuZSc7XG4gICAgICBjb25zdCBwYW5lID0gZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbihkZWZhdWx0TG9jYXRpb24pO1xuICAgICAgcGFuZS5hZGRJdGVtKG5ld0l0ZW0pO1xuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0obmV3SXRlbSk7XG4gICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICB9XG5cbiAgICBjb25zdCB7aXRlbSwgcGFuZX0gPSBtYXRjaDtcbiAgICBwYW5lLmFjdGl2YXRlSXRlbShpdGVtKTtcblxuICAgIC8vIElmIHRoZSBpdGVtIGlzbid0IGluIGEgaGlkYWJsZSBjb250YWluZXIgKGkuZS4gaXQncyBhIHRvcC1sZXZlbCBwYW5lIGl0ZW0pLCB3ZSdyZSBkb25lLlxuICAgIGNvbnN0IGhpZGRlbkNvbnRhaW5lciA9IGdldENvbnRhaW5lclRvSGlkZShwYW5lKTtcbiAgICBpZiAoaGlkZGVuQ29udGFpbmVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIC8vIFNob3cgYWxsIG9mIHRoZSBjb250YWluZXJzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgIGZvciAoY29uc3QgY29udGFpbmVyIG9mIGdldFJlc2l6YWJsZUNvbnRhaW5lcnMoaGlkZGVuQ29udGFpbmVyKSkge1xuICAgICAgQ29udGFpbmVyVmlzaWJpbGl0eS5zaG93KGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICB0b2dnbGVHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFNob3cgdGhlIGdhZGdldCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QgaW4gdGhlIHdvcmtzcGFjZS5cbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc2hvd0dhZGdldChnYWRnZXRJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3BhbmV9ID0gbWF0Y2g7XG5cbiAgICAvLyBTaG93IHRoZSBnYWRnZXQgaWYgaXQncyBoaWRkZW4uXG4gICAgZm9yIChjb25zdCBjb250YWluZXIgb2YgZ2V0UmVzaXphYmxlQ29udGFpbmVycyhwYW5lKSkge1xuICAgICAgaWYgKENvbnRhaW5lclZpc2liaWxpdHkuaXNIaWRkZW4oY29udGFpbmVyKSkge1xuICAgICAgICB0aGlzLnNob3dHYWRnZXQoZ2FkZ2V0SWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5oaWRlR2FkZ2V0KGdhZGdldElkKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5VTlJFR0lTVEVSX0dBREdFVCxcbiAgICAgIHBheWxvYWQ6IHtnYWRnZXRJZH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBwcm92aWRlZCBjb250YWluZXIncyBleHBhbmRlZCBmbGV4IHNjYWxlIHRvIGl0cyBjdXJyZW50IGZsZXggc2NhbGUuXG4gICAqL1xuICB1cGRhdGVFeHBhbmRlZEZsZXhTY2FsZShjb250YWluZXI6IFBhbmVJdGVtQ29udGFpbmVyKTogdm9pZCB7XG4gICAgY29uc3QgZmxleFNjYWxlID0gY29udGFpbmVyLmdldEZsZXhTY2FsZSgpO1xuXG4gICAgLy8gSWYgdGhlIGZsZXggc2NhbGUgaXMgemVybywgdGhlIGNvbnRhaW5lciBpc24ndCBleHBhbmRlZC5cbiAgICBpZiAoZmxleFNjYWxlID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRXhwYW5kZWRGbGV4U2NhbGUuc2V0KGNvbnRhaW5lciwgZmxleFNjYWxlKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldEdhZGdldElkKGl0ZW06IE9iamVjdCk6IHN0cmluZyB7XG4gIHJldHVybiBpdGVtLmdldEdhZGdldElkID8gaXRlbS5nZXRHYWRnZXRJZCgpIDogaXRlbS5jb25zdHJ1Y3Rvci5nYWRnZXRJZDtcbn1cbiJdfQ==