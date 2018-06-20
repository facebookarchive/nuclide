'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _ContextViewManager;

function _load_ContextViewManager() {
  return _ContextViewManager = require('../lib/ContextViewManager');
}

var _react = _interopRequireWildcard(require('react'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const PROVIDER1_ID = 'context-provider-1';
const PROVIDER1_TITLE = 'Provider One';
const PROVIDER2_ID = 'context-provider-2';
const PROVIDER2_TITLE = 'Provider Two';

describe('ContextViewManager', () => {
  let manager;
  let disposables;
  let provider1;
  let provider2;
  const provider1Priority = 1;
  const provider2Priority = 2;
  const provider3Priority = 3;
  const provider4Priority = 4;
  const provider5Priority = 5;
  let defProvider;

  function elementFactory() {
    return props => {
      return _react.createElement(
        'div',
        null,
        'Some context provider view'
      );
    };
  }

  beforeEach(() => {
    disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    manager = new (_ContextViewManager || _load_ContextViewManager()).ContextViewManager();
    provider1 = {
      getElementFactory: elementFactory,
      id: PROVIDER1_ID,
      title: PROVIDER1_TITLE,
      priority: 1
    };
    provider2 = {
      getElementFactory: elementFactory,
      id: PROVIDER2_ID,
      title: PROVIDER2_TITLE,
      priority: 2
    };
    (_featureConfig || _load_featureConfig()).default.set(provider1.id.concat('.priority'), provider1Priority);
    (_featureConfig || _load_featureConfig()).default.set(provider2.id.concat('.priority'), provider2Priority);
    defProvider = {
      priority: 1,
      grammarScopes: ['text.plain.null-grammar'],
      getDefinition: (editor, position) => {
        return Promise.resolve(null);
      }
    };
    disposables.add(manager);
  });

  afterEach(() => {
    disposables.dispose();
  });

  /** Registration/deregistration API */

  it('correctly registers a single context provider and rerenders', () => {
    jest.spyOn(manager, '_render').mockImplementation(() => {});
    const registered = manager.registerProvider(provider1);
    expect(registered).toBe(true);
    expect(manager._contextProviders.length).toBe(1);
    expect(manager._render).toHaveBeenCalled();
  });
  it('correctly registers multiple context provdiers and rerenders', () => {
    jest.spyOn(manager, '_render').mockImplementation(() => {});
    const registered1 = manager.registerProvider(provider1);
    const registered2 = manager.registerProvider(provider2);
    expect(registered1).toBe(true);
    expect(registered2).toBe(true);
    expect(manager._contextProviders.length).toBe(2);
    expect(manager._render).toHaveBeenCalled();
  });
  it('does not register a provider with an already existing ID', () => {
    const registered1 = manager.registerProvider(provider1);
    const registeredAgain = manager.registerProvider(provider1);
    expect(registered1).toBe(true);
    expect(registeredAgain).toBe(false); // Shouldn't re-register provider with same ID
    expect(manager._contextProviders.length).toBe(1);
  });
  it('unregisters a provider and rerenders', () => {
    jest.spyOn(manager, '_render').mockImplementation(() => {});
    manager.registerProvider(provider1);
    const unregistered = manager.unregisterProvider(PROVIDER1_ID);
    expect(unregistered).toBe(true);
    expect(manager._contextProviders.length).toBe(0);
    expect(manager._render).toHaveBeenCalled();
  });
  it('does not unregister a provider that has not been registered', () => {
    jest.spyOn(manager, '_render').mockImplementation(() => {});
    const unregistered1 = manager.unregisterProvider(PROVIDER1_ID);
    expect(unregistered1).toBe(false);
    expect(manager._contextProviders.length).toBe(0);
    manager.registerProvider(provider1);
    const unregistered2 = manager.unregisterProvider(PROVIDER2_ID);
    expect(unregistered2).toBe(false);
    expect(manager._contextProviders.length).toBe(1);
  });
  it('orders providers based on priority', () => {
    const provider3 = {
      getElementFactory: elementFactory,
      id: '3',
      title: '3',
      priority: 3
    };
    const provider4 = {
      getElementFactory: elementFactory,
      id: '4',
      title: '4',
      priority: 4
    };
    const provider5 = {
      getElementFactory: elementFactory,
      id: '5',
      title: '5',
      priority: 5
    };
    (_featureConfig || _load_featureConfig()).default.set(provider3.id.concat('.priority'), provider3Priority);
    (_featureConfig || _load_featureConfig()).default.set(provider4.id.concat('.priority'), provider4Priority);
    (_featureConfig || _load_featureConfig()).default.set(provider5.id.concat('.priority'), provider5Priority);
    manager.registerProvider(provider2);
    manager.registerProvider(provider1);
    expect(manager._contextProviders[0].id).toBe(PROVIDER1_ID);
    expect(manager._contextProviders[1].id).toBe(PROVIDER2_ID);

    manager = new (_ContextViewManager || _load_ContextViewManager()).ContextViewManager();
    // Insert order: 4, 5, 1, 3, 2
    // Provider list should end up as [1, 2, 3, 4, 5]
    manager.registerProvider(provider4);
    manager.registerProvider(provider5);
    manager.registerProvider(provider1);
    manager.registerProvider(provider3);
    manager.registerProvider(provider2);
    expect(manager._contextProviders[0].id).toBe(PROVIDER1_ID);
    expect(manager._contextProviders[1].id).toBe(PROVIDER2_ID);
    expect(manager._contextProviders[2].id).toBe('3');
    expect(manager._contextProviders[3].id).toBe('4');
    expect(manager._contextProviders[4].id).toBe('5');
  });

  /** Actions affecting definition service subscription */
  it('consumes the definition service when showing', () => {
    manager.show();
    jest.spyOn(manager, 'updateSubscription');
    jest.spyOn(manager, '_render');
    jest.spyOn(manager, '_renderProviders').mockImplementation(() => {});
    manager.consumeDefinitionProvider(defProvider);
    expect(manager.updateSubscription).toHaveBeenCalled();
    expect(manager._defServiceSubscription).toBeTruthy();
    expect(manager._render).toHaveBeenCalled();
    expect(manager._renderProviders).toHaveBeenCalled();
  });
  it('consumes the definition service when hidden', () => {
    jest.spyOn(manager, 'updateSubscription');
    jest.spyOn(manager, '_render');
    jest.spyOn(manager, '_renderProviders').mockImplementation(() => {});
    jest.spyOn(manager, '_disposeView').mockImplementation(() => {});
    expect(manager._defServiceSubscription).toBeNull();
    manager.consumeDefinitionProvider(defProvider);
    expect(manager.updateSubscription).toHaveBeenCalled();
    expect(manager._defServiceSubscription).toBeNull();
    expect(manager._render).toHaveBeenCalled();
    expect(manager._disposeView).toHaveBeenCalled();
    expect(manager._renderProviders).not.toHaveBeenCalled();
  });
  it('hides correctly', () => {
    manager.show();
    manager.consumeDefinitionProvider(defProvider);
    jest.spyOn(manager, '_render');
    jest.spyOn(manager, '_disposeView').mockImplementation(() => {});
    jest.spyOn(manager, 'updateSubscription');
    manager.hide();
    expect(manager._isVisible).toBe(false);
    expect(manager._render).toHaveBeenCalled();
    expect(manager._disposeView).toHaveBeenCalled();
    expect(manager.updateSubscription).toHaveBeenCalled();
    expect(manager._defServiceSubscription).toBeNull();
  });
  it('shows correctly', () => {
    manager.consumeDefinitionProvider(defProvider);
    jest.spyOn(manager, '_render');
    jest.spyOn(manager, '_disposeView').mockImplementation(() => {});
    jest.spyOn(manager, 'updateSubscription');
    manager.show();
    expect(manager._isVisible).toBe(true);
    expect(manager._render).toHaveBeenCalled();
    expect(manager.updateSubscription).toHaveBeenCalled();
  });
  it('disposes correctly', () => {
    manager.show();
    manager.consumeDefinitionProvider(defProvider);
    // i.e. the subscription is unsubscribed if not null

    if (!(manager._defServiceSubscription != null)) {
      throw new Error('Subscription should exist if panel is visible and def. service consumed');
    }

    const subscription = manager._defServiceSubscription;
    jest.spyOn(subscription, 'unsubscribe').mockImplementation(() => {});
    manager.dispose();
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});