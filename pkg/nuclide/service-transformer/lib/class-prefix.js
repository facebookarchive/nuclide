'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const GENERATED_CLASS_PREFIX = 'Remote';
const DECORATOR_CLASS_PREFIX = 'Decorator';

export function getClassPrefix(isDecorator: boolean): string {
  return isDecorator ? DECORATOR_CLASS_PREFIX : GENERATED_CLASS_PREFIX;
}

export function hasGeneratedClassPrefix(name: string): boolean {
  return name.startsWith(DECORATOR_CLASS_PREFIX) || name.startsWith(GENERATED_CLASS_PREFIX);
}
