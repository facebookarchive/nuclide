"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _RemoteDirectorySearcher() {
  const data = _interopRequireDefault(require("../lib/RemoteDirectorySearcher"));

  _RemoteDirectorySearcher = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-working-sets-common/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('RemoteDirectorySearcher.processPaths', () => {
  const serviceSpy = {
    remoteAtomSearch: () => null
  };
  const workingSetsStore = {
    getApplicableDefinitions: () => []
  };
  const searcher = new (_RemoteDirectorySearcher().default)(_ => serviceSpy, () => workingSetsStore);
  it('expands basename searches to the whole directory', () => {
    expect(searcher.processPaths('a/b/c', ['c/d', 'c'])).toEqual([]);
  });
  it('tries subdirs for basename searches', () => {
    expect(searcher.processPaths('a/b/c', ['c/d', 'c/e'])).toEqual(['c/d', 'd', 'c/e', 'e']);
  });
  it('does not expand regular searches', () => {
    expect(searcher.processPaths('a/b/c', ['a', 'b'])).toEqual(['a', 'b']);
  });
  it('adds working set directories to search path', () => {
    const workingSetPaths = ['a/b', 'a/c/d'];
    jest.spyOn(workingSetsStore, 'getApplicableDefinitions').mockReturnValue([{
      name: 'foo',
      active: true,
      uris: workingSetPaths
    }]);
    expect(searcher.processPaths('a', [_constants().WORKING_SET_PATH_MARKER])).toEqual(['b', 'c/d']);
  });
  it('does not search directories excluded by working set', () => {
    jest.spyOn(serviceSpy, 'remoteAtomSearch').mockReturnValue({
      refCount: () => _RxMin.Observable.empty()
    });
    jest.spyOn(_featureConfig().default, 'get').mockReturnValue({
      remoteTool: 'grep',
      remoteUseVcsSearch: true
    });
    const workingSetPaths = ['nuclide://host/a/b'];
    jest.spyOn(workingSetsStore, 'getApplicableDefinitions').mockReturnValue([{
      name: 'foo',
      active: true,
      uris: workingSetPaths
    }]);
    const connection = null;
    const directories = ['nuclide://host/a', 'nuclide://host/c'].map(path => new (_nuclideRemoteConnection().RemoteDirectory)(connection, path));
    searcher.search(directories, /./, {
      inclusions: [_constants().WORKING_SET_PATH_MARKER],
      leadingContextLineCount: 1,
      trailingContextLineCount: 2
    });
    expect(serviceSpy.remoteAtomSearch).toHaveBeenCalledWith('nuclide://host/a', /./, ['b'], true, 'grep', 1, 2);
  });
});