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

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _PanelLocationIds2;

function _PanelLocationIds() {
  return _PanelLocationIds2 = _interopRequireWildcard(require('./PanelLocationIds'));
}

var _uiPanel2;

function _uiPanel() {
  return _uiPanel2 = require('./ui/Panel');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
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
    this._locationId = locationId;
    var serializedData = serializedState.data || {};
    this._paneContainer = deserializePaneContainer(serializedData.paneContainer);
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

      this._disposables = new (_atom2 || _atom()).CompositeDisposable(

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
      new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(paneContainer.onDidAddPaneItem.bind(paneContainer)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(paneContainer.onDidDestroyPaneItem.bind(paneContainer)),
      // $FlowIssue: We need to teach flow about Symbol.observable.
      (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(this).map(function (state) {
        return state.visible;
      }).distinctUntilChanged()).subscribe(function () {
        _this._render();
      })));
    }
  }, {
    key: '_render',
    value: function _render() {
      // Only show the panel if it's supposed to be visible *and* there are items to show in it
      // (even if `core.destroyEmptyPanes` is `false`).
      var shouldBeVisible = this.state.visible && this._paneContainer.getPaneItems().length > 0;
      if (shouldBeVisible) {
        // Lazily create the panel the first time we want to show it.
        this._createPanel();
        (0, (_assert2 || _assert()).default)(this._panel != null);
        this._panel.show();
      } else if (this._panel != null) {
        this._panel.hide();
      }
    }
  }, {
    key: '_createPanel',
    value: function _createPanel() {
      var _this2 = this;

      if (this._panel != null) {
        return;
      }

      // Create an item to display in the panel. Atom will associate this item with a view via the
      // view registry (and its `getElement` method). That view will be used to display views for this
      // panel.
      // $FlowIssue: We need to teach flow about Symbol.observable.
      var props = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.from(this).map(function (state) {
        return {
          initialSize: _this2._size,
          item: _this2._paneContainer,
          position: locationsToPosition.get(_this2._locationId),
          onResize: _this2._handlePanelResize
        };
      });
      var Component = (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(props, (_uiPanel2 || _uiPanel()).Panel);
      // $FlowFixMe: Flow doesn't understand bindObservableAsProps
      var item = { getElement: function getElement() {
          return (0, (_commonsAtomRenderReactRoot2 || _commonsAtomRenderReactRoot()).renderReactRoot)((_reactForAtom2 || _reactForAtom()).React.createElement(Component, null));
        } };

      // Create the panel and add the item to it.
      var addPanel = locationsToAddPanelFunctions.get(this._locationId);
      (0, (_assert2 || _assert()).default)(addPanel != null);
      this._panel = addPanel({ item: item, visible: true });
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
      for (var pane of this._paneContainer.getPanes()) {
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

      if (this._panel != null) {
        this._panel.destroy();
      }
    }
  }, {
    key: 'destroyItem',
    value: function destroyItem(item) {
      for (var pane of this._paneContainer.getPanes()) {
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
      for (var pane of this._paneContainer.getPanes()) {
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
     * Hide the specified item. Currently, the panels are modal (they show one item at a time), so we
     * just hide the whole thing (iff the provided item is the visible one). In the future, we may
     * have tabs or configurable behavior and this will change.
     */
  }, {
    key: 'hideItem',
    value: function hideItem(item) {
      var activeItem = this._paneContainer.getActivePaneItem();

      // Since we're only showing the active item, if a different item is active, we know that this
      // item's already hidden and we don't have to do anything.
      if (item !== activeItem) {
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

var locationsToAddPanelFunctions = new Map([[(_PanelLocationIds2 || _PanelLocationIds()).TOP_PANEL, atom.workspace.addTopPanel.bind(atom.workspace)], [(_PanelLocationIds2 || _PanelLocationIds()).RIGHT_PANEL, atom.workspace.addRightPanel.bind(atom.workspace)], [(_PanelLocationIds2 || _PanelLocationIds()).BOTTOM_PANEL, atom.workspace.addBottomPanel.bind(atom.workspace)], [(_PanelLocationIds2 || _PanelLocationIds()).LEFT_PANEL, atom.workspace.addLeftPanel.bind(atom.workspace)]]);

var locationsToPosition = new Map([[(_PanelLocationIds2 || _PanelLocationIds()).TOP_PANEL, 'top'], [(_PanelLocationIds2 || _PanelLocationIds()).RIGHT_PANEL, 'right'], [(_PanelLocationIds2 || _PanelLocationIds()).BOTTOM_PANEL, 'bottom'], [(_PanelLocationIds2 || _PanelLocationIds()).LEFT_PANEL, 'left']]);