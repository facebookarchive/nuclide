"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.CtagsService = class {
    constructor(arg0) {
      _client.createRemoteObject("CtagsService", this, [arg0], [{
        name: "tagsPath",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 35
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]);
    }

    getTagsPath() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 32
          },
          name: "CtagsService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getTagsPath", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 39
          },
          kind: "named",
          name: "NuclideUri"
        });
      });
    }

    findTags(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 44
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 45
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 45
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "caseInsensitive",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "partialMatch",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "limit",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "number"
              },
              optional: true
            }]
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 32
          },
          name: "CtagsService"
        }).then(id => {
          return _client.callRemoteMethod(id, "findTags", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 46
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 46
            },
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
    return _client.marshalArguments(Array.from(arguments), [{
      name: "uri",
      type: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 88
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("CtagsService/getCtagsService", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 88
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 88
          },
          kind: "named",
          name: "CtagsService"
        }
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["CtagsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "CtagsService.js",
      line: 21
    },
    name: "CtagsResult",
    definition: {
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 22
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 22
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 23
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 23
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 25
        },
        name: "lineNumber",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 25
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 27
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 27
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 28
        },
        name: "pattern",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 28
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 29
        },
        name: "fields",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 29
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 29
            },
            kind: "string"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 29
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["CtagsService", {
    kind: "interface",
    name: "CtagsService",
    location: {
      type: "source",
      fileName: "CtagsService.js",
      line: 32
    },
    constructorArgs: [{
      name: "tagsPath",
      type: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 35
        },
        kind: "named",
        name: "NuclideUri"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["getTagsPath", {
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 39
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 39
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 39
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }], ["findTags", {
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 43
      },
      kind: "function",
      argumentTypes: [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 44
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 45
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 45
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "caseInsensitive",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "partialMatch",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "CtagsService.js",
                line: 45
              },
              name: "limit",
              type: {
                location: {
                  type: "source",
                  fileName: "CtagsService.js",
                  line: 45
                },
                kind: "number"
              },
              optional: true
            }]
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 46
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 46
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 46
            },
            kind: "named",
            name: "CtagsResult"
          }
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 83
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 83
        },
        kind: "void"
      }
    }]])
  }], ["getCtagsService", {
    kind: "function",
    name: "getCtagsService",
    location: {
      type: "source",
      fileName: "CtagsService.js",
      line: 88
    },
    type: {
      location: {
        type: "source",
        fileName: "CtagsService.js",
        line: 88
      },
      kind: "function",
      argumentTypes: [{
        name: "uri",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 88
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "CtagsService.js",
          line: 88
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "CtagsService.js",
            line: 88
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "CtagsService.js",
              line: 88
            },
            kind: "named",
            name: "CtagsService"
          }
        }
      }
    }
  }]])
});