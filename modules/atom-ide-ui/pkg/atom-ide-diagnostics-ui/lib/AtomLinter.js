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

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {Observable} from 'rxjs';

const LINTER_PACKAGE = 'linter';

export function observePackageIsEnabled(): Observable<boolean> {
  return Observable.merge(
    Observable.of(atom.packages.isPackageActive(LINTER_PACKAGE)),
    observableFromSubscribeFunction(
      atom.packages.onDidActivatePackage.bind(atom.packages),
    )
      .filter(pkg => pkg.name === LINTER_PACKAGE)
      .mapTo(true),
    observableFromSubscribeFunction(
      atom.packages.onDidDeactivatePackage.bind(atom.packages),
    )
      .filter(pkg => pkg.name === LINTER_PACKAGE)
      .mapTo(false),
  );
}

export function disable(): void {
  atom.packages.disablePackage(LINTER_PACKAGE);
}
