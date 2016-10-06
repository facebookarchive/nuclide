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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsAtomRenderReactRoot2;

function _commonsAtomRenderReactRoot() {
  return _commonsAtomRenderReactRoot2 = require('../../commons-atom/renderReactRoot');
}

var _OutlineView2;

function _OutlineView() {
  return _OutlineView2 = require('./OutlineView');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var OutlineViewPanelState = (function () {
  function OutlineViewPanelState(outlines) {
    _classCallCheck(this, OutlineViewPanelState);

    this._outlines = outlines;
    this._visibility = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(true);
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
        return visible ? _this._outlines : (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({ kind: 'empty' });
      });
      return (0, (_commonsAtomRenderReactRoot2 || _commonsAtomRenderReactRoot()).renderReactRoot)((_reactForAtom2 || _reactForAtom()).React.createElement((_OutlineView2 || _OutlineView()).OutlineView, { outlines: outlines }));
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