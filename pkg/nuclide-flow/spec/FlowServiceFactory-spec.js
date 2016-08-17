'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ServerStatusUpdate} from '../../nuclide-flow-rpc';
import typeof * as FlowServiceFactoryType from '../lib/FlowServiceFactory';

import {Observable} from 'rxjs';

import * as NuclideRemoteConnection from '../../nuclide-remote-connection';
import {uncachedRequire} from '../../nuclide-test-helpers';

describe('FlowServiceFactory', () => {
  let FlowServiceFactory: FlowServiceFactoryType = (null: any);
  let getServiceByNuclideUriSpy: JasmineSpy = (null: any);
  let serverUpdates: Array<ServerStatusUpdate> = (null: any);
  let fakeFlowService: Object = (null: any);

  beforeEach(() => {
    serverUpdates = [];
    fakeFlowService = {
      getServerStatusUpdates() { return Observable.from(serverUpdates).publish(); },
    };
    getServiceByNuclideUriSpy =
      spyOn(NuclideRemoteConnection, 'getServiceByNuclideUri')
      .andCallFake(() => fakeFlowService);
    FlowServiceFactory = (uncachedRequire(require, '../lib/FlowServiceFactory'): any);
  });

  afterEach(() => {
    jasmine.unspy(NuclideRemoteConnection, 'getServiceByNuclideUri');
  });

  describe('getFlowServiceByNuclideUri', () => {
    it('should call getFlowServiceByNuclideUri with the filename', () => {
      FlowServiceFactory.getFlowServiceByNuclideUri('fake/path');
      expect(getServiceByNuclideUriSpy).toHaveBeenCalledWith('FlowService', 'fake/path');
    });
  });

  describe('getLocalFlowService', () => {
    it('should call getFlowServiceByNuclideUri with null', () => {
      FlowServiceFactory.getLocalFlowService();
      expect(getServiceByNuclideUriSpy).toHaveBeenCalledWith('FlowService', null);
    });
  });

  describe('getServerStatusUpdates', () => {
    beforeEach(() => {
      serverUpdates = [
        {
          pathToRoot: 'foo',
          status: 'unknown',
        },
        {
          pathToRoot: 'foo',
          status: 'failed',
        },
      ];
    });

    it('relays the server status updates', () => {
      waitsForPromise(async () => {
        const updatesPromise = FlowServiceFactory
          .getServerStatusUpdates()
          .take(2)
          .toArray()
          .toPromise();
        FlowServiceFactory.getLocalFlowService();
        expect(await updatesPromise).toEqual(serverUpdates);
      });
    });
  });

  describe('getCurrentServiceInstances', () => {
    it('returns a set with the current service instances', () => {
      expect(FlowServiceFactory.getCurrentServiceInstances().size).toEqual(0);

      FlowServiceFactory.getLocalFlowService();

      const instances = FlowServiceFactory.getCurrentServiceInstances();
      expect(instances.size).toEqual(1);
      expect(instances.has(fakeFlowService)).toBeTruthy();
    });
  });
});
