Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
  }, {
    key: 'initialize',
    value: function initialize() {
      //TODO [rageandqq | 05-19-16]: Deserialize 'saved' NUXes
      if (this._shouldSeedNux) {
        // TODO [rageandqq | 05-19-16]: Seed with sample NUX
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
        position: 'right',
        displayPredicate: function displayPredicate() {
          return document.querySelector('div.nuclide-outline-view') == null;
        },
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
          return document.querySelector('div.nuclide-outline-view') == null;
        },
        completionPredicate: null,
        completed: false
      };
      var sampleOutlineNuxTour = {
        numNuxes: 2,
        completed: false,
        id: 'outline-view-tour',
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
    value: function onNuxCompleted(nux) {
      var nuxToMark = this._nuxList.find(function (tour) {
        return tour.id === nux.id;
      });
      nuxToMark.completed = true;
      // TODO [rageandqq | 05-19-16]: Save 'completed' state of nux.
    }
  }]);

  return NuxStore;
})();

exports.NuxStore = NuxStore;