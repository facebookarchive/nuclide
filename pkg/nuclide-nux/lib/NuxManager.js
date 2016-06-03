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

var _main2;

function _main() {
  return _main2 = require('./main');
}

var GK_NUX_OUTLINE_VIEW = 'nuclide_outline_view_nux';

var NuxManager = (function () {
  function NuxManager(nuxStore) {
    _classCallCheck(this, NuxManager);

    this._nuxStore = nuxStore;

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._nuxTours = [];

    this._emitter.on('newTour', this._handleNewTour.bind(this));
    this._disposables.add(this._nuxStore.onNewNux(this._handleNewNux.bind(this)));
    this._nuxStore.initialize();
  }

  _createClass(NuxManager, [{
    key: '_handleNewNux',
    value: function _handleNewNux(nuxTourModel) {
      if (nuxTourModel.completed) {
        return;
      }

      var nuxViews = nuxTourModel.nuxList.map(function (model) {
        return new (_NuxView2 || _NuxView()).NuxView(model.selector, model.selectorFunction, model.position, model.content, model.isCustomContent, model.displayPredicate, model.completionPredicate);
      });

      var nuxTour = new (_NuxTour2 || _NuxTour()).NuxTour(nuxTourModel.id, nuxViews);
      this._nuxTours.push(nuxTour);

      this._emitter.emit('newTour', {
        nuxTour: nuxTour,
        nuxTourModel: nuxTourModel
      });
    }
  }, {
    key: '_handleNewTour',
    value: function _handleNewTour(value) {
      var nuxTour = value.nuxTour;
      var nuxTourModel = value.nuxTourModel;

      if (nuxTourModel.id === (_main2 || _main()).NUX_SAMPLE_OUTLINE_VIEW_TOUR && (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_NUX_OUTLINE_VIEW)) {
        nuxTour.setNuxCompleteCallback(this._nuxStore.onNuxCompleted.bind(this._nuxStore, nuxTourModel));
        nuxTour.begin();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return NuxManager;
})();

exports.NuxManager = NuxManager;