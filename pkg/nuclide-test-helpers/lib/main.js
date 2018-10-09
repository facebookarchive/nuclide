"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "generateHgRepo1Fixture", {
  enumerable: true,
  get: function () {
    return _fixtures().generateHgRepo1Fixture;
  }
});
Object.defineProperty(exports, "generateHgRepo2Fixture", {
  enumerable: true,
  get: function () {
    return _fixtures().generateHgRepo2Fixture;
  }
});
Object.defineProperty(exports, "generateHgRepo3Fixture", {
  enumerable: true,
  get: function () {
    return _fixtures().generateHgRepo3Fixture;
  }
});
Object.defineProperty(exports, "copyFixture", {
  enumerable: true,
  get: function () {
    return _fixtures().copyFixture;
  }
});
Object.defineProperty(exports, "copyBuildFixture", {
  enumerable: true,
  get: function () {
    return _fixtures().copyBuildFixture;
  }
});
Object.defineProperty(exports, "overwriteFileWithTestContent", {
  enumerable: true,
  get: function () {
    return _fixtures().overwriteFileWithTestContent;
  }
});
Object.defineProperty(exports, "addMatchers", {
  enumerable: true,
  get: function () {
    return _matchers().addMatchers;
  }
});

function _fixtures() {
  const data = require("./fixtures");

  _fixtures = function () {
    return data;
  };

  return data;
}

function _matchers() {
  const data = require("./matchers");

  _matchers = function () {
    return data;
  };

  return data;
}