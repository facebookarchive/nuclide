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
          line: 115
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
          line: 116
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 117
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 117
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
          line: 118
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 118
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 118
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
          line: 119
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 119
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
          line: 137
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
          line: 138
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 139
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 140
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 141
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 142
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 143
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 143
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
          line: 144
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 144
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 144
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
          line: 145
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 145
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 145
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
          line: 164
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
          line: 165
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 166
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 167
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 168
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 168
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
          line: 169
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 169
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 169
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
          line: 170
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 170
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
          line: 186
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
          line: 187
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 188
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 189
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 190
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 190
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
          line: 191
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 191
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 191
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
          line: 192
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 192
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 192
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
          line: 205
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
          line: 206
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 206
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
          line: 207
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 207
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
          line: 214
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
          line: 215
        },
        kind: "string"
      }
    }, {
      name: "compilationDBFile",
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
          line: 217
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 217
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 217
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
          line: 218
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 218
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 218
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
          line: 232
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
          line: 233
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 234
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 235
        },
        kind: "number"
      }
    }, {
      name: "compilationDBFile",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 236
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 236
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
          line: 237
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 237
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 237
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
          line: 238
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 238
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
          line: 252
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
          line: 253
        },
        kind: "string"
      }
    }, {
      name: "cursor",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 254
        },
        kind: "number"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 255
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 255
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
          line: 256
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 256
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
          line: 257
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 257
          },
          name: "newCursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 257
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 257
          },
          name: "formatted",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 257
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
          line: 282
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 282
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
        line: 114
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 114
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 115
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
              line: 116
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 117
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 117
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
              line: 118
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 118
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 118
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
            line: 119
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 119
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 119
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
        line: 136
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 136
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 137
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
              line: 138
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 139
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 140
            },
            kind: "number"
          }
        }, {
          name: "tokenStartColumn",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 141
            },
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 142
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 143
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 143
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
              line: 144
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 144
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 144
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
            line: 145
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 145
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 145
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 145
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
        line: 163
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 163
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 164
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
              line: 165
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 166
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 167
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 168
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 168
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
              line: 169
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 169
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 169
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
            line: 170
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 170
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 170
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
        line: 185
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 185
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 186
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
              line: 187
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 188
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 189
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 190
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 190
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
              line: 191
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 191
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 191
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
            line: 192
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 192
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 192
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 192
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
        line: 204
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 204
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 205
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
              line: 206
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 206
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
            line: 207
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 207
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 207
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
        line: 213
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 213
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 214
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
              line: 215
            },
            kind: "string"
          }
        }, {
          name: "compilationDBFile",
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
              line: 217
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 217
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 217
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
            line: 218
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 218
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 218
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 218
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
        line: 231
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 231
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 232
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
              line: 233
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 234
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 235
            },
            kind: "number"
          }
        }, {
          name: "compilationDBFile",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 236
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 236
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
              line: 237
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 237
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 237
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
            line: 238
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 238
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 238
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
        line: 251
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 251
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 252
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
              line: 253
            },
            kind: "string"
          }
        }, {
          name: "cursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 254
            },
            kind: "number"
          }
        }, {
          name: "offset",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 255
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 255
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
              line: 256
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 256
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 257
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 257
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 257
              },
              name: "newCursor",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 257
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 257
              },
              name: "formatted",
              type: {
                location: {
                  type: "source",
                  fileName: "ClangService.js",
                  line: 257
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
        line: 282
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 282
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 282
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 282
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
            line: 282
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
        line: 286
      },
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 286
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 286
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
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 73
          },
          name: "typed_name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 73
            },
            kind: "string"
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
        line: 76
      },
      name: "ClangDeclaration",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 76
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 77
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 78
          },
          name: "point",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 78
            },
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 79
          },
          name: "spelling",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 79
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 79
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 80
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 80
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 80
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 81
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 81
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
        line: 84
      },
      name: "ClangCursor",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 84
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 85
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 85
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 86
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 86
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 87
          },
          name: "cursor_usr",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 87
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 88
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 88
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 88
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
            line: 89
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 89
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 90
          },
          name: "is_definition",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 90
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
        line: 93
      },
      name: "ClangOutlineTree",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 93
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 94
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 94
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 95
          },
          name: "extent",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 95
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 96
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 96
            },
            kind: "named",
            name: "ClangCursorType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          name: "cursor_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 98
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 101
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 101
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 101
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 103
          },
          name: "tparams",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 103
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 103
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 105
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 105
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 105
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
        line: 108
      },
      name: "ClangLocalReferences",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 108
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 109
          },
          name: "cursor_name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 109
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 110
          },
          name: "cursor_kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 110
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 111
          },
          name: "references",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 111
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 111
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