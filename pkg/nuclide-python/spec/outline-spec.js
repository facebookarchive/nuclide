'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import fsPromise from '../../commons-node/fsPromise';
import {generateOutline} from '../lib/outline';

describe('Python outline', () => {


  it('conversion from JSON to outline', () => {
    waitsForPromise(async () => {
      const src = path.join(__dirname, './fixtures/t.py');
      const contents = await fsPromise.readFile(src, 'utf8');
      const result = await generateOutline(src, contents, 'all');
      expect(result).toEqual(JSON.parse(expected));
    });
  });
});

const expected = `{
  "outlineTrees": [
    {
      "tokenizedText": [
        {
          "kind": "plain",
          "value": "CONST"
        }
      ],
      "representativeName": "CONST",
      "startPosition": {
        "row": 9,
        "column": 0
      },
      "endPosition": {
        "row": 9,
        "column": 9
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "def"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "check_output"
        },
        {
          "kind": "plain",
          "value": "("
        },
        {
          "kind": "plain",
          "value": "*"
        },
        {
          "kind": "param",
          "value": "popenargs"
        },
        {
          "kind": "plain",
          "value": ","
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "plain",
          "value": "**"
        },
        {
          "kind": "param",
          "value": "kwargs"
        },
        {
          "kind": "plain",
          "value": ")"
        }
      ],
      "representativeName": "check_output",
      "startPosition": {
        "row": 12,
        "column": 0
      },
      "endPosition": {
        "row": 16,
        "column": -1
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "class"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "MyClass"
        }
      ],
      "representativeName": "MyClass",
      "startPosition": {
        "row": 16,
        "column": 0
      },
      "endPosition": {
        "row": 21,
        "column": -1
      },
      "children": [
        {
          "tokenizedText": [
            {
              "kind": "keyword",
              "value": "def"
            },
            {
              "kind": "whitespace",
              "value": " "
            },
            {
              "kind": "method",
              "value": "__init"
            },
            {
              "kind": "plain",
              "value": "("
            },
            {
              "kind": "param",
              "value": "self"
            },
            {
              "kind": "plain",
              "value": ")"
            }
          ],
          "representativeName": "__init",
          "startPosition": {
            "row": 17,
            "column": 4
          },
          "endPosition": {
            "row": 21,
            "column": -1
          },
          "children": []
        }
      ]
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "def"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "load_package_configs"
        },
        {
          "kind": "plain",
          "value": "("
        },
        {
          "kind": "plain",
          "value": ")"
        }
      ],
      "representativeName": "load_package_configs",
      "startPosition": {
        "row": 21,
        "column": 0
      },
      "endPosition": {
        "row": 39,
        "column": -1
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "plain",
          "value": "var"
        }
      ],
      "representativeName": "var",
      "startPosition": {
        "row": 42,
        "column": 0
      },
      "endPosition": {
        "row": 42,
        "column": 7
      },
      "children": []
    }
  ]
}`;
