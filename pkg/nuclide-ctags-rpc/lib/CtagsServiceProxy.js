"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.CtagsService = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    getTagsPath() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 32
        },
        name: "CtagsService"
      }), "getTagsPath", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "NuclideUri"
        });
      });
    }

    findTags(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 32
        },
        name: "CtagsService"
      }), "findTags", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "query",
        type: {
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          kind: "nullable",
          type: {
            kind: "object",
            fields: [{
              name: "caseInsensitive",
              type: {
                kind: "boolean"
              },
              optional: true
            }, {
              name: "partialMatch",
              type: {
                kind: "boolean"
              },
              optional: true
            }, {
              name: "limit",
              type: {
                kind: "number"
              },
              optional: true
            }]
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "CtagsResult"
          }
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getCtagsService = function (arg0) {
    return _client.callRemoteFunction("CtagsService/getCtagsService", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "uri",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "CtagsService"
        }
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    CtagsResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 21
      },
      name: "CtagsResult",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "lineNumber",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "kind",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "pattern",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "fields",
          type: {
            kind: "map",
            keyType: {
              kind: "string"
            },
            valueType: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    CtagsService: {
      kind: "interface",
      name: "CtagsService",
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 32
      },
      staticMethods: {},
      instanceMethods: {
        getTagsPath: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 39
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        },
        findTags: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 43
          },
          kind: "function",
          argumentTypes: [{
            name: "query",
            type: {
              kind: "string"
            }
          }, {
            name: "options",
            type: {
              kind: "nullable",
              type: {
                kind: "object",
                fields: [{
                  name: "caseInsensitive",
                  type: {
                    kind: "boolean"
                  },
                  optional: true
                }, {
                  name: "partialMatch",
                  type: {
                    kind: "boolean"
                  },
                  optional: true
                }, {
                  name: "limit",
                  type: {
                    kind: "number"
                  },
                  optional: true
                }]
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "CtagsResult"
              }
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 98
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    getCtagsService: {
      kind: "function",
      name: "getCtagsService",
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 103
      },
      type: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 103
        },
        kind: "function",
        argumentTypes: [{
          name: "uri",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "CtagsService"
            }
          }
        }
      }
    }
  }
});