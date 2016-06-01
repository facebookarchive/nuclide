/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

declare module 'event-kit' {
  declare class Emitter extends atom$Emitter {}
  declare class Disposable extends atom$Disposable {}
  declare class CompositeDisposable extends atom$CompositeDisposable {}
}
