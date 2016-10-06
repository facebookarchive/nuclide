Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Limits the number of NUXes displayed every session

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = require('../../commons-node/passesGK');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
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

var NUX_PER_SESSION_LIMIT = 3;
var NEW_TOUR_EVENT = 'nuxTourNew';
var READY_TOUR_EVENT = 'nuxTourReady';

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var NuxManager = (function () {
  function NuxManager(nuxStore, syncCompletedNux) {
    _classCallCheck(this, NuxManager);

    this._nuxStore = nuxStore;
    this._syncCompletedNux = syncCompletedNux;

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._pendingNuxes = new Map();
    this._readyToDisplayNuxes = [];
    this._activeNuxTour = null;
    this._numNuxesDisplayed = 0;

    this._emitter.on(NEW_TOUR_EVENT, this._handleNewTour.bind(this));
    this._emitter.on(READY_TOUR_EVENT, this._handleReadyTour.bind(this));

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

      var nuxViews = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(nuxTourModel.nuxList.map(function (model, index, arr) {
        try {
          return new (_NuxView2 || _NuxView()).NuxView(nuxTourModel.id, model.selector, model.selectorFunction, model.position, model.content, model.completionPredicate, index, arr.length);
        } // Number of NuxViewModels in the NuxTourModel
        catch (err) {
          var error = 'NuxView #' + index + ' for "' + nuxTourModel.id + '" failed to instantiate.';
          logger.error('ERROR: ' + error);
          _this2._track(nuxTourModel.id, nuxTourModel.name, 'NuxView #' + (index + 1) + ' failed to instantiate.', err.toString());
          return null;
        }
      }));

      var nuxTour = new (_NuxTour2 || _NuxTour()).NuxTour(nuxTourModel.id, nuxTourModel.name, nuxViews, nuxTourModel.trigger, nuxTourModel.gatekeeperID);

      this._emitter.emit(NEW_TOUR_EVENT, {
        nuxTour: nuxTour,
        nuxTourModel: nuxTourModel
      });
    }
  }, {
    key: '_handleNuxCompleted',
    value: function _handleNuxCompleted(nuxTourModel) {
      this._activeNuxTour = null;
      this._nuxStore.onNuxCompleted(nuxTourModel);
      this._syncCompletedNux(nuxTourModel.id);
      if (this._readyToDisplayNuxes.length === 0) {
        return;
      }
      var nextNux = this._readyToDisplayNuxes.shift();
      this._emitter.emit(READY_TOUR_EVENT, nextNux);
    }

    // Handles NUX registry
  }, {
    key: '_handleNewTour',
    value: function _handleNewTour(value) {
      var nuxTour = value.nuxTour;
      var nuxTourModel = value.nuxTourModel;

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
        this._track(nuxTour.getID(), nuxTour.getName(), 'Triggered new nux');
      } else {
        this._readyToDisplayNuxes.push(nuxTour);
      }
    }

    /*
     * An internal function that tries to trigger a NUX if its trigger type is
     * 'editor' and its `isReady` function returns to `true`.
     * Called every time the active pane item changes.
     */
  }, {
    key: '_handleActivePaneItemChanged',
    value: _asyncToGenerator(function* (paneItem) {
      // The `paneItem` is not guaranteed to be an instance of `TextEditor` from
      // Atom's API, but usually is.  We return if the type is not `TextEditor`
      // since `NuxTour.isReady` expects a `TextEditor` as its argument.
      if (!atom.workspace.isTextEditor(paneItem)) {
        return;
      }
      // Flow doesn't understand the refinement done above.
      var textEditor = paneItem;

      for (var _ref3 of this._pendingNuxes.entries()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var id = _ref2[0];
        var nux = _ref2[1];

        if (nux.getTriggerType() !== 'editor' || !nux.isReady(textEditor)) {
          continue;
        }
        // Remove NUX from pending list.
        this._pendingNuxes.delete(id);
        // We do the above regardless of whether the following GK checks pass/fail
        // to avoid repeating the checks again.
        var gkID = nux.getGatekeeperID();
        try {
          // Disable the linter suggestion to use `Promise.all` as we want to trigger NUXes
          // as soon as each promise resolves rather than waiting for them all to.
          // eslint-disable-next-line babel/no-await-in-loop
          if (yield this._canTriggerNux(gkID)) {
            this._emitter.emit(READY_TOUR_EVENT, nux);
          }
        } catch (err) {
          // Errors if the NuxManager was disposed while awaiting the result
          // so we don't search the rest of the list.
          return;
        }
      }
    })

    /*
     * A function exposed externally via a service that tries to trigger a NUX.
     */
  }, {
    key: 'tryTriggerNux',
    value: _asyncToGenerator(function* (id) {
      var nuxToTrigger = this._pendingNuxes.get(id);
      // Silently fail if the NUX is not found. This isn't an "error" to log, since the NUX
      // may be triggered again even after it has been seen, but should only be shown once.
      if (nuxToTrigger == null) {
        return;
      }

      // Remove NUX from pending list.
      this._pendingNuxes.delete(id);
      // We do the above regardless of whether the following GK checks pass/fail
      // to avoid repeating the checks again.
      var gkID = nuxToTrigger.getGatekeeperID();
      try {
        if (yield this._canTriggerNux(gkID)) {
          this._emitter.emit(READY_TOUR_EVENT, nuxToTrigger);
        }
      } catch (err) {}
    })

    /*
     * Given a NUX-specific GK, determines whether the NUX can be displayed to the user.
     *
     * @return {Promise<boolean>} A promise that rejects if the manager disposes when waiting
     *  on GKs, or resolves a boolean describing whether or not the NUX should be displayed.
     */
  }, {
    key: '_canTriggerNux',
    value: function _canTriggerNux(gkID) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var cleanupDisposable = new (_atom2 || _atom()).Disposable(function () {
          gkDisposable.dispose();
          reject(new Error('NuxManager was disposed while waiting on GKs.'));
        });
        var gkDisposable = (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).onceGkInitialized)(function () {
          // Only show the NUX if
          //  a) the user is an OSS user OR
          //  b) the user is an internal user and passes the `nuclide_all_nuxes` GK AND
          //     i) either there is no NUX-specific GK OR
          //    ii) there is a NUX-specific GK and the user passes it
          var shouldShowNuxes = (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).isGkEnabled)('cpe_nuclide') ? (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).isGkEnabled)('nuclide_all_nuxes') && (gkID == null || (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).isGkEnabled)(gkID)) : true;

          // No longer need to cleanup
          _this3._disposables.remove(cleanupDisposable);
          _this3._disposables.remove(gkDisposable);

          // `isGkEnabled` returns a nullable boolean, so check for strict equality
          resolve(shouldShowNuxes === true);
        });
        _this3._disposables.add(gkDisposable, cleanupDisposable);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: '_track',
    value: function _track(tourId, tourName, message) {
      var error = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nux-manager-action', {
        tourId: tourId,
        tourName: tourName,
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