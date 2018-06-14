/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

/**
 * This file includes all thrift service related type definitions which will be
 * shared by all thrift services.
 */

export type createThriftClientOptions = {
  port: number,
};

export type createThriftServerOptions = {
  ports: string,
};

export interface IThriftServiceServer {
  initialize(): Promise<void>;
  close(): void;
}

export interface IThriftServiceClient {
  initialize(): Promise<void>;
  close(): void;
}

export interface IThriftServiceServerHandler {}
