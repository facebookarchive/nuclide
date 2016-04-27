Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideAnalytics = require('../../nuclide-analytics');

function trackSplit(operation, splitOperation) {
  (0, _nuclideAnalytics.trackOperationTiming)('nuclide-move-pane:move-tab-to-new-pane-' + operation, function () {
    doSplit(splitOperation);
  });
}

function doSplit(splitOperation) {
  var pane = atom.workspace.getActivePane();
  if (pane) {
    // Note that this will (intentionally) create an empty pane if the active
    // pane contains exactly zero or one items.
    // The new empty pane will be kept if the global atom setting
    // 'Destroy Empty Panes' is false, otherwise it will be removed.
    var newPane = splitOperation(pane, { copyActiveItem: false });
    var item = pane.getActiveItem();
    if (item) {
      pane.moveItemToPane(item, newPane, 0);
    }
  }
}

function splitUp() {
  trackSplit('up', function (pane, params) {
    return pane.splitUp(params);
  });
}

function splitDown() {
  trackSplit('down', function (pane, params) {
    return pane.splitDown(params);
  });
}

function splitRight() {
  trackSplit('right', function (pane, params) {
    return pane.splitRight(params);
  });
}

function splitLeft() {
  trackSplit('left', function (pane, params) {
    return pane.splitLeft(params);
  });
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-up', splitUp));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-down', splitDown));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-left', splitLeft));
    this._subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-move-pane:move-tab-to-new-pane-right', splitRight));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}