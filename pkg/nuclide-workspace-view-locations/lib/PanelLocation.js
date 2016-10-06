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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomCreatePaneContainer2;

function _commonsAtomCreatePaneContainer() {
  return _commonsAtomCreatePaneContainer2 = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _commonsAtomPanelRenderer2;

function _commonsAtomPanelRenderer() {
  return _commonsAtomPanelRenderer2 = _interopRequireDefault(require('../../commons-atom/PanelRenderer'));
}

var _commonsAtomRenderReactRoot2;

function _commonsAtomRenderReactRoot() {
  return _commonsAtomRenderReactRoot2 = require('../../commons-atom/renderReactRoot');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeSimpleModel2;

function _commonsNodeSimpleModel() {
  return _commonsNodeSimpleModel2 = require('../../commons-node/SimpleModel');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

var _observePanes2;

function _observePanes() {
  return _observePanes2 = require('./observePanes');
}

var _syncPaneItemVisibility2;

function _syncPaneItemVisibility() {
  return _syncPaneItemVisibility2 = require('./syncPaneItemVisibility');
}

var _PanelLocationIds2;

function _PanelLocationIds() {
  return _PanelLocationIds2 = _interopRequireWildcard(require('./PanelLocationIds'));
}

var _uiPanel2;

function _uiPanel() {
  return _uiPanel2 = require('./ui/Panel');
}

var _nullthrows2;

function _nullthrows() {
  return _nullthrows2 = _interopRequireDefault(require('nullthrows'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

/**
 * Manages views for an Atom panel.
 */

var PanelLocation = (function (_SimpleModel) {
  _inherits(PanelLocation, _SimpleModel);

  function PanelLocation(locationId) {
    var serializedState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, PanelLocation);

    _get(Object.getPrototypeOf(PanelLocation.prototype), 'constructor', this).call(this);
    this._handlePanelResize = this._handlePanelResize.bind(this);
    var serializedData = serializedState.data || {};
    this._paneContainer = deserializePaneContainer(serializedData.paneContainer);
    this._position = (0, (_nullthrows2 || _nullthrows()).default)(locationsToPosition.get(locationId));
    this._panelRenderer = new (_commonsAtomPanelRenderer2 || _commonsAtomPanelRenderer()).default({
      priority: 101, // Use a value higher than the default (100).
      location: this._position,
      createItem: this._createItem.bind(this)
    });
    this._panes = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(new Set());
    this._size = serializedData.size || null;
    this.state = {
      visible: serializedData.visible === true
    };
  }

  /**
   * Set up the subscriptions and make this thing "live."
   */

  _createClass(PanelLocation, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      var paneContainer = this._paneContainer;

      // Create a stream that represents a change in the items of any pane. We need to do custom logic
      // for this instead of using `PaneContainer::observePaneItems()`, or the other PaneContainer
      // item events, because those [assume that moved items are not switching pane containers][1].
      // Since we have multiple pane containers, they can.
      //
      // [1]: https://github.com/atom/atom/blob/v1.10.0/src/pane-container.coffee#L232-L236
      var paneItemChanges = this._panes.map(function (x) {
        return Array.from(x);
      }).switchMap(function (panes) {
        var _Observable;

        var itemChanges = panes.map(function (pane) {
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(pane.onDidAddItem.bind(pane)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(pane.onDidRemoveItem.bind(pane)));
        });
        return (_Observable = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(itemChanges));
      });

      this._disposables = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._panelRenderer, (0, (_observePanes2 || _observePanes()).observePanes)(paneContainer).subscribe(this._panes), (0, (_syncPaneItemVisibility2 || _syncPaneItemVisibility()).syncPaneItemVisibility)(this._panes,
      // $FlowFixMe: Teach Flow about Symbol.observable
      (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this).map(function (state) {
        return state.visible;
      }).distinctUntilChanged()),

      // Add a tab bar to any panes created in the container.
      paneContainer.observePanes(function (pane) {
        var tabBarView = document.createElement('ul', 'atom-tabs');

        // This should always be true. Unless they don't have atom-tabs installed or something. Do
        // we need to wait for activation of atom-tabs?
        if (typeof tabBarView.initialize !== 'function') {
          return;
        }

        tabBarView.initialize(pane);
        var paneElement = atom.views.getView(pane);
        paneElement.insertBefore(tabBarView, paneElement.firstChild);
      }),

      // Render whenever the state changes. Note that state is shared between this instance and the
      // pane container, so we have to watch it as well.
      (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(paneItemChanges,
      // $FlowIssue: We need to teach flow about Symbol.observable.
      (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this).map(function (state) {
        return state.visible;
      }).distinctUntilChanged()).subscribe(function () {
        _this._render();
      }));
    }
  }, {
    key: '_render',
    value: function _render() {
      // Only show the panel if it's supposed to be visible *and* there are items to show in it
      // (even if `core.destroyEmptyPanes` is `false`).
      var shouldBeVisible = this.state.visible && this._paneContainer.getPaneItems().length > 0;
      this._panelRenderer.render({ visible: shouldBeVisible });
    }
  }, {
    key: '_createItem',
    value: function _createItem() {
      var _this2 = this;

      // Create an item to display in the panel. Atom will associate this item with a view via the
      // view registry (and its `getElement` method). That view will be used to display views for this
      // panel.
      // $FlowIssue: We need to teach flow about Symbol.observable.
      var props = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(this).map(function (state) {
        return {
          initialSize: _this2._size,
          item: _this2._paneContainer,
          position: _this2._position,
          onResize: _this2._handlePanelResize
        };
      });
      var Component = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, (_uiPanel2 || _uiPanel()).Panel);
      return { getElement: function getElement() {
          return (0, (_commonsAtomRenderReactRoot2 || _commonsAtomRenderReactRoot()).renderReactRoot)((_reactForAtom2 || _reactForAtom()).React.createElement(Component, null));
        } };
    }
  }, {
    key: '_handlePanelResize',
    value: function _handlePanelResize(size) {
      // If the user resizes the pane, store it so that we can serialize it for the next session.
      this._size = size;
    }
  }, {
    key: 'itemIsVisible',
    value: function itemIsVisible(item) {
      if (!this.state.visible) {
        return false;
      }
      for (var pane of this._panes.getValue()) {
        if (item === pane.getActiveItem()) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._disposables.dispose();
      this._paneContainer.destroy();
    }
  }, {
    key: 'destroyItem',
    value: function destroyItem(item) {
      for (var pane of this._panes.getValue()) {
        for (var it of pane.getItems()) {
          if (it === item) {
            pane.destroyItem(it);
          }
        }
      }
    }
  }, {
    key: 'getItems',
    value: function getItems() {
      var items = [];
      for (var pane of this._panes.getValue()) {
        items.push.apply(items, _toConsumableArray(pane.getItems()));
      }
      return items;
    }
  }, {
    key: 'showItem',
    value: function showItem(item) {
      var pane = this._paneContainer.paneForItem(item);
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
  }, {
    key: 'hideItem',
    value: function hideItem(item) {
      var itemIsVisible = this._paneContainer.getPanes().some(function (pane) {
        return pane.getActiveItem() === item;
      });

      // If the item's already hidden, we're done.
      if (!itemIsVisible) {
        return;
      }

      // Otherwise, hide the panel altogether.
      this.setState({ visible: false });
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.state.visible;
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.setState({ visible: !this.state.visible });
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'PanelLocation',
        data: {
          paneContainer: this._paneContainer == null ? null : this._paneContainer.serialize(),
          size: this._size,
          visible: this.state.visible
        }
      };
    }
  }]);

  return PanelLocation;
})((_commonsNodeSimpleModel2 || _commonsNodeSimpleModel()).SimpleModel);

exports.PanelLocation = PanelLocation;

function deserializePaneContainer(serialized) {
  var paneContainer = (0, (_commonsAtomCreatePaneContainer2 || _commonsAtomCreatePaneContainer()).default)();
  if (serialized != null) {
    paneContainer.deserialize(serialized, atom.deserializers);
  }
  return paneContainer;
}

var locationsToPosition = new Map([[(_PanelLocationIds2 || _PanelLocationIds()).TOP_PANEL, 'top'], [(_PanelLocationIds2 || _PanelLocationIds()).RIGHT_PANEL, 'right'], [(_PanelLocationIds2 || _PanelLocationIds()).BOTTOM_PANEL, 'bottom'], [(_PanelLocationIds2 || _PanelLocationIds()).LEFT_PANEL, 'left']]);