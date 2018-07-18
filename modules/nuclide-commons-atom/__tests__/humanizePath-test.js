"use strict";

function _humanizePath() {
  const data = _interopRequireDefault(require("../humanizePath"));

  _humanizePath = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
describe('humanizePath', () => {
  it("includes the root name if there's more than one", () => {
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: ['/a', '/d']
    })).toBe('a/b/c');
  });
  it("doesn't care if the rootPaths have trailing slashes", () => {
    // Atom hasn't always been consistent about this.
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: ['/a/', '/d/']
    })).toBe('a/b/c');
  });
  it("doesn't include the root name if there's only one", () => {
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: ['/a']
    })).toBe('b/c');
  });
  it("returns the root name if it's a root path", () => {
    expect((0, _humanizePath().default)('/a/', {
      rootPaths: ['/a', '/d']
    })).toBe('a/');
  });
  it("returns the absolute path if the file isn't in an open project root", () => {
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: []
    })).toBe('/a/b/c');
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: ['/d']
    })).toBe('/a/b/c');
  });
  it('doesn\'t use ".." if the file is above the root', () => {
    expect((0, _humanizePath().default)('/a/b/c', {
      rootPaths: ['/a/b/c/d']
    })).toBe('/a/b/c');
  });
  it("includes a trailing slash if you say it's a directory", () => {
    expect((0, _humanizePath().default)('/a/b/c', {
      isDirectory: true,
      rootPaths: []
    })).toBe('/a/b/c/');
  });
  it('normalizes', () => {
    expect((0, _humanizePath().default)('/a/b//c//', {
      rootPaths: []
    })).toBe('/a/b/c/');
  });
});