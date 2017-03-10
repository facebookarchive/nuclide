/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FlowIDEConnection} from '../lib/FlowIDEConnection';

import invariant from 'assert';

import {FlowIDEConnectionWatcher} from '../lib/FlowIDEConnectionWatcher';

describe('FlowIDEConnectionWatcher', () => {
  let processFactory: () => Promise<?child_process$ChildProcess> = (null: any);
  let processFactoryReturn: Promise<?child_process$ChildProcess> = (null: any);

  let ideConnectionCallback: JasmineSpy = (null: any);

  let ideConnectionFactory: JasmineSpy = (null: any);
  let currentFakeIDEConnection: ?{[string]: JasmineSpy} = null;

  function createFakeIDEConnection(): FlowIDEConnection {
    return (jasmine.createSpyObj('FlowIDEconnection', [
      'onWillDispose',
      'dispose',
    ]): any);
  }

  beforeEach(() => {
    processFactory = jasmine.createSpy('processFactory').andCallFake(() => processFactoryReturn);
    // We can use a stub value here because it's just passed through to the ideConnectionFactory
    processFactoryReturn = Promise.resolve(({}: any));

    ideConnectionCallback = jasmine.createSpy('ideConnectionCallback');

    ideConnectionFactory = jasmine
      .createSpy('ideConnectionFactory')
      .andCallFake((...args) => {
        currentFakeIDEConnection = createFakeIDEConnection(...args);
        return currentFakeIDEConnection;
      });
    currentFakeIDEConnection = null;
  });

  it('should correctly start and keep alive an IDE connection', () => {
    let watcher;
    runs(() => {
      watcher = new FlowIDEConnectionWatcher(
        processFactory,
        ideConnectionCallback,
        ideConnectionFactory,
      );
      watcher.start();
    });
    waitsFor(() => currentFakeIDEConnection != null);
    runs(() => {
      expect(ideConnectionCallback).toHaveBeenCalledWith(currentFakeIDEConnection);
      expect(ideConnectionCallback.callCount).toBe(1);
      invariant(currentFakeIDEConnection != null);
      expect(currentFakeIDEConnection.onWillDispose).toHaveBeenCalled();

      // TODO check that when the underlying connection dies, it gets re-established
      const onWillDisposeHandler: any = currentFakeIDEConnection.onWillDispose.calls[0].args[0];
      onWillDisposeHandler();
    });
    waitsFor(() => ideConnectionCallback.callCount === 2);
    runs(() => {
      expect(ideConnectionCallback).toHaveBeenCalledWith(currentFakeIDEConnection);
      invariant(currentFakeIDEConnection != null);
      watcher.dispose();
      expect(currentFakeIDEConnection.dispose).toHaveBeenCalled();
    });
  });
});
