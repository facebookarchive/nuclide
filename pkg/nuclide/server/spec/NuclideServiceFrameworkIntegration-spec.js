'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const NuclideServer = require('../lib/NuclideServer');
const NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');
const NuclideClient = require('../lib/NuclideClient');

function sleep(ms: number): Promise {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve();}, ms);
  });
}

xdescribe('when more than one service instance is created for the same service', () => {
  beforeEach(() => {
    jasmine.unspy(window, 'setTimeout');
    jasmine.getEnv().defaultTimeoutInterval = 10000;
  });

  it('the service framework uses the service instance that corresponds to the given serviceOptions.', () => {
    waitsForPromise(async () => {
      const definitionClassName = 'CounterService';
      const definitionClassAbsolutePath = path.resolve(__dirname, 'fixtures/CounterService.js');
      const implementationClassPathAbsolutePath = path
          .resolve(__dirname, 'fixtures/LocalCounterService.js');

      const server = new NuclideServer({port: 8176});

      server._serviceWithServiceFrameworkConfigs = [{
        name: definitionClassName,
        definition: definitionClassAbsolutePath,
        implementation: implementationClassPathAbsolutePath,
      }];
      server._registerServiceWithServiceFramework(server._serviceWithServiceFrameworkConfigs[0]);

      await server.connect();

      // Set up two service options using same service.
      const options1 = {cwd: '/1'};
      const options2 = {cwd: '/2'};
      const client = new NuclideClient(
        'test', new NuclideRemoteEventbus('http://localhost:8176'));

      // Set onCounterUpdated event listener for both options.
      let options1Value = 0;
      let options2Value = 0;

      const options1Callback = currentValue => options1Value = currentValue;
      const options2Callback = currentValue => options2Value = currentValue;

      const disposable1 = client.registerEventListener(
        definitionClassName + '/' + 'onCounterUpdated', options1Callback, options1)


      const cwd1 = await client.makeRpc(definitionClassName + '/getCwd', [], options1);
      const cwd2 = await client.makeRpc(definitionClassName + '/getCwd', [], options2);

      // Make sure the options return different cwd.
      expect(cwd1).toBe('/1');
      expect(cwd2).toBe('/2');

      // Make sure update to one options won't aftect another.
      var ret1 = await client.makeRpc(definitionClassName + '/addCounter', [10], options1);
      var ret2 = await client.makeRpc(definitionClassName + '/addCounter', [100], options2);
      expect(ret1).toBe(10);
      expect(ret2).toBe(100);

      // Make sure the event listener is triggered.
      await sleep(50);

      expect(options1Value).toBe(ret1);
      expect(options2Value).toBe(ret2);

      // Unregister/dispose the event listener of one options.
      disposable1.dispose();
      await sleep(50);

      var ret1 = await client.makeRpc(definitionClassName + '/addCounter', [10], options1);
      var ret2 = await client.makeRpc(definitionClassName + '/addCounter', [100], options2);
      expect(ret1).toBe(20);
      expect(ret2).toBe(200);

      // Make sure the disposed one stopped working while another one still working.
      await sleep(50);

      expect(options1Value).toBe(10);
      expect(options2Value).toBe(ret2);

      client.eventbus.socket.close();
      server.close();
    });
  });
});
