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

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _main2;

function _main() {
  return _main2 = require('./main');
}

var NuxStore = (function () {
  function NuxStore() {
    var shouldSeedNux = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    _classCallCheck(this, NuxStore);

    this._shouldSeedNux = shouldSeedNux;

    this._nuxList = [];
    this._emitter = new (_atom2 || _atom()).Emitter();
  }

  _createClass(NuxStore, [{
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
    }

    // Tries to load saved NUXes.
    // If none exist, will attempt to seed a NUX iff `_seedNux` is true.
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      var serializedNuxes = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get((_main2 || _main()).NUX_SAVED_STORE);
      if (Array.isArray(serializedNuxes)) {
        serializedNuxes.forEach(function (nux) {
          _this.addNewNux(nux);
        });
        return;
      }
      if (this._shouldSeedNux) {
        this.addNewNux(this._createSampleNux());
      }
    }
  }, {
    key: '_createSampleNux',
    value: function _createSampleNux() {
      var nuxTriggerOutline = {
        content: 'Check out the new Outline View!',
        isCustomContent: false,
        selector: '.icon-list-unordered',
        selectorFunction: null,
        position: 'auto',
        displayPredicate: null,
        completionPredicate: function completionPredicate() {
          return document.querySelector('div.nuclide-outline-view') != null;
        },
        completed: false
      };

      var nuxOutlineView = {
        content: 'Click on a symbol to jump to its definition.',
        isCustomContent: false,
        selector: 'div.pane-item.nuclide-outline-view',
        selectorFunction: null,
        position: 'left',
        displayPredicate: function displayPredicate() {
          return document.querySelector('div.nuclide-outline-view') != null;
        },
        completionPredicate: null,
        completed: false
      };
      var sampleOutlineNuxTour = {
        completed: false,
        id: (_main2 || _main()).NUX_SAMPLE_OUTLINE_VIEW_TOUR,
        nuxList: [nuxTriggerOutline, nuxOutlineView]
      };
      return sampleOutlineNuxTour;
    }
  }, {
    key: 'addNewNux',
    value: function addNewNux(nux) {
      this._nuxList.push(nux);
      this._emitter.emit('newNux', nux);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      this._saveNuxState();
    }
  }, {
    key: '_saveNuxState',
    value: function _saveNuxState() {
      (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set((_main2 || _main()).NUX_SAVED_STORE, this._nuxList);
    }

    /**
     * Register a change handler that is invoked whenever the store changes.
     */
  }, {
    key: 'onNewNux',
    value: function onNewNux(callback) {
      return this._emitter.on('newNux', callback);
    }
  }, {
    key: 'onNuxCompleted',
    value: function onNuxCompleted(nuxModel) {
      var nuxToMark = this._nuxList.find(function (tour) {
        return tour.id === nuxModel.id;
      });
      if (nuxToMark == null) {
        return;
      }
      nuxToMark.nuxList.forEach(function (nux) {
        nux.completed = true;
      });
      for (var i = 0; i < nuxToMark.nuxList.length; i++) {
        // It's possible that some NuxViews were skipped, and thus not completed.
        // This can be used for internal tracking and logging more useful data.
        nuxToMark.nuxList[i].completed = nuxModel.nuxList[i].completed;
      }
      nuxToMark.completed = true;
      this._saveNuxState();
    }
  }]);

  return NuxStore;
})();

exports.NuxStore = NuxStore;