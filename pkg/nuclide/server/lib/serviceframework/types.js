'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type RequestMessage = CallRemoteFunctionMessage | CreateRemoteObjectMessage |
  CallRemoteMethodMessage | DisposeRemoteObjectMessage;

export type ReturnType = 'promise' | 'observable' | 'void';

export type CallRemoteFunctionMessage = {
  protocol: 'service_framework3_rpc';
  type: 'FunctionCall';
  function: string;
  requestId: number;
  args: Array<any>;
}

export type CreateRemoteObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'NewObject';
  interface: string;
  requestId: number;
  args: Array<any>;
}

export type CallRemoteMethodMessage = {
  protocol: 'service_framework3_rpc';
  type: 'MethodCall';
  method: string;
  requestId: number;
  objectId: number;
  args: Array<any>;
}

export type DisposeRemoteObjectMessage = {
  protocol: 'service_framework3_rpc';
  type: 'DisposeObject';
  requestId: number;
  objectId: number;
};

export type ResponseMethod = PromiseResponseMessage | ErrorResponseMessage;

export type ErrorResponseMessage = {
  channel: 'service_framework3_rpc';
  type: 'ErrorMessage';
  error: any;
};

export type PromiseResponseMessage = {
  channel: 'service_framework3_rpc';
  type: 'PromiseMessage';
  requestId: number;
  result: any;
};
