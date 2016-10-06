function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * A port of Atom's focused specs.
 * https://github.com/atom/jasmine-focused/blob/c922330/src/jasmine-focused.coffee
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

require('jasmine-node');

// These are undocumented APIs. The type of jasmine is redefined here, so that
// we don't pollute the real lib def with this nonsense.
var jasmine = global.jasmine;

function setGlobalFocusPriority(priority) {
  var env = jasmine.getEnv();
  if (!env.focusPriority) {
    env.focusPriority = 1;
  }
  if (priority > env.focusPriority) {
    env.focusPriority = priority;
  }
}

function fdescribe(description, specDefinitions, priority_) {
  var priority = priority_ != null ? priority_ : 1;
  setGlobalFocusPriority(priority);
  var suite = describe(description, specDefinitions);
  (0, (_assert2 || _assert()).default)(suite != null);
  suite.focusPriority = priority;
  return suite;
}
global.fdescribe = fdescribe;

function ffdescribe(description, specDefinitions) {
  return fdescribe(description, specDefinitions, 2);
}
global.ffdescribe = ffdescribe;

function fffdescribe(description, specDefinitions) {
  return fdescribe(description, specDefinitions, 3);
}
global.fffdescribe = fffdescribe;

function fit(description, definition, priority_) {
  var priority = priority_ != null ? priority_ : 1;
  setGlobalFocusPriority(priority);
  var spec = it(description, definition);
  (0, (_assert2 || _assert()).default)(spec != null);
  spec.focusPriority = priority;
  return spec;
}
global.fit = fit;

function ffit(description, specDefinitions) {
  return fit(description, specDefinitions, 2);
}
global.ffit = ffit;

function fffit(description, specDefinitions) {
  return fit(description, specDefinitions, 3);
}
global.fffit = fffit;

jasmine.getEnv().specFilter = function (spec) {
  var env = jasmine.getEnv();
  var globalFocusPriority = env.focusPriority;
  var parent = spec.parentSuite != null ? spec.parentSuite : spec.suite;
  if (!globalFocusPriority) {
    return true;
  } else if (spec.focusPriority >= globalFocusPriority) {
    return true;
  } else if (!parent) {
    return false;
  } else {
    (0, (_assert2 || _assert()).default)(typeof env.specFilter === 'function');
    return env.specFilter(parent);
  }
};

// jasmine-node has ddescribe and iit. Remove them in favor of focus.
if (typeof jasmine.Env.prototype.ddescribe === 'function') {
  delete jasmine.Env.prototype.ddescribe;
}

if (typeof jasmine.Env.prototype.iit === 'function') {
  delete jasmine.Env.prototype.iit;
}