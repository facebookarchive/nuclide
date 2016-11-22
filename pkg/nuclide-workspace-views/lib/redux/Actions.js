'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createViewable = createViewable;
exports.itemCreated = itemCreated;
exports.registerViewableFactory = registerViewableFactory;
exports.track = track;
exports.unregisterViewableFactory = unregisterViewableFactory;
exports.viewableFactoryUnregistered = viewableFactoryUnregistered;
exports.registerLocation = registerLocation;
exports.registerLocationFactory = registerLocationFactory;
exports.unregisterLocation = unregisterLocation;
exports.locationUnregistered = locationUnregistered;
exports.setItemVisibility = setItemVisibility;
exports.toggleItemVisibility = toggleItemVisibility;

const CREATE_VIEWABLE = exports.CREATE_VIEWABLE = 'CREATE_VIEWABLE';
const ITEM_CREATED = exports.ITEM_CREATED = 'ITEM_CREATED';
const SET_ITEM_VISIBILITY = exports.SET_ITEM_VISIBILITY = 'SET_ITEM_VISIBILITY';
const TOGGLE_ITEM_VISIBILITY = exports.TOGGLE_ITEM_VISIBILITY = 'TOGGLE_ITEM_VISIBILITY';
const TRACK = exports.TRACK = 'TRACK';
const REGISTER_VIEWABLE_FACTORY = exports.REGISTER_VIEWABLE_FACTORY = 'REGISTER_VIEWABLE_FACTORY';
const UNREGISTER_VIEWABLE_FACTORY = exports.UNREGISTER_VIEWABLE_FACTORY = 'UNREGISTER_VIEWABLE_FACTORY';
const REGISTER_LOCATION = exports.REGISTER_LOCATION = 'REGISTER_LOCATION';
const REGISTER_LOCATION_FACTORY = exports.REGISTER_LOCATION_FACTORY = 'REGISTER_LOCATION_FACTORY';
const UNREGISTER_LOCATION = exports.UNREGISTER_LOCATION = 'UNREGISTER_LOCATION';
const LOCATION_UNREGISTERED = exports.LOCATION_UNREGISTERED = 'LOCATION_UNREGISTERED';
const VIEWABLE_FACTORY_UNREGISTERED = exports.VIEWABLE_FACTORY_UNREGISTERED = 'VIEWABLE_FACTORY_UNREGISTERED';

function createViewable(itemType) {
  return {
    type: CREATE_VIEWABLE,
    payload: { itemType: itemType }
  };
}

function itemCreated(item, itemType) {
  return {
    type: ITEM_CREATED,
    payload: { item: item, itemType: itemType }
  };
}

function registerViewableFactory(viewableFactory) {
  return {
    type: REGISTER_VIEWABLE_FACTORY,
    payload: { viewableFactory: viewableFactory }
  };
}

function track(event) {
  return {
    type: TRACK,
    payload: { event: event }
  };
}

function unregisterViewableFactory(id) {
  return {
    type: UNREGISTER_VIEWABLE_FACTORY,
    payload: { id: id }
  };
}

function viewableFactoryUnregistered(id) {
  return {
    type: VIEWABLE_FACTORY_UNREGISTERED,
    payload: { id: id }
  };
}

function registerLocation(id, location) {
  return {
    type: REGISTER_LOCATION,
    payload: { id: id, location: location }
  };
}

function registerLocationFactory(locationFactory) {
  return {
    type: REGISTER_LOCATION_FACTORY,
    payload: { locationFactory: locationFactory }
  };
}

function unregisterLocation(id) {
  return {
    type: UNREGISTER_LOCATION,
    payload: { id: id }
  };
}

function locationUnregistered(id) {
  return {
    type: LOCATION_UNREGISTERED,
    payload: { id: id }
  };
}

function setItemVisibility(options) {
  return {
    type: SET_ITEM_VISIBILITY,
    payload: options
  };
}

function toggleItemVisibility(itemType, visible, immediate) {
  return {
    type: TOGGLE_ITEM_VISIBILITY,
    payload: { itemType: itemType, visible: visible, immediate: immediate || false }
  };
}