/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';

import featureConfig from '../../pkg/commons-atom/featureConfig';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  // getDefaultConfigValue,
  valueToString,
} from '../../pkg/nuclide-settings/lib/settings-utils';

import TestUtils from 'react-addons-test-utils';

type elementGetValue = (element: any) => any;
type elementSetValue = (element: any, newValue: any) => void;

function canonicalKeyPath(keyPath: string): string {
  return keyPath.replace(/\./g, '_');
}

function idSelector(keyPath: string): string {
  return '#' + canonicalKeyPath(keyPath);
}

function elementForKeyPath(keyPath: string): HTMLElement {
  const element = document.querySelector(idSelector(keyPath));
  invariant(element != null);
  return element;
}

// function classSelector(keyPath: string) {
//   return '.' + canonicalKeyPath(keyPath);
// }

function testSettingsComponent(
  keyPath: string,
  element: HTMLElement,
  value: mixed,
  tmpValue: mixed,
  getValue: elementGetValue,
  setValue: elementSetValue,
) {
  // DOM and config match
  runs(() => {
    expect(valueToString(getValue(element))).toEqual(valueToString(value));
  });

  // Change config via UI
  runs(() => {
    setValue(element, tmpValue);
  });
  waitsFor(`${keyPath} config to update`, () => {
    return valueToString(featureConfig.get(keyPath)) === valueToString(tmpValue);
  });
  runs(() => {
    expect(valueToString(featureConfig.get(keyPath))).toEqual(valueToString(tmpValue));
  });

  // Change config directly
  runs(() => {
    featureConfig.set(keyPath, value);
  });
  waitsFor(`${keyPath} element to update`, () => {
    return valueToString(getValue(element)) === valueToString(value);
  });
  runs(() => {
    expect(valueToString(getValue(element))).toEqual(valueToString(value));
  });
}

export function testSettingsCheckbox(keyPath: string, value: boolean) {
  testSettingsComponent(
    keyPath,
    elementForKeyPath(keyPath),
    value,
    !value,
    (element: HTMLInputElement) => { return element.checked; },
    (element: HTMLInputElement, newValue: boolean) => {
      if (element.checked !== newValue) {
        element.click();
      }
    },
  );
}

export function testSettingsSelect(keyPath: string, value: mixed, tmpValue: mixed) {
  testSettingsComponent(
    keyPath,
    elementForKeyPath(keyPath),
    value,
    tmpValue,
    (element: HTMLInputElement) => { return element.value; },
    (element: HTMLInputElement, newValue: string) => {
      TestUtils.Simulate.change(
        element,
        {target: element.children[parseInt(newValue, 10)]},
      );
    },
  );
}

export function testSettingsInput(keyPath: string, value: mixed, tmpValue: mixed) {
  // testSettingsComponent(
  //   keyPath,
  //   document.querySelector(classSelector(keyPath)),
  //   value,
  //   tmpValue,
  //   (element: atom$TextEditorElement) => {
  //     return element.getModel().getText() || getDefaultConfigValue(keyPath);
  //   },
  //   (element: atom$TextEditorElement, newValue: any) => {
  //     const target = element.getModel();
  //     target.setText(valueToString(newValue));
  //     TestUtils.Simulate.change(element, {target});
  //   }
  // );
}
