'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuxManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = require('../../commons-node/passesGK');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _NuxStore;

function _load_NuxStore() {
  return _NuxStore = require('./NuxStore');
}

var _NuxTour;

function _load_NuxTour() {
  return _NuxTour = require('./NuxTour');
}

var _NuxView;

function _load_NuxView() {
  return _NuxView = require('./NuxView');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Limits the number of NUXes displayed every session
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const NUX_PER_SESSION_LIMIT = 3;
const NEW_TOUR_EVENT = 'nuxTourNew';
const READY_TOUR_EVENT = 'nuxTourReady';

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-nux');

class NuxManager {
  // Maps a NUX's unique ID to its corresponding NuxTour
  // Registered NUXes that are waiting to be triggered
  constructor(nuxStore, syncCompletedNux) {
    this._nuxStore = nuxStore;
    this._syncCompletedNux = syncCompletedNux;

    this._emitter = new _atom.Emitter();
    this._disposables = new _atom.CompositeDisposable();

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

  // Triggered NUXes that are waiting to be displayed
  addNewNux(nux) {
    this._nuxStore.addNewNux(nux);
    return new _atom.Disposable(() => {
      this._removeNux(nux.id);
    });
  }

  _removeNux(id) {
    if (this._activeNuxTour != null && this._activeNuxTour.getID() === id) {
      this._activeNuxTour.forceEnd();
      return;
    }
    this._pendingNuxes.delete(id);
    this._removeNuxFromList(this._readyToDisplayNuxes, id);
  }

  _removeNuxFromList(list, id) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].getID() === id) {
        list.splice(i--, 1);
        return;
      }
    }
  }

  // Handles new NUXes emitted from the store
  _handleNewNux(nuxTourModel) {
    const nuxViews = (0, (_collection || _load_collection()).arrayCompact)(nuxTourModel.nuxList.map((model, index, arr) => {
      try {
        return new (_NuxView || _load_NuxView()).NuxView(nuxTourModel.id, model.selector, model.selectorFunction, model.position, model.content, model.completionPredicate, index, arr.length);
      } catch (err) {
        const error = `NuxView #${index} for "${nuxTourModel.id}" failed to instantiate.`;
        logger.error(`ERROR: ${error}`);
        this._track(nuxTourModel.id, nuxTourModel.name, `NuxView #${index + 1} failed to instantiate.`, err.toString());
        return null;
      }
    }));

    const nuxTour = new (_NuxTour || _load_NuxTour()).NuxTour(nuxTourModel.id, nuxTourModel.name, nuxViews, nuxTourModel.trigger, nuxTourModel.gatekeeperID);

    this._emitter.emit(NEW_TOUR_EVENT, {
      nuxTour,
      nuxTourModel
    });
  }

  _handleNuxCompleted(nuxTourModel) {
    this._activeNuxTour = null;
    this._nuxStore.onNuxCompleted(nuxTourModel);
    this._syncCompletedNux(nuxTourModel.id);
    if (this._readyToDisplayNuxes.length === 0) {
      return;
    }
    const nextNux = this._readyToDisplayNuxes.shift();
    this._emitter.emit(READY_TOUR_EVENT, nextNux);
  }

  // Handles NUX registry
  _handleNewTour(value) {
    const { nuxTour, nuxTourModel } = value;

    nuxTour.setNuxCompleteCallback(this._handleNuxCompleted.bind(this, nuxTourModel));

    this._pendingNuxes.set(nuxTour.getID(), nuxTour);
  }

  // Handles triggered NUXes that are ready to be displayed
  _handleReadyTour(nuxTour) {
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
  _handleActivePaneItemChanged(paneItem) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // The `paneItem` is not guaranteed to be an instance of `TextEditor` from
      // Atom's API, but usually is.  We return if the type is not `TextEditor`
      // since `NuxTour.isReady` expects a `TextEditor` as its argument.
      if (!(0, (_textEditor || _load_textEditor()).isValidTextEditor)(paneItem)) {
        return;
      }
      // Flow doesn't understand the refinement done above.
      const textEditor = paneItem;

      for (const [id, nux] of _this._pendingNuxes.entries()) {
        if (nux.getTriggerType() !== 'editor' || !nux.isReady(textEditor)) {
          continue;
        }
        // Remove NUX from pending list.
        _this._pendingNuxes.delete(id);
        // We do the above regardless of whether the following GK checks pass/fail
        // to avoid repeating the checks again.
        const gkID = nux.getGatekeeperID();
        try {
          // Disable the linter suggestion to use `Promise.all` as we want to trigger NUXes
          // as soon as each promise resolves rather than waiting for them all to.
          // eslint-disable-next-line no-await-in-loop
          if (yield _this._canTriggerNux(gkID)) {
            _this._emitter.emit(READY_TOUR_EVENT, nux);
          }
        } catch (err) {
          // Errors if the NuxManager was disposed while awaiting the result
          // so we don't search the rest of the list.
          return;
        }
      }
    })();
  }

  /*
   * A function exposed externally via a service that tries to trigger a NUX.
   */
  tryTriggerNux(id) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const nuxToTrigger = _this2._pendingNuxes.get(id);
      // Silently fail if the NUX is not found. This isn't an "error" to log, since the NUX
      // may be triggered again even after it has been seen, but should only be shown once.
      if (nuxToTrigger == null) {
        return;
      }

      // Remove NUX from pending list.
      _this2._pendingNuxes.delete(id);
      // We do the above regardless of whether the following GK checks pass/fail
      // to avoid repeating the checks again.
      const gkID = nuxToTrigger.getGatekeeperID();
      try {
        if (yield _this2._canTriggerNux(gkID)) {
          _this2._emitter.emit(READY_TOUR_EVENT, nuxToTrigger);
        }
      } catch (err) {}
    })();
  }

  /*
   * Given a NUX-specific GK, determines whether the NUX can be displayed to the user.
   *
   * @return {Promise<boolean>} A promise that rejects if the manager disposes when waiting
   *  on GKs, or resolves a boolean describing whether or not the NUX should be displayed.
   */
  _canTriggerNux(gkID) {
    return new Promise((resolve, reject) => {
      const cleanupDisposable = new _atom.Disposable(() => {
        gkDisposable.dispose();
        reject(new Error('NuxManager was disposed while waiting on GKs.'));
      });
      const gkDisposable = (0, (_passesGK || _load_passesGK()).onceGkInitialized)(() => {
        // Only show the NUX if
        //  a) the user is an OSS user OR
        //  b) the user is an internal user and passes the `nuclide_all_nuxes` GK AND
        //     i) either there is no NUX-specific GK OR
        //    ii) there is a NUX-specific GK and the user passes it
        const shouldShowNuxes = (0, (_passesGK || _load_passesGK()).isGkEnabled)('cpe_nuclide') ? (0, (_passesGK || _load_passesGK()).isGkEnabled)('nuclide_all_nuxes') && (gkID == null || (0, (_passesGK || _load_passesGK()).isGkEnabled)(gkID)) : true;

        // No longer need to cleanup
        this._disposables.remove(cleanupDisposable);
        this._disposables.remove(gkDisposable);

        // `isGkEnabled` returns a nullable boolean, so check for strict equality
        resolve(shouldShowNuxes === true);
      });
      this._disposables.add(gkDisposable, cleanupDisposable);
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  _track(tourId, tourName, message, error = null) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nux-manager-action', {
      tourId,
      tourName,
      message: `${message}`,
      error: (0, (_string || _load_string()).maybeToString)(error)
    });
  }
}
exports.NuxManager = NuxManager;