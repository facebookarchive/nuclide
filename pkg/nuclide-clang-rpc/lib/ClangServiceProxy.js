"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 109
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 110
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 111
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 111
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 112
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 112
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 112
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/compile", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 113
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 113
          },
          kind: "named",
          name: "ClangCompileResult"
        }
      });
    }).publish();
  };

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 131
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 132
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 133
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 134
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 135
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 136
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 137
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 137
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 138
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 138
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 138
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 139
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 139
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 139
            },
            kind: "named",
            name: "ClangCompletion"
          }
        }
      });
    });
  };

  remoteModule.getDeclaration = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 153
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 154
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 155
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 156
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 157
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 157
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 158
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 158
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 158
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getDeclaration", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 159
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 159
          },
          kind: "named",
          name: "ClangDeclaration"
        }
      });
    });
  };

  remoteModule.getDeclarationInfo = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 174
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 175
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 176
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 177
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 178
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 178
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 179
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 179
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 179
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getDeclarationInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 180
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 180
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 180
            },
            kind: "named",
            name: "ClangCursor"
          }
        }
      });
    });
  };

  remoteModule.getRelatedSourceOrHeader = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 192
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 193
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 193
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getRelatedSourceOrHeader", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 194
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 194
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getOutline = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 199
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 200
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 201
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 201
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 202
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 202
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 202
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getOutline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 203
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 203
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 203
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        }
      });
    });
  };

  remoteModule.getLocalReferences = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 211
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 212
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 213
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 214
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 215
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 215
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 216
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 216
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 216
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getLocalReferences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 217
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 217
          },
          kind: "named",
          name: "ClangLocalReferences"
        }
      });
    });
  };

  remoteModule.formatCode = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 225
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 226
        },
        kind: "string"
      }
    }, {
      name: "cursor",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 227
        },
        kind: "number"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 228
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 228
          },
          kind: "number"
        }
      }
    }, {
      name: "length",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 229
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 229
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/formatCode", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 230
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 230
          },
          name: "newCursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 230
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 230
          },
          name: "formatted",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 230
            },
            kind: "string"
          },
          optional: false
        }]
      });
    });
  };

  remoteModule.reset = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 257
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 257
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/reset", "void", args);
    });
  };

  remoteModule.dispose = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("ClangService/dispose", "void", args);
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
    compile: {
      kind: "function",
      name: "compile",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 108
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 108
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 109
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 110
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 111
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 111
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 112
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 112
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 112
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 113
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 113
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 113
              },
              kind: "named",
              name: "ClangCompileResult"
            }
          }
        }
      }
    },
    getCompletions: {
      kind: "function",
      name: "getCompletions",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 130
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 130
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 131
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 132
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 133
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 134
            },
            kind: "number"
          }
        }, {
          name: "tokenStartColumn",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 135
            },
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 136
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 137
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 137
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 138
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 138
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 138
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 139
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 139
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 139
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 139
                },
                kind: "named",
                name: "ClangCompletion"
              }
            }
          }
        }
      }
    },
    getDeclaration: {
      kind: "function",
      name: "getDeclaration",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 152
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 152
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 153
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 154
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 155
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 156
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 157
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 157
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 158
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 158
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 158
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 159
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 159
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 159
              },
              kind: "named",
              name: "ClangDeclaration"
            }
          }
        }
      }
    },
    getDeclarationInfo: {
      kind: "function",
      name: "getDeclarationInfo",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 173
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 173
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 174
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 175
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 176
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 177
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 178
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 178
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 179
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 179
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 179
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 180
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 180
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 180
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 180
                },
                kind: "named",
                name: "ClangCursor"
              }
            }
          }
        }
      }
    },
    getRelatedSourceOrHeader: {
      kind: "function",
      name: "getRelatedSourceOrHeader",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 191
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 191
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 192
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 193
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 193
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 194
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 194
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 194
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    getOutline: {
      kind: "function",
      name: "getOutline",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 198
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 198
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 199
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 200
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 201
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 201
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 202
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 202
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 202
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 203
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 203
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 203
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 203
                },
                kind: "named",
                name: "ClangOutlineTree"
              }
            }
          }
        }
      }
    },
    getLocalReferences: {
      kind: "function",
      name: "getLocalReferences",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 210
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 210
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 211
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 212
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 213
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 214
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 215
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 215
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "defaultFlags",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 216
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 216
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 216
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 217
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 217
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 217
              },
              kind: "named",
              name: "ClangLocalReferences"
            }
          }
        }
      }
    },
    formatCode: {
      kind: "function",
      name: "formatCode",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 224
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 224
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 225
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 226
            },
            kind: "string"
          }
        }, {
          name: "cursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 227
            },
            kind: "number"
          }
        }, {
          name: "offset",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 228
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 228
              },
              kind: "number"
            }
          }
        }, {
          name: "length",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 229
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 229
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 230
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 230
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 230
              },
              name: "newCursor",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 230
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 230
              },
              name: "formatted",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 230
                },
                kind: "string"
              },
              optional: false
            }]
          }
        }
      }
    },
    reset: {
      kind: "function",
      name: "reset",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 257
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 257
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 257
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 257
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 257
          },
          kind: "void"
        }
      }
    },
    dispose: {
      kind: "function",
      name: "dispose",
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 261
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 261
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 261
          },
          kind: "void"
        }
      }
    },
    ClangCursorType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 19
      },
      name: "ClangCursorType",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "string"
      }
    },
    ClangLocation: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      name: "ClangLocation",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "point",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }]
      }
    },
    ClangSourceRange: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      name: "ClangSourceRange",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 27
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    ClangCompileResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      name: "ClangCompileResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          name: "diagnostics",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 32
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 33
                },
                name: "spelling",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 33
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 34
                },
                name: "severity",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 34
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 35
                },
                name: "location",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 35
                  },
                  kind: "named",
                  name: "ClangLocation"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 36
                },
                name: "ranges",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 36
                  },
                  kind: "nullable",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 36
                    },
                    kind: "array",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 36
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    }
                  }
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 37
                },
                name: "fixits",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 37
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 37
                    },
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 38
                      },
                      name: "range",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 38
                        },
                        kind: "named",
                        name: "ClangSourceRange"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 39
                      },
                      name: "value",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 39
                        },
                        kind: "string"
                      },
                      optional: false
                    }]
                  }
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 49
                },
                name: "children",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 49
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 49
                    },
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 50
                      },
                      name: "spelling",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 50
                        },
                        kind: "string"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 51
                      },
                      name: "location",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 51
                        },
                        kind: "named",
                        name: "ClangLocation"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 52
                      },
                      name: "ranges",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 52
                        },
                        kind: "array",
                        type: {
                          location: {
                            type: "source",
                            fileName: "rpc-types.js",
                            line: 52
                          },
                          kind: "named",
                          name: "ClangSourceRange"
                        }
                      },
                      optional: false
                    }]
                  }
                },
                optional: true
              }]
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          name: "accurateFlags",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 57
            },
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    ClangCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 60
      },
      name: "ClangCompletion",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 60
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          name: "chunks",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 61
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 62
                },
                name: "spelling",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 62
                  },
                  kind: "string"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 63
                },
                name: "isPlaceHolder",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 63
                  },
                  kind: "boolean"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 64
                },
                name: "isOptional",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 64
                  },
                  kind: "boolean"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 65
                },
                name: "kind",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 65
                  },
                  kind: "string"
                },
                optional: true
              }]
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          name: "result_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 67
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          name: "spelling",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 68
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 69
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 69
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 70
          },
          name: "brief_comment",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 70
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 70
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ClangDeclaration: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 73
      },
      name: "ClangDeclaration",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 73
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 74
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          name: "point",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 75
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          name: "spelling",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 76
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 76
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 77
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 77
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 78
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 78
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    ClangCursor: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 81
      },
      name: "ClangCursor",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 81
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 82
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 83
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          name: "cursor_usr",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 84
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 85
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 85
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 85
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 86
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 86
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 87
          },
          name: "is_definition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 87
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    ClangOutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 90
      },
      name: "ClangOutlineTree",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 90
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 91
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 92
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 93
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 93
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 95
          },
          name: "cursor_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 95
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 98
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 98
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 100
          },
          name: "tparams",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 100
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 100
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 102
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 102
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 102
              },
              kind: "named",
              name: "ClangOutlineTree"
            }
          },
          optional: true
        }]
      }
    },
    ClangLocalReferences: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 105
      },
      name: "ClangLocalReferences",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 105
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 106
          },
          name: "cursor_name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 106
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 107
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 108
          },
          name: "references",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 108
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 108
              },
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }]
      }
    }
  }
});