'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ServerStatusUpdate} from '../../flow-base';

import {Observable} from 'rx';

import typeof * as FlowServiceFactoryType from '../lib/FlowServiceFactory';

import {uncachedRequire} from '../../test-helpers';

describe('FlowServiceFactory', () => {
  let FlowServiceFactory: FlowServiceFactoryType = (null: any);
  let getServiceByNuclideUriSpy: JasmineSpy = (null: any);
  let serverUpdates: Array<ServerStatusUpdate> = (null: any);

  beforeEach(() => {
    serverUpdates = [];
    getServiceByNuclideUriSpy =
      spyOn(require('../../client'), 'getServiceByNuclideUri')
      .andCallFake(() => ({
        getServerStatusUpdates() { return Observable.from(serverUpdates); },
      }));
    FlowServiceFactory = (uncachedRequire(require, '../lib/FlowServiceFactory'): any);
  });

  afterEach(() => {
    jasmine.unspy(require('../../client'), 'getServiceByNuclideUri');
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
});
