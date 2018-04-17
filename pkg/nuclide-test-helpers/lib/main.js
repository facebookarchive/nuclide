'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fixtures;

function _load_fixtures() {
  return _fixtures = require('./fixtures');
}

Object.defineProperty(exports, 'generateHgRepo1Fixture', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).generateHgRepo1Fixture;
  }
});
Object.defineProperty(exports, 'generateHgRepo2Fixture', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).generateHgRepo2Fixture;
  }
});
Object.defineProperty(exports, 'generateHgRepo3Fixture', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).generateHgRepo3Fixture;
  }
});
Object.defineProperty(exports, 'copyFixture', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).copyFixture;
  }
});
Object.defineProperty(exports, 'copyBuildFixture', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).copyBuildFixture;
  }
});
Object.defineProperty(exports, 'overwriteFileWithTestContent', {
  enumerable: true,
  get: function () {
    return (_fixtures || _load_fixtures()).overwriteFileWithTestContent;
  }
});

var _matchers;

function _load_matchers() {
  return _matchers = require('./matchers');
}

Object.defineProperty(exports, 'addMatchers', {
  enumerable: true,
  get: function () {
    return (_matchers || _load_matchers()).addMatchers;
  }
});