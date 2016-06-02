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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _CodePreviewPanel2;

function _CodePreviewPanel() {
  return _CodePreviewPanel2 = require('./CodePreviewPanel');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _CodePreviewContent2;

function _CodePreviewContent() {
  return _CodePreviewContent2 = require('./CodePreviewContent');
}

var CodePreviewState = (function () {
  function CodePreviewState(width, visible) {
    _classCallCheck(this, CodePreviewState);

    this._width = width;

    this.setDefinitionService(null);
    if (visible) {
      this._show();
    }
  }

  _createClass(CodePreviewState, [{
    key: 'setDefinitionService',
    value: function setDefinitionService(service) {
      if (service == null) {
        this._data = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(null);
      } else {
        this._data = (0, (_CodePreviewContent2 || _CodePreviewContent()).getContent)(service);
      }

      if (this.isVisible()) {
        this._hide();
        this._show();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this.isVisible()) {
        this._destroyPanel();
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.isVisible()) {
        this._hide();
      } else {
        this._show();
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.isVisible()) {
        this._show();
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.isVisible()) {
        this._hide();
      }
    }
  }, {
    key: 'getWidth',
    value: function getWidth() {
      return this._panel == null ? this._width : this._panel.getWidth();
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._panel != null;
    }
  }, {
    key: '_show',
    value: function _show() {
      (0, (_assert2 || _assert()).default)(this._panel == null);

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-definition-preview-show');

      this._panel = new (_CodePreviewPanel2 || _CodePreviewPanel()).CodePreviewPanel(this._width, this._data);
    }
  }, {
    key: '_hide',
    value: function _hide() {
      this._destroyPanel();
    }
  }, {
    key: '_destroyPanel',
    value: function _destroyPanel() {
      var outlineViewPanel = this._panel;
      (0, (_assert2 || _assert()).default)(outlineViewPanel != null);

      this._width = outlineViewPanel.getWidth();
      outlineViewPanel.dispose();
      this._panel = null;
    }
  }]);

  return CodePreviewState;
})();

exports.CodePreviewState = CodePreviewState;