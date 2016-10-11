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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsAtomRenderReactRoot;

function _load_commonsAtomRenderReactRoot() {
  return _commonsAtomRenderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _OutlineView;

function _load_OutlineView() {
  return _OutlineView = require('./OutlineView');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var OutlineViewPanelState = (function () {
  function OutlineViewPanelState(outlines) {
    _classCallCheck(this, OutlineViewPanelState);

    this._outlines = outlines;
    this._visibility = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(true);
  }

  _createClass(OutlineViewPanelState, [{
    key: 'getTitle',
    value: function getTitle() {
      return 'Outline View';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'list-unordered';
    }
  }, {
    key: 'getPreferredInitialWidth',
    value: function getPreferredInitialWidth() {
      return 300;
    }
  }, {
    key: 'didChangeVisibility',
    value: function didChangeVisibility(visible) {
      this._visibility.next(visible);
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      var _this = this;

      var outlines = this._visibility.switchMap(function (visible) {
        return visible ? _this._outlines : (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({ kind: 'empty' });
      });
      return (0, (_commonsAtomRenderReactRoot || _load_commonsAtomRenderReactRoot()).renderReactRoot)((_reactForAtom || _load_reactForAtom()).React.createElement((_OutlineView || _load_OutlineView()).OutlineView, { outlines: outlines }));
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'nuclide.OutlineViewPanelState'
      };
    }
  }]);

  return OutlineViewPanelState;
})();

exports.OutlineViewPanelState = OutlineViewPanelState;