'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BaseSession from '../VendorLib/node-inspector/lib/session';
import {inherits} from 'util';

/**
 * A custom version of node-inspector's Session that ignores commands that we don't support. (We
 * do this here so we can pull in new versions of node-inspector without having to worry about what
 * modifications we've made to the source.)
 */
function CustomSession(config: Object, debuggerPort: number, wsConnection: ws$WebSocket): void {
  BaseSession.call(this, config, debuggerPort, wsConnection);
  this.frontendCommandHandler._registerNoopCommands(
    'Emulation.canEmulate',
    'Network.setMonitoringXHREnabled',
    'Worker.enable',
    'ServiceWorker.enable',
    'Emulation.setScriptExecutionDisabled',
    'Page.setOverlayMessage',
  );
}

inherits(CustomSession, BaseSession);

export const Session = ((CustomSession: any): Class<BaseSession>);
