/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

export type BusySignalOptions = {
  onlyForFile: NuclideUri,
};

export type BusySignalService = {
  // Activates the busy signal with the given message and returns the promise
  // from the provided callback.
  // The busy signal automatically deactivates when the returned promise
  // either resolves or rejects.
  reportBusyWhile<T>(
    message: string,
    f: () => Promise<T>,
    options?: BusySignalOptions,
  ): Promise<T>,

  // Activates the busy signal with the given message.
  // The returned disposable/subscription can be dispose()d or unsubscribe()d
  // to deactivate the given busy message.
  reportBusy(
    message: string,
    options?: BusySignalOptions,
  ): IDisposable & rxjs$ISubscription,

  // Call this when you're done to ensure that all busy signals are removed.
  dispose(): void,
};
