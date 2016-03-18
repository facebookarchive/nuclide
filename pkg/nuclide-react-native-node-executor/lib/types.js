'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type ServerReplyCallback = (replyId: number, result: ?Object) => void;

// Output from executor.js

type ExecutorResult = {
  kind: 'result';
  replyId: number;
  result: ?Object;
};

type ExecutorError = {
  kind: 'error';
  message: string;
};

export type ExecutorResponse = ExecutorResult | ExecutorError;

// Input to executor.js

type EvaluateApplicationScriptExecutorRequest = {
  id: number;
  op: 'executeApplicationScript';
  data: {
    script: string;
    inject: string;
  };
};

type CallExecutorRequest = {
  id: number;
  op: 'call';
  data: {
    method: string;
    arguments: ?Array<any>;
  };
};

export type ExecutorRequest =
  EvaluateApplicationScriptExecutorRequest
  | CallExecutorRequest;

// Requests coming from React Native

export type RnRequest = {
  id: number;
  method?: string;
  arguments?: Array<any>;
  url?: string;
  inject?: string;
  $close?: boolean;
};
