'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {convertValue} = require('../lib/values');

describe('debugger-hhvm-proxy convertValue', () => {

  it('string', () => {
    expect(convertValue(
      {},
      {
        _: 'dGVzdC1jbGllbnQucGhw',
        $: {
          name: '0',
          fullname: '$argv[0]',
          address: '140735826684480',
          type: 'string',
          size: '15',
          encoding: 'base64'
        }
      }
    )).toEqual({
      type: 'string',
      value: 'test-client.php',
    });
  });

  it('int', () => {
    expect(convertValue(
      {},
      {
        _: '1',
        $: {
          name: '$argc',
          fullname: '$argc',
          address: '140735826684880',
          type: 'int'
        }
      }
    )).toEqual({
      type: 'number',
      value: 1,
    });
  });

  it('float', () => {
    expect(convertValue(
      {},
      {
        _: '42.5',
        $: {
          name: '$arg',
          fullname: '$arg',
          address: '140735826684880',
          type: 'float'
        }
      }
    )).toEqual({
      type: 'number',
      value: 42.5,
    });
  });

  it('bool', () => {
    expect(convertValue(
      {},
      {
        _: '1',
        $: {
          name: '$arg',
          fullname: '$arg',
          address: '140735826684880',
          type: 'bool'
        }
      }
    )).toEqual({
      type: 'boolean',
      value: true,
    });
  });

  it('null', () => {
    expect(convertValue(
      {},
      {
        $: {
          name: '$HTTP_RAW_POST_DATA',
          fullname: '$HTTP_RAW_POST_DATA',
          address: '140735826684880',
          type: 'null'
        }
      }
    )).toEqual({
      type: 'undefined',
      subtype: 'null',
      value: null,
    });
  });

  it('array', () => {
    expect(convertValue(
      {},
      {
        $: {
          name: '$argv',
          fullname: '$argv',
          address: '140735826684880',
          type: 'array',
          children: '1',
          numchildren: '1',
          page: '0',
          pagesize: '32'
        },
        property:[
          {
            _: 'dGVzdC1jbGllbnQucGhw',
            $: {
              name: '0',
              fullname: '$argv[0]',
              address: '140735826684480',
              type: 'string',
              size: '15',
              encoding: 'base64'
            }
          }
        ]
      }
    )).toEqual({
      description: 'Array[1]',
      type: 'object',
      subtype: 'array',
      objectId: '{"fullname":"$argv","page":0}',
    });
  });

  it('object', () => {
    expect(convertValue(
      {},
    {
      $:{
        name: '$arg',
        fullname: '$arg',
        address: '140735546955520',
        type: 'object',
        classname: 'CLS',
        children: '0',
        numchildren: '0',
        page: '0',
        pagesize: '32'
      }
    }
    )).toEqual({
      description: 'CLS',
      type: 'object',
      objectId: '{"fullname":"$arg","page":0}',
    });
  });
});
