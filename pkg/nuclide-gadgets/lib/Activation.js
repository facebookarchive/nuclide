var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _Commands2;

function _Commands() {
  return _Commands2 = _interopRequireDefault(require('./Commands'));
}

var _createGadgetsService2;

function _createGadgetsService() {
  return _createGadgetsService2 = _interopRequireDefault(require('./createGadgetsService'));
}

var _createAtomCommands2;

function _createAtomCommands() {
  return _createAtomCommands2 = _interopRequireDefault(require('./createAtomCommands'));
}

var _createStateStream2;

function _createStateStream() {
  return _createStateStream2 = _interopRequireDefault(require('./createStateStream'));
}

var _getInitialState2;

function _getInitialState() {
  return _getInitialState2 = _interopRequireDefault(require('./getInitialState'));
}

var _commonsAtomSyncAtomCommands2;

function _commonsAtomSyncAtomCommands() {
  return _commonsAtomSyncAtomCommands2 = _interopRequireDefault(require('../../commons-atom/sync-atom-commands'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _trackActions2;

function _trackActions() {
  return _trackActions2 = _interopRequireDefault(require('./trackActions'));
}

var Activation = (function () {
  function Activation(initialState) {
    var _this = this;

    _classCallCheck(this, Activation);

    initialState = (0, (_getInitialState2 || _getInitialState()).default)();
    var action$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
    var state$ = (0, (_createStateStream2 || _createStateStream()).default)(action$, initialState);
    var commands = this.commands = new (_Commands2 || _Commands()).default(action$, function () {
      return state$.getValue();
    });

    var getGadgets = function getGadgets(state) {
      return state.get('gadgets');
    };
    var gadget$ = state$.map(getGadgets).distinctUntilChanged();

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(action$),

    // Re-render all pane items when (1) new items are added, (2) new gadgets are registered and
    // (3) the active pane item changes.
    new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.observePaneItems.bind(atom.workspace)).merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))).merge(gadget$).sampleTime(100).subscribe(function () {
      return _this.commands.renderPaneItems();
    })),

    // Clean up when pane items are destroyed.
    new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace)).subscribe(function (_ref) {
      var item = _ref.item;
      return _this.commands.cleanUpDestroyedPaneItem(item);
    })),

    // Keep the atom commands up to date with the registered gadgets.
    (0, (_commonsAtomSyncAtomCommands2 || _commonsAtomSyncAtomCommands()).default)(gadget$.map(function (gadgetsMap) {
      return new Set(gadgetsMap.values());
    }), function (gadget) {
      return (0, (_createAtomCommands2 || _createAtomCommands()).default)(gadget, commands);
    }),

    // Collect some analytics about gadget actions.
    (0, (_trackActions2 || _trackActions()).default)(action$),

    // Update the expanded Flex scale whenever the user starts dragging a handle. Use the capture
    // phase since resize handles stop propagation of the event during the bubbling phase.
    new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEventPattern(function (handler) {
      document.addEventListener('mousedown', handler, true);
    }, function (handler) {
      document.removeEventListener('mousedown', handler, true);
    }).filter(function (event) {
      return event.target.nodeName.toLowerCase() === 'atom-pane-resize-handle';
    })
    // Get the models that represent the containers being resized:
    .flatMap(function (event) {
      var handleElement = event.target;
      return [handleElement.previousElementSibling && handleElement.previousElementSibling.model, handleElement.nextElementSibling && handleElement.nextElementSibling.model].filter(function (paneItemContainer) {
        return paneItemContainer !== null;
      });
    })
    // Make sure these are actually pane item containers:
    .filter(function (paneItemContainer) {
      return 'getItems' in paneItemContainer && 'getFlexScale' in paneItemContainer;
    }).subscribe(function (paneItemContainer) {
      return _this.commands.updateExpandedFlexScale(paneItemContainer);
    })));
  }

  _createClass(Activation, [{
    key: 'deactivate',
    value: function deactivate() {
      this.commands.deactivate();
      this._disposables.dispose();
    }
  }, {
    key: 'provideGadgetsService',
    value: function provideGadgetsService() {
      if (this._gadgetsService == null) {
        var _ref2 = (0, (_createGadgetsService2 || _createGadgetsService()).default)(this.commands);

        var service = _ref2.service;
        var dispose = _ref2.dispose;

        this._disposables.add({ dispose: dispose });
        this._gadgetsService = service;
      }
      return this._gadgetsService;
    }
  }]);

  return Activation;
})();

module.exports = Activation;