"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "findHgRepository", {
  enumerable: true,
  get: function () {
    return _hgRepository().default;
  }
});

function _hgRepository() {
  const data = _interopRequireDefault(require("./hg-repository"));

  _hgRepository = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }