/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type React from 'react-for-atom';
import type {Definition} from '../../nuclide-definition-service';
import typeof ContextViewMessage from './ContextViewMessage';

export type ContextElementProps = {
  ContextViewMessage: ContextViewMessage,
  definition: ?Definition,
  // Context providers can use this function to prevent Context View from updating
  // the current definition.
  setLocked: (locked: boolean) => void,
};

export type ContextProvider = {
  /**
   * Context View uses element factories to render providers' React
   * components. This gives Context View the ability to set the props (which
   * contains the currentDefinition) of each provider.
   */
  getElementFactory: () => ((props: ContextElementProps) => React.Element<any>),
  id: string, // Unique ID of the provider (suggested: use the package name of the provider)
  title: string, // Display name
  isEditorBased: boolean, // Whether the context provider displays an AtomTextEditor. This flag
  // allows context view to display editor-based providers more nicely.
  priority: number, // Defines display order in side panel. Lower number = closer to the top.
};

export type NuclideContextView = {
  registerProvider: (provider: ContextProvider) => Promise<IDisposable>,
};
