'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('./hg-constants');
}

Object.defineProperty(exports, 'hgConstants', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_hgConstants || _load_hgConstants()).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }