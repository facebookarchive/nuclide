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

var _GadgetUri = require('./GadgetUri');

var GadgetUri = _interopRequireWildcard(_GadgetUri);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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

      _reactForAtom2['default'].unmountComponentAtNode(item.element);

      this._observer.onNext({
        type: ActionTypes.DESTROY_PANE_ITEM,
        payload: { item: item }
      });
    }

    /**
     * Creates a new gadget instance.
     */
  }, {
    key: 'openUri',
    value: function openUri(uri) {
      var parsed = GadgetUri.parse(uri);

      if (parsed == null) {
        return;
      }

      return this.showGadget(parsed.gadgetId);
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
      var item = (0, _createComponentItem2['default'])(_reactForAtom2['default'].createElement(GadgetComponent, props));

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
          _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(GadgetComponent, newProps), item.element);

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
//# sourceMappingURL=data:application/json;base64,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RSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0NBQzFFIiwiZmlsZSI6IkNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0dhZGdldCwgR2FkZ2V0TG9jYXRpb259IGZyb20gJy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB0eXBlIHtQYW5lSXRlbUNvbnRhaW5lcn0gZnJvbSAnLi4vdHlwZXMvUGFuZUl0ZW1Db250YWluZXInO1xuXG5pbXBvcnQgKiBhcyBBY3Rpb25UeXBlcyBmcm9tICcuL0FjdGlvblR5cGVzJztcbmltcG9ydCAqIGFzIENvbnRhaW5lclZpc2liaWxpdHkgZnJvbSAnLi9Db250YWluZXJWaXNpYmlsaXR5JztcbmltcG9ydCBjcmVhdGVDb21wb25lbnRJdGVtIGZyb20gJy4vY3JlYXRlQ29tcG9uZW50SXRlbSc7XG5pbXBvcnQgKiBhcyBFeHBhbmRlZEZsZXhTY2FsZSBmcm9tICcuL0V4cGFuZGVkRmxleFNjYWxlJztcbmltcG9ydCBmaW5kT3JDcmVhdGVQYW5lSXRlbUxvY2F0aW9uIGZyb20gJy4vZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbic7XG5pbXBvcnQgZmluZFBhbmVBbmRJdGVtIGZyb20gJy4vZmluZFBhbmVBbmRJdGVtJztcbmltcG9ydCBnZXRDb250YWluZXJUb0hpZGUgZnJvbSAnLi9nZXRDb250YWluZXJUb0hpZGUnO1xuaW1wb3J0IGdldFJlc2l6YWJsZUNvbnRhaW5lcnMgZnJvbSAnLi9nZXRSZXNpemFibGVDb250YWluZXJzJztcbmltcG9ydCBHYWRnZXRQbGFjZWhvbGRlciBmcm9tICcuL0dhZGdldFBsYWNlaG9sZGVyJztcbmltcG9ydCAqIGFzIEdhZGdldFVyaSBmcm9tICcuL0dhZGdldFVyaSc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHNoYWxsb3dFcXVhbCBmcm9tICdzaGFsbG93ZXF1YWwnO1xuaW1wb3J0IHdyYXBHYWRnZXQgZnJvbSAnLi93cmFwR2FkZ2V0JztcblxuLyoqXG4gKiBDcmVhdGUgYW4gb2JqZWN0IHRoYXQgcHJvdmlkZXMgY29tbWFuZHMgKFwiYWN0aW9uIGNyZWF0b3JzXCIpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRzIHtcblxuICBfb2JzZXJ2ZXI6IHJ4JElPYnNlcnZlcjtcbiAgX2dldFN0YXRlOiAoKSA9PiBJbW11dGFibGUuTWFwO1xuXG4gIGNvbnN0cnVjdG9yKG9ic2VydmVyOiByeCRJT2JzZXJ2ZXIsIGdldFN0YXRlOiAoKSA9PiBJbW11dGFibGUuTWFwKSB7XG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBvYnNlcnZlcjtcbiAgICB0aGlzLl9nZXRTdGF0ZSA9IGdldFN0YXRlO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuREVBQ1RJVkFURSxcbiAgICB9KTtcbiAgICB0aGlzLl9vYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICB9XG5cbiAgZGVzdHJveUdhZGdldChnYWRnZXRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbWF0Y2ggPSBmaW5kUGFuZUFuZEl0ZW0oaXRlbSA9PiBnZXRHYWRnZXRJZChpdGVtKSA9PT0gZ2FkZ2V0SWQpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG1hdGNoLnBhbmUuZGVzdHJveUl0ZW0obWF0Y2guaXRlbSk7XG4gIH1cblxuICBjbGVhblVwRGVzdHJveWVkUGFuZUl0ZW0oaXRlbTogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9nZXRTdGF0ZSgpLmdldCgnY29tcG9uZW50cycpLmhhcyhpdGVtKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUoaXRlbS5lbGVtZW50KTtcblxuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERVNUUk9ZX1BBTkVfSVRFTSxcbiAgICAgIHBheWxvYWQ6IHtpdGVtfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGdhZGdldCBpbnN0YW5jZS5cbiAgICovXG4gIG9wZW5VcmkodXJpOiBzdHJpbmcpOiA/T2JqZWN0IHtcbiAgICBjb25zdCBwYXJzZWQgPSBHYWRnZXRVcmkucGFyc2UodXJpKTtcblxuICAgIGlmIChwYXJzZWQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNob3dHYWRnZXQocGFyc2VkLmdhZGdldElkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHBhbmUgaXRlbSBmb3IgdGhlIHNwZWNpZmllZCBnYWRnZXQuIFRoaXMgaXMgbWVhbnQgdG8gYmUgdGhlIHNpbmdsZSBwb2ludFxuICAgKiB0aHJvdWdoIHdoaWNoIGFsbCBwYW5lIGl0ZW0gY3JlYXRpb24gZ29lcyAobmV3IHBhbmUgaXRlbSBjcmVhdGlvbiwgZGVzZXJpYWxpemF0aW9uLFxuICAgKiBzcGxpdHRpbmcsIHJlb3BlbmluZywgZXRjLikuXG4gICAqL1xuICBjcmVhdGVQYW5lSXRlbShnYWRnZXRJZDogc3RyaW5nLCBwcm9wcz86IE9iamVjdCwgaXNOZXc6IGJvb2xlYW4gPSB0cnVlKTogP1JlYWN0LkNvbXBvbmVudCB7XG4gICAgLy8gTG9vayB1cCB0aGUgZ2FkZ2V0LlxuICAgIGNvbnN0IGdhZGdldCA9IHRoaXMuX2dldFN0YXRlKCkuZ2V0KCdnYWRnZXRzJykuZ2V0KGdhZGdldElkKTtcblxuICAgIC8vIElmIHRoZXJlJ3Mgbm8gZ2FkZ2V0IHJlZ2lzdGVyZWQgd2l0aCB0aGUgcHJvdmlkZWQgSUQsIGFib3J0LiBNYXliZSB0aGUgdXNlciBqdXN0XG4gICAgLy8gZGVhY3RpdmF0ZWQgdGhhdCBwYWNrYWdlLlxuICAgIGlmIChnYWRnZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IEdhZGdldENvbXBvbmVudCA9IGdhZGdldDtcbiAgICBjb25zdCBpdGVtID0gY3JlYXRlQ29tcG9uZW50SXRlbSg8R2FkZ2V0Q29tcG9uZW50IHsuLi5wcm9wc30gLz4pO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLkNSRUFURV9QQU5FX0lURU0sXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGNvbXBvbmVudDogR2FkZ2V0Q29tcG9uZW50LFxuICAgICAgICBnYWRnZXRJZCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgcHJvcHMsXG4gICAgICAgIGlzTmV3LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgaGlkZUdhZGdldChnYWRnZXRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gSGlkaW5nIGEgZ2FkZ2V0IGRvZXNuJ3QganVzdCBtZWFuIGNsb3NpbmcgaXRzIHBhbmU7IGl0IG1lYW5zIGdldHRpbmcgaXQgb3V0IG9mIHRoZSB3YXkuXG4gICAgLy8gSnVzdCBjbG9zaW5nIGl0cyBwYW5lIGFuZCB3b3VsZCBwb3RlbnRpYWxseSBsZWF2ZSBzaWJsaW5ncyB3aGljaCwgcHJlc3VtYWJseSwgdGhlIHVzZXJcbiAgICAvLyB3b3VsZCB0aGVuIGhhdmUgdG8gYWxzbyBjbG9zZS4gSW5zdGVhZCwgaXQncyBtb3JlIHVzZWZ1bCB0byBpZGVudGlmeSB0aGUgZ3JvdXAgb2YgZ2FkZ2V0c1xuICAgIC8vIHRvIHdoaWNoIHRoaXMgb25lIGJlbG9uZ3MgYW5kIGdldCBpdCBvdXQgb2YgdGhlIHdheS4gVGhvdWdoIGdyb3VwcyBjYW4gYmUgbmVzdGVkLCB0aGUgbW9zdFxuICAgIC8vIHVzZWZ1bCB0byBoaWRlIGlzIGFsbW9zdCBjZXJ0YWlubHkgdGhlIHRvcG1vc3QsIHNvIHRoYXQncyB3aGF0IHdlIGRvLlxuXG4gICAgY29uc3QgbWF0Y2ggPSBmaW5kUGFuZUFuZEl0ZW0oaXRlbSA9PiBnZXRHYWRnZXRJZChpdGVtKSA9PT0gZ2FkZ2V0SWQpO1xuXG4gICAgLy8gSWYgdGhlIGdhZGdldCBpc24ndCBwcmVzZW50LCBubyBiaWdnaWU7IGp1c3Qgbm8tb3AuXG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7aXRlbTogZ2FkZ2V0SXRlbSwgcGFuZTogcGFyZW50UGFuZX0gPSBtYXRjaDtcbiAgICBjb25zdCBjb250YWluZXJUb0hpZGUgPSBnZXRDb250YWluZXJUb0hpZGUocGFyZW50UGFuZSk7XG5cbiAgICAvLyBJZiBnYWRnZXQgaXMgYXQgdGhlIHRvcCBsZXZlbCBcImhpZGluZ1wiIGlzIGtpbmQgb2YgYSBtdXJreSBjb25jZXB0IGJ1dCB3ZSdsbCB0YWtlIGl0IHRvIG1lYW5cbiAgICAvLyBcImNsb3NlLlwiXG4gICAgaWYgKGNvbnRhaW5lclRvSGlkZSA9PSBudWxsKSB7XG4gICAgICBwYXJlbnRQYW5lLmRlc3Ryb3lJdGVtKGdhZGdldEl0ZW0pO1xuXG4gICAgICAvLyBUT0RPOiBTdG9yZSB0aGUgbG9jYXRpb24gb2YgdGhlIGNsb3NlZCBwYW5lIGZvciBzZXJpYWxpemF0aW9uIHNvIHdlIGNhbiByZW9wZW4gdGhpc1xuICAgICAgLy8gICAgICAgZ2FkZ2V0IHRoZXJlIG5leHQgdGltZS4gKFRoaXMgaXNuJ3QgbmVjZXNzYXJ5IGlmIHRoZSBnYWRnZXQncyBkZWZhdWx0IGxvY2F0aW9uIGlzXG4gICAgICAvLyAgICAgICBhdCB0aGUgdG9wLCBidXQgaXMgaWYgaXQgd2FzIG1vdmVkIHRoZXJlLilcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDb250YWluZXJWaXNpYmlsaXR5LmhpZGUoY29udGFpbmVyVG9IaWRlKTtcbiAgfVxuXG4gIHJlZ2lzdGVyR2FkZ2V0KGdhZGdldDogR2FkZ2V0KTogdm9pZCB7XG4gICAgLy8gV3JhcCB0aGUgZ2FkZ2V0IHNvIGl0IGhhcyBBdG9tLXNwZWNpZmljIHN0dWZmLlxuICAgIGdhZGdldCA9IHdyYXBHYWRnZXQoZ2FkZ2V0KTtcblxuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRUdJU1RFUl9HQURHRVQsXG4gICAgICBwYXlsb2FkOiB7Z2FkZ2V0fSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIHN1cmUgYWxsIG9mIHRoZSBwYW5lIGl0ZW1zIHJlZmxlY3QgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcC5cbiAgICovXG4gIHJlbmRlclBhbmVJdGVtcygpOiB2b2lkIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuX2dldFN0YXRlKCk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgICAuZm9yRWFjaChwYW5lID0+IHtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBwYW5lLmdldEl0ZW1zKCk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKTtcblxuICAgICAgICAvLyBJdGVyYXRlIGluIHJldmVyc2Ugc28gdGhhdCB3ZSBjYW4ndCBnZXQgdHJpcHBlZCB1cCBieSB0aGUgaXRlbXMgd2UncmUgYWRkaW5nLlxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IGl0ZW1zLmxlbmd0aCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcbiAgICAgICAgICBjb25zdCBpdGVtID0gaXRlbXNbaW5kZXhdO1xuXG4gICAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaXMgYSBwbGFjZWhvbGRlciwgdHJ5IHRvIHJlcGxhY2UgaXQuIElmIHdlIHdlcmUgc3VjY2Vzc2Z1bCwgdGhlbiB3ZSBrbm93XG4gICAgICAgICAgLy8gdGhlIGl0ZW0gaXMgdXAtdG8tZGF0ZSwgc28gdGhlcmUncyBubyBuZWVkIHRvIHVwZGF0ZSBpdCBhbmQgd2UgY2FuIG1vdmUgb24gdG8gdGhlXG4gICAgICAgICAgLy8gbmV4dCBpdGVtLlxuICAgICAgICAgIGlmICh0aGlzLnJlcGxhY2VQbGFjZWhvbGRlcihpdGVtLCBwYW5lLCBpbmRleCkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgR2FkZ2V0Q29tcG9uZW50ID0gc3RhdGUuZ2V0KCdjb21wb25lbnRzJykuZ2V0KGl0ZW0pO1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBjb21wb25lbnQgZm9yIHRoaXMgaXRlbSwgaXQgaXNuJ3QgYSBnYWRnZXQuXG4gICAgICAgICAgaWYgKEdhZGdldENvbXBvbmVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHByb3BzIGZvciB0aGUgaXRlbS5cbiAgICAgICAgICBjb25zdCBvbGRQcm9wcyA9IHN0YXRlLmdldCgncHJvcHMnKS5nZXQoaXRlbSk7XG4gICAgICAgICAgY29uc3QgbmV3UHJvcHMgPSB7XG4gICAgICAgICAgICAuLi5vbGRQcm9wcyxcbiAgICAgICAgICAgIGFjdGl2ZTogaXRlbSA9PT0gYWN0aXZlSXRlbSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gRG9uJ3QgcmUtcmVuZGVyIGlmIHRoZSBwcm9wcyBoYXZlbid0IGNoYW5nZWQuXG4gICAgICAgICAgaWYgKHNoYWxsb3dFcXVhbChvbGRQcm9wcywgbmV3UHJvcHMpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZS1yZW5kZXIgdGhlIGl0ZW0gd2l0aCB0aGUgbmV3IHByb3BzLlxuICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgIDxHYWRnZXRDb21wb25lbnQgey4uLm5ld1Byb3BzfSAvPixcbiAgICAgICAgICAgIGl0ZW0uZWxlbWVudCxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgICAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9QQU5FX0lURU0sXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgIHByb3BzOiBuZXdQcm9wcyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgdGhlIGl0ZW0gaWYgaXQgaXMgYSBwbGFjZWhvbGRlciwgcmV0dXJuaW5nIHRoZSBuZXcgaXRlbS5cbiAgICovXG4gIHJlcGxhY2VQbGFjZWhvbGRlcihpdGVtOiBPYmplY3QsIHBhbmU6IGF0b20kUGFuZSwgaW5kZXg6IG51bWJlcik6ID9PYmplY3Qge1xuICAgIGlmICghKGl0ZW0gaW5zdGFuY2VvZiBHYWRnZXRQbGFjZWhvbGRlcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGdhZGdldElkID0gaXRlbS5nZXRHYWRnZXRJZCgpO1xuICAgIGNvbnN0IGdhZGdldCA9IHRoaXMuX2dldFN0YXRlKCkuZ2V0KCdnYWRnZXRzJykuZ2V0KGdhZGdldElkKTtcblxuICAgIGlmIChnYWRnZXQgPT0gbnVsbCkge1xuICAgICAgLy8gU3RpbGwgZG9uJ3QgaGF2ZSB0aGUgZ2FkZ2V0LlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gTm93IHRoYXQgd2UgaGF2ZSB0aGUgZ2FkZ2V0LCB3ZSBjYW4gZGVzZXJpYWxpemUgdGhlIHN0YXRlLiAqKklNUE9SVEFOVDoqKiBpZiBpdFxuICAgIC8vIGRvZXNuJ3QgaGF2ZSBhbnkgKGUuZy4gaXQncyBgPT0gbnVsbGApIHRoYXQncyBva2F5ISBJdCBhbGxvd3MgY29tcG9uZW50cyB0byBwcm92aWRlIGFcbiAgICAvLyBkZWZhdWx0IGluaXRpYWwgc3RhdGUgaW4gdGhlaXIgY29uc3RydWN0b3I7IGZvciBleGFtcGxlOlxuICAgIC8vXG4gICAgLy8gICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgLy8gICAgICAgc3VwZXIocHJvcHMpO1xuICAgIC8vICAgICAgIHRoaXMuc3RhdGUgPSBwcm9wcy5pbml0aWFsU3RhdGUgfHwge2NvdW50OiAxfTtcbiAgICAvLyAgICAgfVxuICAgIGNvbnN0IHJhd0luaXRpYWxHYWRnZXRTdGF0ZSA9IGl0ZW0uZ2V0UmF3SW5pdGlhbEdhZGdldFN0YXRlKCk7XG4gICAgY29uc3QgaW5pdGlhbFN0YXRlID0gKFxuICAgICAgdHlwZW9mIGdhZGdldC5kZXNlcmlhbGl6ZVN0YXRlID09PSAnZnVuY3Rpb24nID9cbiAgICAgICAgZ2FkZ2V0LmRlc2VyaWFsaXplU3RhdGUocmF3SW5pdGlhbEdhZGdldFN0YXRlKSA6IHJhd0luaXRpYWxHYWRnZXRTdGF0ZVxuICAgICk7XG5cbiAgICBjb25zdCBhY3RpdmUgPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKSA9PT0gaXRlbTtcbiAgICBjb25zdCByZWFsSXRlbSA9IHRoaXMuY3JlYXRlUGFuZUl0ZW0oZ2FkZ2V0SWQsIHtpbml0aWFsU3RhdGUsIGFjdGl2ZX0sIGZhbHNlKTtcblxuICAgIGlmIChyZWFsSXRlbSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ29weSB0aGUgbWV0YWRhdGEgYWJvdXQgdGhlIGNvbnRhaW5lciBmcm9tIHRoZSBwbGFjZWhvbGRlci5cbiAgICByZWFsSXRlbS5fZXhwYW5kZWRGbGV4U2NhbGUgPSBpdGVtLl9leHBhbmRlZEZsZXhTY2FsZTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIHBsYWNlaG9sZGVyIHdpdGggdGhlIHJlYWwgaXRlbS4gV2UnbGwgYWRkIHRoZSByZWFsIGl0ZW0gZmlyc3QgYW5kIHRoZW5cbiAgICAvLyByZW1vdmUgdGhlIG9sZCBvbmUgc28gdGhhdCB3ZSBkb24ndCByaXNrIGRyb3BwaW5nIGRvd24gdG8gemVybyBpdGVtcy5cbiAgICBwYW5lLmFkZEl0ZW0ocmVhbEl0ZW0sIGluZGV4ICsgMSk7XG4gICAgcGFuZS5kZXN0cm95SXRlbShpdGVtKTtcbiAgICBpZiAoYWN0aXZlKSB7XG4gICAgICBwYW5lLnNldEFjdGl2ZUl0ZW0ocmVhbEl0ZW0pO1xuICAgIH1cblxuICAgIHJldHVybiByZWFsSXRlbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCBhIGdhZGdldCBvZiB0aGUgc3BlY2lmaWVkIGdhZGdldElkIGlzIHZpc2libGUsIGNyZWF0aW5nIG9uZSBpZiBuZWNlc3NhcnkuXG4gICAqL1xuICBzaG93R2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiA/T2JqZWN0IHtcbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG5cbiAgICBpZiAobWF0Y2ggPT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlIGdhZGdldCBpc24ndCBpbiB0aGUgd29ya3NwYWNlLCBjcmVhdGUgaXQuXG4gICAgICBjb25zdCBuZXdJdGVtID0gdGhpcy5jcmVhdGVQYW5lSXRlbShnYWRnZXRJZCk7XG5cbiAgICAgIGlmIChuZXdJdGVtID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnYWRnZXQgPSB0aGlzLl9nZXRTdGF0ZSgpLmdldCgnZ2FkZ2V0cycpLmdldChnYWRnZXRJZCk7XG4gICAgICBjb25zdCBkZWZhdWx0TG9jYXRpb246IEdhZGdldExvY2F0aW9uID0gZ2FkZ2V0LmRlZmF1bHRMb2NhdGlvbiB8fCAnYWN0aXZlLXBhbmUnO1xuICAgICAgY29uc3QgcGFuZSA9IGZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24oZGVmYXVsdExvY2F0aW9uKTtcbiAgICAgIHBhbmUuYWRkSXRlbShuZXdJdGVtKTtcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG5ld0l0ZW0pO1xuICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgfVxuXG4gICAgY29uc3Qge2l0ZW0sIHBhbmV9ID0gbWF0Y2g7XG4gICAgcGFuZS5hY3RpdmF0ZUl0ZW0oaXRlbSk7XG5cbiAgICAvLyBJZiB0aGUgaXRlbSBpc24ndCBpbiBhIGhpZGFibGUgY29udGFpbmVyIChpLmUuIGl0J3MgYSB0b3AtbGV2ZWwgcGFuZSBpdGVtKSwgd2UncmUgZG9uZS5cbiAgICBjb25zdCBoaWRkZW5Db250YWluZXIgPSBnZXRDb250YWluZXJUb0hpZGUocGFuZSk7XG4gICAgaWYgKGhpZGRlbkNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICAvLyBTaG93IGFsbCBvZiB0aGUgY29udGFpbmVycyByZWN1cnNpdmVseSB1cCB0aGUgdHJlZS5cbiAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiBnZXRSZXNpemFibGVDb250YWluZXJzKGhpZGRlbkNvbnRhaW5lcikpIHtcbiAgICAgIENvbnRhaW5lclZpc2liaWxpdHkuc2hvdyhjb250YWluZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtO1xuICB9XG5cbiAgdG9nZ2xlR2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBTaG93IHRoZSBnYWRnZXQgaWYgaXQgZG9lc24ndCBhbHJlYWR5IGV4aXN0IGluIHRoZSB3b3Jrc3BhY2UuXG4gICAgY29uc3QgbWF0Y2ggPSBmaW5kUGFuZUFuZEl0ZW0oaXRlbSA9PiBnZXRHYWRnZXRJZChpdGVtKSA9PT0gZ2FkZ2V0SWQpO1xuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICB0aGlzLnNob3dHYWRnZXQoZ2FkZ2V0SWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtwYW5lfSA9IG1hdGNoO1xuXG4gICAgLy8gU2hvdyB0aGUgZ2FkZ2V0IGlmIGl0J3MgaGlkZGVuLlxuICAgIGZvciAoY29uc3QgY29udGFpbmVyIG9mIGdldFJlc2l6YWJsZUNvbnRhaW5lcnMocGFuZSkpIHtcbiAgICAgIGlmIChDb250YWluZXJWaXNpYmlsaXR5LmlzSGlkZGVuKGNvbnRhaW5lcikpIHtcbiAgICAgICAgdGhpcy5zaG93R2FkZ2V0KGdhZGdldElkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaGlkZUdhZGdldChnYWRnZXRJZCk7XG4gIH1cblxuICB1bnJlZ2lzdGVyR2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuVU5SRUdJU1RFUl9HQURHRVQsXG4gICAgICBwYXlsb2FkOiB7Z2FkZ2V0SWR9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgcHJvdmlkZWQgY29udGFpbmVyJ3MgZXhwYW5kZWQgZmxleCBzY2FsZSB0byBpdHMgY3VycmVudCBmbGV4IHNjYWxlLlxuICAgKi9cbiAgdXBkYXRlRXhwYW5kZWRGbGV4U2NhbGUoY29udGFpbmVyOiBQYW5lSXRlbUNvbnRhaW5lcik6IHZvaWQge1xuICAgIGNvbnN0IGZsZXhTY2FsZSA9IGNvbnRhaW5lci5nZXRGbGV4U2NhbGUoKTtcblxuICAgIC8vIElmIHRoZSBmbGV4IHNjYWxlIGlzIHplcm8sIHRoZSBjb250YWluZXIgaXNuJ3QgZXhwYW5kZWQuXG4gICAgaWYgKGZsZXhTY2FsZSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEV4cGFuZGVkRmxleFNjYWxlLnNldChjb250YWluZXIsIGZsZXhTY2FsZSk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiBnZXRHYWRnZXRJZChpdGVtKSB7XG4gIHJldHVybiBpdGVtLmdldEdhZGdldElkID8gaXRlbS5nZXRHYWRnZXRJZCgpIDogaXRlbS5jb25zdHJ1Y3Rvci5nYWRnZXRJZDtcbn1cbiJdfQ==