'use strict';

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _RemoteDirectorySearcher;

function _load_RemoteDirectorySearcher() {
  return _RemoteDirectorySearcher = _interopRequireDefault(require('../lib/RemoteDirectorySearcher'));
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-working-sets-common/lib/constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('RemoteDirectorySearcher.processPaths', () => {
  const serviceSpy = { remoteAtomSearch: () => null };
  const workingSetsStore = { getApplicableDefinitions: () => [] };
  const searcher = new (_RemoteDirectorySearcher || _load_RemoteDirectorySearcher()).default(_ => serviceSpy, () => workingSetsStore);
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
    jest.spyOn(workingSetsStore, 'getApplicableDefinitions').mockReturnValue([{ name: 'foo', active: true, uris: workingSetPaths }]);
    expect(searcher.processPaths('a', [(_constants || _load_constants()).WORKING_SET_PATH_MARKER])).toEqual(['b', 'c/d']);
  });

  it('does not search directories excluded by working set', () => {
    jest.spyOn(serviceSpy, 'remoteAtomSearch').mockReturnValue({
      refCount: () => _rxjsBundlesRxMinJs.Observable.empty()
    });
    jest.spyOn((_featureConfig || _load_featureConfig()).default, 'get').mockReturnValue({
      remoteTool: 'grep',
      remoteUseVcsSearch: true
    });
    const workingSetPaths = ['nuclide://host/a/b'];
    jest.spyOn(workingSetsStore, 'getApplicableDefinitions').mockReturnValue([{ name: 'foo', active: true, uris: workingSetPaths }]);
    const connection = null;
    const directories = ['nuclide://host/a', 'nuclide://host/c'].map(path => new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectory(connection, path));
    searcher.search(directories, /./, { inclusions: [(_constants || _load_constants()).WORKING_SET_PATH_MARKER] });
    expect(serviceSpy.remoteAtomSearch).toHaveBeenCalledWith('nuclide://host/a', /./, ['b'], true, 'grep');
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */