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
//# sourceMappingURL=data:application/json;base64,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R0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztDQUMxRSIsImZpbGUiOiJDb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXQsIEdhZGdldExvY2F0aW9ufSBmcm9tICcuLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgdHlwZSB7UGFuZUl0ZW1Db250YWluZXJ9IGZyb20gJy4uL3R5cGVzL1BhbmVJdGVtQ29udGFpbmVyJztcblxuaW1wb3J0ICogYXMgQWN0aW9uVHlwZXMgZnJvbSAnLi9BY3Rpb25UeXBlcyc7XG5pbXBvcnQgKiBhcyBDb250YWluZXJWaXNpYmlsaXR5IGZyb20gJy4vQ29udGFpbmVyVmlzaWJpbGl0eSc7XG5pbXBvcnQgY3JlYXRlQ29tcG9uZW50SXRlbSBmcm9tICcuL2NyZWF0ZUNvbXBvbmVudEl0ZW0nO1xuaW1wb3J0ICogYXMgRXhwYW5kZWRGbGV4U2NhbGUgZnJvbSAnLi9FeHBhbmRlZEZsZXhTY2FsZSc7XG5pbXBvcnQgZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbiBmcm9tICcuL2ZpbmRPckNyZWF0ZVBhbmVJdGVtTG9jYXRpb24nO1xuaW1wb3J0IGZpbmRQYW5lQW5kSXRlbSBmcm9tICcuL2ZpbmRQYW5lQW5kSXRlbSc7XG5pbXBvcnQgZ2V0Q29udGFpbmVyVG9IaWRlIGZyb20gJy4vZ2V0Q29udGFpbmVyVG9IaWRlJztcbmltcG9ydCBnZXRSZXNpemFibGVDb250YWluZXJzIGZyb20gJy4vZ2V0UmVzaXphYmxlQ29udGFpbmVycyc7XG5pbXBvcnQgR2FkZ2V0UGxhY2Vob2xkZXIgZnJvbSAnLi9HYWRnZXRQbGFjZWhvbGRlcic7XG5pbXBvcnQgKiBhcyBHYWRnZXRVcmkgZnJvbSAnLi9HYWRnZXRVcmknO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgc2hhbGxvd0VxdWFsIGZyb20gJ3NoYWxsb3dlcXVhbCc7XG5pbXBvcnQgd3JhcEdhZGdldCBmcm9tICcuL3dyYXBHYWRnZXQnO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBvYmplY3QgdGhhdCBwcm92aWRlcyBjb21tYW5kcyAoXCJhY3Rpb24gY3JlYXRvcnNcIilcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZHMge1xuXG4gIF9vYnNlcnZlcjogcngkSU9ic2VydmVyO1xuICBfZ2V0U3RhdGU6ICgpID0+IEltbXV0YWJsZS5NYXA7XG5cbiAgY29uc3RydWN0b3Iob2JzZXJ2ZXI6IHJ4JElPYnNlcnZlciwgZ2V0U3RhdGU6ICgpID0+IEltbXV0YWJsZS5NYXApIHtcbiAgICB0aGlzLl9vYnNlcnZlciA9IG9ic2VydmVyO1xuICAgIHRoaXMuX2dldFN0YXRlID0gZ2V0U3RhdGU7XG4gIH1cblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERUFDVElWQVRFLFxuICAgIH0pO1xuICAgIHRoaXMuX29ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gIH1cblxuICBkZXN0cm95R2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbWF0Y2gucGFuZS5kZXN0cm95SXRlbShtYXRjaC5pdGVtKTtcbiAgfVxuXG4gIGNsZWFuVXBEZXN0cm95ZWRQYW5lSXRlbShpdGVtOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2dldFN0YXRlKCkuZ2V0KCdjb21wb25lbnRzJykuaGFzKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShpdGVtLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLkRFU1RST1lfUEFORV9JVEVNLFxuICAgICAgcGF5bG9hZDoge2l0ZW19LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgZ2FkZ2V0IGluc3RhbmNlLlxuICAgKi9cbiAgb3BlblVyaSh1cmk6IHN0cmluZyk6ID9PYmplY3Qge1xuICAgIGNvbnN0IHBhcnNlZCA9IEdhZGdldFVyaS5wYXJzZSh1cmkpO1xuXG4gICAgaWYgKHBhcnNlZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2hvd0dhZGdldChwYXJzZWQuZ2FkZ2V0SWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgcGFuZSBpdGVtIGZvciB0aGUgc3BlY2lmaWVkIGdhZGdldC4gVGhpcyBpcyBtZWFudCB0byBiZSB0aGUgc2luZ2xlIHBvaW50XG4gICAqIHRocm91Z2ggd2hpY2ggYWxsIHBhbmUgaXRlbSBjcmVhdGlvbiBnb2VzIChuZXcgcGFuZSBpdGVtIGNyZWF0aW9uLCBkZXNlcmlhbGl6YXRpb24sXG4gICAqIHNwbGl0dGluZywgcmVvcGVuaW5nLCBldGMuKS5cbiAgICovXG4gIGNyZWF0ZVBhbmVJdGVtKGdhZGdldElkOiBzdHJpbmcsIHByb3BzPzogT2JqZWN0LCBpc05ldzogYm9vbGVhbiA9IHRydWUpOiA/UmVhY3QuQ29tcG9uZW50IHtcbiAgICAvLyBMb29rIHVwIHRoZSBnYWRnZXQuXG4gICAgY29uc3QgZ2FkZ2V0ID0gdGhpcy5fZ2V0U3RhdGUoKS5nZXQoJ2dhZGdldHMnKS5nZXQoZ2FkZ2V0SWQpO1xuXG4gICAgLy8gSWYgdGhlcmUncyBubyBnYWRnZXQgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwcm92aWRlZCBJRCwgYWJvcnQuIE1heWJlIHRoZSB1c2VyIGp1c3RcbiAgICAvLyBkZWFjdGl2YXRlZCB0aGF0IHBhY2thZ2UuXG4gICAgaWYgKGdhZGdldCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgR2FkZ2V0Q29tcG9uZW50ID0gZ2FkZ2V0O1xuICAgIGNvbnN0IGl0ZW0gPSBjcmVhdGVDb21wb25lbnRJdGVtKDxHYWRnZXRDb21wb25lbnQgey4uLnByb3BzfSAvPik7XG5cbiAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuQ1JFQVRFX1BBTkVfSVRFTSxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgY29tcG9uZW50OiBHYWRnZXRDb21wb25lbnQsXG4gICAgICAgIGdhZGdldElkLFxuICAgICAgICBpdGVtLFxuICAgICAgICBwcm9wcyxcbiAgICAgICAgaXNOZXcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBoaWRlR2FkZ2V0KGdhZGdldElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBIaWRpbmcgYSBnYWRnZXQgZG9lc24ndCBqdXN0IG1lYW4gY2xvc2luZyBpdHMgcGFuZTsgaXQgbWVhbnMgZ2V0dGluZyBpdCBvdXQgb2YgdGhlIHdheS5cbiAgICAvLyBKdXN0IGNsb3NpbmcgaXRzIHBhbmUgYW5kIHdvdWxkIHBvdGVudGlhbGx5IGxlYXZlIHNpYmxpbmdzIHdoaWNoLCBwcmVzdW1hYmx5LCB0aGUgdXNlclxuICAgIC8vIHdvdWxkIHRoZW4gaGF2ZSB0byBhbHNvIGNsb3NlLiBJbnN0ZWFkLCBpdCdzIG1vcmUgdXNlZnVsIHRvIGlkZW50aWZ5IHRoZSBncm91cCBvZiBnYWRnZXRzXG4gICAgLy8gdG8gd2hpY2ggdGhpcyBvbmUgYmVsb25ncyBhbmQgZ2V0IGl0IG91dCBvZiB0aGUgd2F5LiBUaG91Z2ggZ3JvdXBzIGNhbiBiZSBuZXN0ZWQsIHRoZSBtb3N0XG4gICAgLy8gdXNlZnVsIHRvIGhpZGUgaXMgYWxtb3N0IGNlcnRhaW5seSB0aGUgdG9wbW9zdCwgc28gdGhhdCdzIHdoYXQgd2UgZG8uXG5cbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG5cbiAgICAvLyBJZiB0aGUgZ2FkZ2V0IGlzbid0IHByZXNlbnQsIG5vIGJpZ2dpZTsganVzdCBuby1vcC5cbiAgICBpZiAobWF0Y2ggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtpdGVtOiBnYWRnZXRJdGVtLCBwYW5lOiBwYXJlbnRQYW5lfSA9IG1hdGNoO1xuICAgIGNvbnN0IGNvbnRhaW5lclRvSGlkZSA9IGdldENvbnRhaW5lclRvSGlkZShwYXJlbnRQYW5lKTtcblxuICAgIC8vIElmIGdhZGdldCBpcyBhdCB0aGUgdG9wIGxldmVsIFwiaGlkaW5nXCIgaXMga2luZCBvZiBhIG11cmt5IGNvbmNlcHQgYnV0IHdlJ2xsIHRha2UgaXQgdG8gbWVhblxuICAgIC8vIFwiY2xvc2UuXCJcbiAgICBpZiAoY29udGFpbmVyVG9IaWRlID09IG51bGwpIHtcbiAgICAgIHBhcmVudFBhbmUuZGVzdHJveUl0ZW0oZ2FkZ2V0SXRlbSk7XG5cbiAgICAgIC8vIFRPRE86IFN0b3JlIHRoZSBsb2NhdGlvbiBvZiB0aGUgY2xvc2VkIHBhbmUgZm9yIHNlcmlhbGl6YXRpb24gc28gd2UgY2FuIHJlb3BlbiB0aGlzXG4gICAgICAvLyAgICAgICBnYWRnZXQgdGhlcmUgbmV4dCB0aW1lLiAoVGhpcyBpc24ndCBuZWNlc3NhcnkgaWYgdGhlIGdhZGdldCdzIGRlZmF1bHQgbG9jYXRpb24gaXNcbiAgICAgIC8vICAgICAgIGF0IHRoZSB0b3AsIGJ1dCBpcyBpZiBpdCB3YXMgbW92ZWQgdGhlcmUuKVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENvbnRhaW5lclZpc2liaWxpdHkuaGlkZShjb250YWluZXJUb0hpZGUpO1xuICB9XG5cbiAgcmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0OiBHYWRnZXQpOiB2b2lkIHtcbiAgICAvLyBXcmFwIHRoZSBnYWRnZXQgc28gaXQgaGFzIEF0b20tc3BlY2lmaWMgc3R1ZmYuXG4gICAgZ2FkZ2V0ID0gd3JhcEdhZGdldChnYWRnZXQpO1xuXG4gICAgdGhpcy5fb2JzZXJ2ZXIub25OZXh0KHtcbiAgICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFR0lTVEVSX0dBREdFVCxcbiAgICAgIHBheWxvYWQ6IHtnYWRnZXR9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2Ugc3VyZSBhbGwgb2YgdGhlIHBhbmUgaXRlbXMgcmVmbGVjdCB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwLlxuICAgKi9cbiAgcmVuZGVyUGFuZUl0ZW1zKCk6IHZvaWQge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5fZ2V0U3RhdGUoKTtcblxuICAgIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICAgIC5mb3JFYWNoKHBhbmUgPT4ge1xuICAgICAgICBjb25zdCBpdGVtcyA9IHBhbmUuZ2V0SXRlbXMoKTtcbiAgICAgICAgY29uc3QgYWN0aXZlSXRlbSA9IHBhbmUuZ2V0QWN0aXZlSXRlbSgpO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgaW4gcmV2ZXJzZSBzbyB0aGF0IHdlIGNhbid0IGdldCB0cmlwcGVkIHVwIGJ5IHRoZSBpdGVtcyB3ZSdyZSBhZGRpbmcuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gaXRlbXMubGVuZ3RoIC0gMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpbmRleF07XG5cbiAgICAgICAgICAvLyBJZiB0aGUgaXRlbSBpcyBhIHBsYWNlaG9sZGVyLCB0cnkgdG8gcmVwbGFjZSBpdC4gSWYgd2Ugd2VyZSBzdWNjZXNzZnVsLCB0aGVuIHdlIGtub3dcbiAgICAgICAgICAvLyB0aGUgaXRlbSBpcyB1cC10by1kYXRlLCBzbyB0aGVyZSdzIG5vIG5lZWQgdG8gdXBkYXRlIGl0IGFuZCB3ZSBjYW4gbW92ZSBvbiB0byB0aGVcbiAgICAgICAgICAvLyBuZXh0IGl0ZW0uXG4gICAgICAgICAgaWYgKHRoaXMucmVwbGFjZVBsYWNlaG9sZGVyKGl0ZW0sIHBhbmUsIGluZGV4KSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBHYWRnZXRDb21wb25lbnQgPSBzdGF0ZS5nZXQoJ2NvbXBvbmVudHMnKS5nZXQoaXRlbSk7XG5cbiAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGNvbXBvbmVudCBmb3IgdGhpcyBpdGVtLCBpdCBpc24ndCBhIGdhZGdldC5cbiAgICAgICAgICBpZiAoR2FkZ2V0Q29tcG9uZW50ID09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcHJvcHMgZm9yIHRoZSBpdGVtLlxuICAgICAgICAgIGNvbnN0IG9sZFByb3BzID0gc3RhdGUuZ2V0KCdwcm9wcycpLmdldChpdGVtKTtcbiAgICAgICAgICBjb25zdCBuZXdQcm9wcyA9IHtcbiAgICAgICAgICAgIC4uLm9sZFByb3BzLFxuICAgICAgICAgICAgYWN0aXZlOiBpdGVtID09PSBhY3RpdmVJdGVtLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBEb24ndCByZS1yZW5kZXIgaWYgdGhlIHByb3BzIGhhdmVuJ3QgY2hhbmdlZC5cbiAgICAgICAgICBpZiAoc2hhbGxvd0VxdWFsKG9sZFByb3BzLCBuZXdQcm9wcykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlLXJlbmRlciB0aGUgaXRlbSB3aXRoIHRoZSBuZXcgcHJvcHMuXG4gICAgICAgICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgICAgICAgPEdhZGdldENvbXBvbmVudCB7Li4ubmV3UHJvcHN9IC8+LFxuICAgICAgICAgICAgaXRlbS5lbGVtZW50LFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICB0aGlzLl9vYnNlcnZlci5vbk5leHQoe1xuICAgICAgICAgICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX1BBTkVfSVRFTSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgcHJvcHM6IG5ld1Byb3BzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZSB0aGUgaXRlbSBpZiBpdCBpcyBhIHBsYWNlaG9sZGVyLCByZXR1cm5pbmcgdGhlIG5ldyBpdGVtLlxuICAgKi9cbiAgcmVwbGFjZVBsYWNlaG9sZGVyKGl0ZW06IE9iamVjdCwgcGFuZTogYXRvbSRQYW5lLCBpbmRleDogbnVtYmVyKTogP09iamVjdCB7XG4gICAgaWYgKCEoaXRlbSBpbnN0YW5jZW9mIEdhZGdldFBsYWNlaG9sZGVyKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZ2FkZ2V0SWQgPSBpdGVtLmdldEdhZGdldElkKCk7XG4gICAgY29uc3QgZ2FkZ2V0ID0gdGhpcy5fZ2V0U3RhdGUoKS5nZXQoJ2dhZGdldHMnKS5nZXQoZ2FkZ2V0SWQpO1xuXG4gICAgaWYgKGdhZGdldCA9PSBudWxsKSB7XG4gICAgICAvLyBTdGlsbCBkb24ndCBoYXZlIHRoZSBnYWRnZXQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBOb3cgdGhhdCB3ZSBoYXZlIHRoZSBnYWRnZXQsIHdlIGNhbiBkZXNlcmlhbGl6ZSB0aGUgc3RhdGUuICoqSU1QT1JUQU5UOioqIGlmIGl0XG4gICAgLy8gZG9lc24ndCBoYXZlIGFueSAoZS5nLiBpdCdzIGA9PSBudWxsYCkgdGhhdCdzIG9rYXkhIEl0IGFsbG93cyBjb21wb25lbnRzIHRvIHByb3ZpZGUgYVxuICAgIC8vIGRlZmF1bHQgaW5pdGlhbCBzdGF0ZSBpbiB0aGVpciBjb25zdHJ1Y3RvcjsgZm9yIGV4YW1wbGU6XG4gICAgLy9cbiAgICAvLyAgICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAvLyAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgLy8gICAgICAgdGhpcy5zdGF0ZSA9IHByb3BzLmluaXRpYWxTdGF0ZSB8fCB7Y291bnQ6IDF9O1xuICAgIC8vICAgICB9XG4gICAgY29uc3QgcmF3SW5pdGlhbEdhZGdldFN0YXRlID0gaXRlbS5nZXRSYXdJbml0aWFsR2FkZ2V0U3RhdGUoKTtcbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSAoXG4gICAgICB0eXBlb2YgZ2FkZ2V0LmRlc2VyaWFsaXplU3RhdGUgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICBnYWRnZXQuZGVzZXJpYWxpemVTdGF0ZShyYXdJbml0aWFsR2FkZ2V0U3RhdGUpIDogcmF3SW5pdGlhbEdhZGdldFN0YXRlXG4gICAgKTtcblxuICAgIGNvbnN0IGFjdGl2ZSA9IHBhbmUuZ2V0QWN0aXZlSXRlbSgpID09PSBpdGVtO1xuICAgIGNvbnN0IHJlYWxJdGVtID0gdGhpcy5jcmVhdGVQYW5lSXRlbShnYWRnZXRJZCwge2luaXRpYWxTdGF0ZSwgYWN0aXZlfSwgZmFsc2UpO1xuXG4gICAgaWYgKHJlYWxJdGVtID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHRoZSBtZXRhZGF0YSBhYm91dCB0aGUgY29udGFpbmVyIGZyb20gdGhlIHBsYWNlaG9sZGVyLlxuICAgIHJlYWxJdGVtLl9leHBhbmRlZEZsZXhTY2FsZSA9IGl0ZW0uX2V4cGFuZGVkRmxleFNjYWxlO1xuXG4gICAgLy8gUmVwbGFjZSB0aGUgcGxhY2Vob2xkZXIgd2l0aCB0aGUgcmVhbCBpdGVtLiBXZSdsbCBhZGQgdGhlIHJlYWwgaXRlbSBmaXJzdCBhbmQgdGhlblxuICAgIC8vIHJlbW92ZSB0aGUgb2xkIG9uZSBzbyB0aGF0IHdlIGRvbid0IHJpc2sgZHJvcHBpbmcgZG93biB0byB6ZXJvIGl0ZW1zLlxuICAgIHBhbmUuYWRkSXRlbShyZWFsSXRlbSwgaW5kZXggKyAxKTtcbiAgICBwYW5lLmRlc3Ryb3lJdGVtKGl0ZW0pO1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHBhbmUuc2V0QWN0aXZlSXRlbShyZWFsSXRlbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWxJdGVtO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGEgZ2FkZ2V0IG9mIHRoZSBzcGVjaWZpZWQgZ2FkZ2V0SWQgaXMgdmlzaWJsZSwgY3JlYXRpbmcgb25lIGlmIG5lY2Vzc2FyeS5cbiAgICovXG4gIHNob3dHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6ID9PYmplY3Qge1xuICAgIGNvbnN0IG1hdGNoID0gZmluZFBhbmVBbmRJdGVtKGl0ZW0gPT4gZ2V0R2FkZ2V0SWQoaXRlbSkgPT09IGdhZGdldElkKTtcblxuICAgIGlmIChtYXRjaCA9PSBudWxsKSB7XG4gICAgICAvLyBJZiB0aGUgZ2FkZ2V0IGlzbid0IGluIHRoZSB3b3Jrc3BhY2UsIGNyZWF0ZSBpdC5cbiAgICAgIGNvbnN0IG5ld0l0ZW0gPSB0aGlzLmNyZWF0ZVBhbmVJdGVtKGdhZGdldElkKTtcblxuICAgICAgaWYgKG5ld0l0ZW0gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdhZGdldCA9IHRoaXMuX2dldFN0YXRlKCkuZ2V0KCdnYWRnZXRzJykuZ2V0KGdhZGdldElkKTtcbiAgICAgIGNvbnN0IGRlZmF1bHRMb2NhdGlvbjogR2FkZ2V0TG9jYXRpb24gPSBnYWRnZXQuZGVmYXVsdExvY2F0aW9uIHx8ICdhY3RpdmUtcGFuZSc7XG4gICAgICBjb25zdCBwYW5lID0gZmluZE9yQ3JlYXRlUGFuZUl0ZW1Mb2NhdGlvbihkZWZhdWx0TG9jYXRpb24pO1xuICAgICAgcGFuZS5hZGRJdGVtKG5ld0l0ZW0pO1xuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0obmV3SXRlbSk7XG4gICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICB9XG5cbiAgICBjb25zdCB7aXRlbSwgcGFuZX0gPSBtYXRjaDtcbiAgICBwYW5lLmFjdGl2YXRlSXRlbShpdGVtKTtcblxuICAgIC8vIElmIHRoZSBpdGVtIGlzbid0IGluIGEgaGlkYWJsZSBjb250YWluZXIgKGkuZS4gaXQncyBhIHRvcC1sZXZlbCBwYW5lIGl0ZW0pLCB3ZSdyZSBkb25lLlxuICAgIGNvbnN0IGhpZGRlbkNvbnRhaW5lciA9IGdldENvbnRhaW5lclRvSGlkZShwYW5lKTtcbiAgICBpZiAoaGlkZGVuQ29udGFpbmVyID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIC8vIFNob3cgYWxsIG9mIHRoZSBjb250YWluZXJzIHJlY3Vyc2l2ZWx5IHVwIHRoZSB0cmVlLlxuICAgIGZvciAoY29uc3QgY29udGFpbmVyIG9mIGdldFJlc2l6YWJsZUNvbnRhaW5lcnMoaGlkZGVuQ29udGFpbmVyKSkge1xuICAgICAgQ29udGFpbmVyVmlzaWJpbGl0eS5zaG93KGNvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICB0b2dnbGVHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFNob3cgdGhlIGdhZGdldCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3QgaW4gdGhlIHdvcmtzcGFjZS5cbiAgICBjb25zdCBtYXRjaCA9IGZpbmRQYW5lQW5kSXRlbShpdGVtID0+IGdldEdhZGdldElkKGl0ZW0pID09PSBnYWRnZXRJZCk7XG4gICAgaWYgKG1hdGNoID09IG51bGwpIHtcbiAgICAgIHRoaXMuc2hvd0dhZGdldChnYWRnZXRJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3BhbmV9ID0gbWF0Y2g7XG5cbiAgICAvLyBTaG93IHRoZSBnYWRnZXQgaWYgaXQncyBoaWRkZW4uXG4gICAgZm9yIChjb25zdCBjb250YWluZXIgb2YgZ2V0UmVzaXphYmxlQ29udGFpbmVycyhwYW5lKSkge1xuICAgICAgaWYgKENvbnRhaW5lclZpc2liaWxpdHkuaXNIaWRkZW4oY29udGFpbmVyKSkge1xuICAgICAgICB0aGlzLnNob3dHYWRnZXQoZ2FkZ2V0SWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5oaWRlR2FkZ2V0KGdhZGdldElkKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJHYWRnZXQoZ2FkZ2V0SWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX29ic2VydmVyLm9uTmV4dCh7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5VTlJFR0lTVEVSX0dBREdFVCxcbiAgICAgIHBheWxvYWQ6IHtnYWRnZXRJZH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBwcm92aWRlZCBjb250YWluZXIncyBleHBhbmRlZCBmbGV4IHNjYWxlIHRvIGl0cyBjdXJyZW50IGZsZXggc2NhbGUuXG4gICAqL1xuICB1cGRhdGVFeHBhbmRlZEZsZXhTY2FsZShjb250YWluZXI6IFBhbmVJdGVtQ29udGFpbmVyKTogdm9pZCB7XG4gICAgY29uc3QgZmxleFNjYWxlID0gY29udGFpbmVyLmdldEZsZXhTY2FsZSgpO1xuXG4gICAgLy8gSWYgdGhlIGZsZXggc2NhbGUgaXMgemVybywgdGhlIGNvbnRhaW5lciBpc24ndCBleHBhbmRlZC5cbiAgICBpZiAoZmxleFNjYWxlID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRXhwYW5kZWRGbGV4U2NhbGUuc2V0KGNvbnRhaW5lciwgZmxleFNjYWxlKTtcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdldEdhZGdldElkKGl0ZW0pIHtcbiAgcmV0dXJuIGl0ZW0uZ2V0R2FkZ2V0SWQgPyBpdGVtLmdldEdhZGdldElkKCkgOiBpdGVtLmNvbnN0cnVjdG9yLmdhZGdldElkO1xufVxuIl19