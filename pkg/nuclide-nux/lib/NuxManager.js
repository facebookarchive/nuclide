Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = _interopRequireDefault(require('../../nuclide-analytics'));
}

var _NuxStore2;

function _NuxStore() {
  return _NuxStore2 = require('./NuxStore');
}

var _NuxTour2;

function _NuxTour() {
  return _NuxTour2 = require('./NuxTour');
}

var _NuxView2;

function _NuxView() {
  return _NuxView2 = require('./NuxView');
}

var GK_NUX = 'nuclide_all_nuxes';
exports.GK_NUX = GK_NUX;
// Limits the number of NUXes displayed every session
var NUX_PER_SESSION_LIMIT = 3;

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var NuxManager = (function () {
  function NuxManager(nuxStore) {
    _classCallCheck(this, NuxManager);

    this._nuxStore = nuxStore;

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._pendingNuxes = new Map();
    this._readyToDisplayNuxes = [];
    this._activeNuxTour = null;
    this._numNuxesDisplayed = 0;

    this._emitter.on('newTour', this._handleNewTour.bind(this));
    this._emitter.on('nuxTourReady', this._handleReadyTour.bind(this));

    this._disposables.add(this._nuxStore.onNewNux(this._handleNewNux.bind(this)));
    this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(this._handleActivePaneItemChanged.bind(this)));

    this._nuxStore.initialize();
  }

  // Routes new NUX through the NuxStore so that the store can deal with
  // registering of previously completed or existing NUXes.

  _createClass(NuxManager, [{
    key: 'addNewNux',
    value: function addNewNux(nux) {
      var _this = this;

      this._nuxStore.addNewNux(nux);
      return new (_atom2 || _atom()).Disposable(function () {
        _this._removeNux(nux.id);
      });
    }
  }, {
    key: '_removeNux',
    value: function _removeNux(id) {
      if (this._activeNuxTour != null && this._activeNuxTour.getID() === id) {
        this._activeNuxTour.forceEnd();
        return;
      }
      this._pendingNuxes.delete(id);
      this._removeNuxFromList(this._readyToDisplayNuxes, id);
    }
  }, {
    key: '_removeNuxFromList',
    value: function _removeNuxFromList(list, id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].getID() === id) {
          list.splice(i--, 1);
          return;
        }
      }
    }

    // Handles new NUXes emitted from the store
  }, {
    key: '_handleNewNux',
    value: function _handleNewNux(nuxTourModel) {
      var _this2 = this;

      if (nuxTourModel.completed) {
        return;
      }

      var nuxViews = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(nuxTourModel.nuxList.map(function (model, index) {
        try {
          return new (_NuxView2 || _NuxView()).NuxView(nuxTourModel.id, model.selector, model.selectorFunction, model.position, model.content, model.isCustomContent, model.completionPredicate, index);
        } catch (err) {
          var error = 'NuxView #' + index + ' for "' + nuxTourModel.id + '" failed to instantiate.';
          logger.error('ERROR: ' + error);
          _this2._track(nuxTourModel.id, 'NuxView #' + (index + 1) + ' failed to instantiate.', err.toString());
          return null;
        }
      }));

      var nuxTour = new (_NuxTour2 || _NuxTour()).NuxTour(nuxTourModel.id, nuxViews, nuxTourModel.trigger);

      this._emitter.emit('newTour', {
        nuxTour: nuxTour,
        nuxTourModel: nuxTourModel
      });
    }
  }, {
    key: '_handleNuxCompleted',
    value: function _handleNuxCompleted(nuxTourModel) {
      this._activeNuxTour = null;
      this._nuxStore.onNuxCompleted(nuxTourModel);
      if (this._readyToDisplayNuxes.length === 0) {
        return;
      }
      var nextNux = this._readyToDisplayNuxes.shift();
      this._emitter.emit('nuxTourReady', nextNux);
    }

    // Handles NUX registry
  }, {
    key: '_handleNewTour',
    value: function _handleNewTour(value) {
      var nuxTour = value.nuxTour;
      var nuxTourModel = value.nuxTourModel;

      if (nuxTourModel.gatekeeperID != null && !((0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_NUX) && (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(nuxTourModel.gatekeeperID))) {
        return;
      }
      nuxTour.setNuxCompleteCallback(this._handleNuxCompleted.bind(this, nuxTourModel));
      this._pendingNuxes.set(nuxTour.getID(), nuxTour);
    }

    // Handles triggered NUXes that are ready to be displayed
  }, {
    key: '_handleReadyTour',
    value: function _handleReadyTour(nuxTour) {
      if (this._activeNuxTour == null && this._numNuxesDisplayed < NUX_PER_SESSION_LIMIT) {
        this._numNuxesDisplayed++;
        this._activeNuxTour = nuxTour;
        nuxTour.begin();
        this._track(nuxTour.getID(), 'Triggered new nux');
      } else {
        this._readyToDisplayNuxes.push(nuxTour);
      }
    }
  }, {
    key: '_handleActivePaneItemChanged',
    value: function _handleActivePaneItemChanged(paneItem) {
      var _this3 = this;

      // The `paneItem` is not guaranteed to be an instance of `TextEditor` from
      // Atom's API, but usually is.  We return if the type is not `TextEditor`
      // since the `NuxTour.isReady` expects a `TextEditor` as its argument.
      if (!atom.workspace.isTextEditor(paneItem)) {
        return;
      }
      // Flow doesn't understand the refinement done above.
      var textEditor = paneItem;
      this._pendingNuxes.forEach(function (nux, id) {
        if (nux.getTriggerType() !== 'editor' || !nux.isReady(textEditor)) {
          return;
        }
        _this3._pendingNuxes.delete(id);
        _this3._emitter.emit('nuxTourReady', nux);
      });
    }
  }, {
    key: 'tryTriggerNux',
    value: function tryTriggerNux(id) {
      var nuxToTrigger = this._pendingNuxes.get(id);
      // Silently fail if the NUX is not found or has already been completed.
      // This isn't really an "error" to log, since the NUX may be triggered quite
      // often even after it has been seen as it is tied to a package that is
      // instantiated every single time a window is opened.
      if (nuxToTrigger == null || nuxToTrigger.completed) {
        return;
      }
      // Remove from pending list
      this._pendingNuxes.delete(id);
      this._emitter.emit('nuxTourReady', nuxToTrigger);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_track',
    value: function _track(id, message) {
      var error = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      (_nuclideAnalytics2 || _nuclideAnalytics()).default.track('nux-manager-action', {
        tourId: id,
        message: '' + message,
        error: (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(error)
      });
    }
  }]);

  return NuxManager;
})();

exports.NuxManager = NuxManager;

// Maps a NUX's unique ID to its corresponding NuxTour
// Registered NUXes that are waiting to be triggered

// Triggered NUXes that are waiting to be displayed