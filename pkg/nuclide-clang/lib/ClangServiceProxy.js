"use strict";

let Observable, trackOperationTiming;

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
      name: "clean",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 111
        },
        kind: "boolean"
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
    });
  };

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 132
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
          line: 133
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 134
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 135
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 136
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 137
        },
        kind: "string"
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

  remoteModule.getDeclaration = function (arg0, arg1, arg2, arg3, arg4) {
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
      name: "defaultFlags",
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
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 157
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
          line: 158
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 158
          },
          kind: "named",
          name: "ClangDeclaration"
        }
      });
    });
  };

  remoteModule.getDeclarationInfo = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 173
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
          line: 174
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 175
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 176
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 177
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 177
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 177
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
          line: 178
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 178
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 178
            },
            kind: "named",
            name: "ClangCursor"
          }
        }
      });
    });
  };

  remoteModule.getOutline = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 190
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
          line: 191
        },
        kind: "string"
      }
    }, {
      name: "defaultFlags",
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
          line: 193
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 193
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 193
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
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
          line: 201
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
          line: 202
        },
        kind: "string"
      }
    }, {
      name: "cursor",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 203
        },
        kind: "number"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 204
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 204
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
          line: 205
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 205
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
          line: 206
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 206
          },
          name: "newCursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 206
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 206
          },
          name: "formatted",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 206
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
          line: 232
        },
        kind: "named",
        name: "NuclideUri"
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
    trackOperationTiming = arguments[1];
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
  }], ["compile", {
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
        name: "clean",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 111
          },
          kind: "boolean"
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
  }], ["getCompletions", {
    kind: "function",
    name: "getCompletions",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 131
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 131
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 132
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
            line: 133
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 134
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 135
          },
          kind: "number"
        }
      }, {
        name: "tokenStartColumn",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 136
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 137
          },
          kind: "string"
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
  }], ["getDeclaration", {
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
        name: "defaultFlags",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 157
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
          line: 158
        },
        kind: "promise",
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
            kind: "named",
            name: "ClangDeclaration"
          }
        }
      }
    }
  }], ["getDeclarationInfo", {
    kind: "function",
    name: "getDeclarationInfo",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 172
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 172
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 173
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
            line: 174
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 175
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 176
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 177
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 177
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 177
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
          line: 178
        },
        kind: "promise",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 178
              },
              kind: "named",
              name: "ClangCursor"
            }
          }
        }
      }
    }
  }], ["getOutline", {
    kind: "function",
    name: "getOutline",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 189
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 189
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 190
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
            line: 191
          },
          kind: "string"
        }
      }, {
        name: "defaultFlags",
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
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 193
        },
        kind: "promise",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 193
              },
              kind: "named",
              name: "ClangOutlineTree"
            }
          }
        }
      }
    }
  }], ["formatCode", {
    kind: "function",
    name: "formatCode",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 200
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 200
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 201
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
            line: 202
          },
          kind: "string"
        }
      }, {
        name: "cursor",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 203
          },
          kind: "number"
        }
      }, {
        name: "offset",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 204
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 204
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
            line: 205
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 205
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 206
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 206
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 206
            },
            name: "newCursor",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 206
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 206
            },
            name: "formatted",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 206
              },
              kind: "string"
            },
            optional: false
          }]
        }
      }
    }
  }], ["reset", {
    kind: "function",
    name: "reset",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 232
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 232
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
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 232
        },
        kind: "void"
      }
    }
  }], ["dispose", {
    kind: "function",
    name: "dispose",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 236
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 236
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 236
        },
        kind: "void"
      }
    }
  }], ["ClangCursorType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 20
    },
    name: "ClangCursorType",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      kind: "string"
    }
  }], ["ClangCursorExtent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 22
    },
    name: "ClangCursorExtent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 24
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }]
    }
  }], ["ClangLocation", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 27
    },
    name: "ClangLocation",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 29
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
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
          line: 30
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 30
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["ClangSourceRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 33
    },
    name: "ClangSourceRange",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 33
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
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
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              kind: "number"
            },
            optional: false
          }]
        },
        optional: false
      }]
    }
  }], ["ClangCompileResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 39
    },
    name: "ClangCompileResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 39
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 40
        },
        name: "diagnostics",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 40
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 40
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 41
              },
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 41
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 42
              },
              name: "severity",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 42
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 43
              },
              name: "location",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 43
                },
                kind: "named",
                name: "ClangLocation"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 44
              },
              name: "ranges",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 44
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 44
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 44
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
                line: 45
              },
              name: "fixits",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 45
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 45
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 46
                    },
                    name: "range",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 46
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 47
                    },
                    name: "value",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 47
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
                line: 57
              },
              name: "children",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 57
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 57
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 58
                    },
                    name: "spelling",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 58
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 59
                    },
                    name: "location",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 59
                      },
                      kind: "named",
                      name: "ClangLocation"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 60
                    },
                    name: "ranges",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 60
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 60
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
          line: 65
        },
        name: "accurateFlags",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          kind: "boolean"
        },
        optional: true
      }]
    }
  }], ["ClangCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 68
    },
    name: "ClangCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 68
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "chunks",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 69
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 69
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 70
              },
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 70
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 71
              },
              name: "isPlaceHolder",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 71
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 72
              },
              name: "kind",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 72
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
          line: 74
        },
        name: "result_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 75
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 76
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 77
        },
        name: "brief_comment",
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
      }]
    }
  }], ["ClangDeclaration", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 80
    },
    name: "ClangDeclaration",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 80
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 81
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 81
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 82
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 83
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 84
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 84
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 85
        },
        name: "type",
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
            kind: "string"
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
          name: "ClangCursorExtent"
        },
        optional: false
      }]
    }
  }], ["ClangCursor", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 89
    },
    name: "ClangCursor",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 89
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 90
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 90
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 91
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 92
        },
        name: "cursor_usr",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 92
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 93
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 93
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 93
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }]
    }
  }], ["ClangOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 96
    },
    name: "ClangOutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 96
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 97
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 97
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 98
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          kind: "named",
          name: "ClangCursorExtent"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 99
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 99
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 101
        },
        name: "cursor_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 101
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 104
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 104
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 104
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 106
        },
        name: "tparams",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 106
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 106
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 108
        },
        name: "children",
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
            name: "ClangOutlineTree"
          }
        },
        optional: true
      }]
    }
  }]])
});