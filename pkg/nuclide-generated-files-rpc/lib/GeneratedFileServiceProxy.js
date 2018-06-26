"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getGeneratedFileType = function (arg0, arg1) {
    return _client.callRemoteFunction("GeneratedFileService/getGeneratedFileType", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "forceUpdate",
      type: {
        kind: "nullable",
        type: {
          kind: "boolean"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "GeneratedFileType"
      });
    });
  };

  remoteModule.invalidateFileTypeCache = function (arg0) {
    return _client.callRemoteFunction("GeneratedFileService/invalidateFileTypeCache", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getGeneratedFileTypes = function (arg0) {
    return _client.callRemoteFunction("GeneratedFileService/getGeneratedFileTypes", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "dirPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "map",
        keyType: {
          kind: "named",
          name: "NuclideUri"
        },
        valueType: {
          kind: "named",
          name: "GeneratedFileType"
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
    GeneratedFileType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GeneratedFileService.js",
        line: 24
      },
      name: "GeneratedFileType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "manual"
        }, {
          kind: "string-literal",
          value: "partial"
        }, {
          kind: "string-literal",
          value: "generated"
        }]
      }
    },
    getGeneratedFileType: {
      kind: "function",
      name: "getGeneratedFileType",
      location: {
        type: "source",
        fileName: "GeneratedFileService.js",
        line: 26
      },
      type: {
        location: {
          type: "source",
          fileName: "GeneratedFileService.js",
          line: 26
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "forceUpdate",
          type: {
            kind: "nullable",
            type: {
              kind: "boolean"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "GeneratedFileType"
          }
        }
      }
    },
    invalidateFileTypeCache: {
      kind: "function",
      name: "invalidateFileTypeCache",
      location: {
        type: "source",
        fileName: "GeneratedFileService.js",
        line: 56
      },
      type: {
        location: {
          type: "source",
          fileName: "GeneratedFileService.js",
          line: 56
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    getGeneratedFileTypes: {
      kind: "function",
      name: "getGeneratedFileTypes",
      location: {
        type: "source",
        fileName: "GeneratedFileService.js",
        line: 62
      },
      type: {
        location: {
          type: "source",
          fileName: "GeneratedFileService.js",
          line: 62
        },
        kind: "function",
        argumentTypes: [{
          name: "dirPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "map",
            keyType: {
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              kind: "named",
              name: "GeneratedFileType"
            }
          }
        }
      }
    }
  }
});