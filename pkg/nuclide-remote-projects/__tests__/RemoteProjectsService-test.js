'use strict';

var _RemoteProjectsService;

function _load_RemoteProjectsService() {
  return _RemoteProjectsService = _interopRequireDefault(require('../lib/RemoteProjectsService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('RemoteProjectsService', () => {
  it('waits for reload', () => {
    const service = new (_RemoteProjectsService || _load_RemoteProjectsService()).default();
    const spy = jest.fn();
    service.waitForRemoteProjectReload(spy);
    const projects = ['test'];
    service._reloadFinished(projects);
    expect(spy).toHaveBeenCalledWith(projects);

    // The callback should still resolve if already loaded.
    const spy2 = jest.fn();
    service.waitForRemoteProjectReload(spy2);
    expect(spy2).toHaveBeenCalledWith(projects);
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */