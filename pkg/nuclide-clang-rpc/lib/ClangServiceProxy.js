"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0, arg1, arg2) {
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
      name: "defaultFlags",
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
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 111
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
          line: 112
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 112
          },
          kind: "named",
          name: "ClangCompileResult"
        }
      });
    }).publish();
  };

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 128
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
          line: 129
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 130
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 131
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 132
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 133
        },
        kind: "string"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 134
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 134
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 134
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
          line: 135
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 135
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 135
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
          line: 149
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
          line: 150
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 151
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 152
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 153
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 153
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 153
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
          line: 154
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 154
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
          line: 169
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
          line: 170
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 171
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 172
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 173
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 173
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 173
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
          line: 174
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 174
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 174
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
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 188
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 188
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 188
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
          line: 189
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 189
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 189
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        }
      });
    });
  };

  remoteModule.getLocalReferences = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 197
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
          line: 198
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 199
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 200
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
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
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 201
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
          line: 202
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 202
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
          line: 210
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
          line: 211
        },
        kind: "string"
      }
    }, {
      name: "cursor",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 212
        },
        kind: "number"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 213
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 213
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
          line: 214
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 214
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
          line: 215
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 215
          },
          name: "newCursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 215
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 215
          },
          name: "formatted",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 215
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
          line: 242
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 242
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
        name: "defaultFlags",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 111
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
          line: 112
        },
        kind: "observable",
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
      line: 127
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 127
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 128
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
            line: 129
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 130
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 131
          },
          kind: "number"
        }
      }, {
        name: "tokenStartColumn",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 132
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 133
          },
          kind: "string"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 134
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 134
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 134
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
          line: 135
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 135
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 135
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 135
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
      line: 148
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 148
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 149
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
            line: 150
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 151
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 152
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 153
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 153
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 153
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
          line: 154
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 154
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 154
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
      line: 168
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 168
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 169
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
            line: 170
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 171
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 172
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 173
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 173
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 173
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
          line: 174
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 174
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 174
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 174
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
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 188
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 188
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 188
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
          line: 189
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 189
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 189
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 189
              },
              kind: "named",
              name: "ClangOutlineTree"
            }
          }
        }
      }
    }
  }], ["getLocalReferences", {
    kind: "function",
    name: "getLocalReferences",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 196
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 196
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 197
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
            line: 198
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 199
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 200
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 201
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
          line: 202
        },
        kind: "promise",
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
            kind: "named",
            name: "ClangLocalReferences"
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
      line: 209
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 209
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 210
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
            line: 211
          },
          kind: "string"
        }
      }, {
        name: "cursor",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 212
          },
          kind: "number"
        }
      }, {
        name: "offset",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 213
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 213
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
            line: 214
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 214
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 215
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 215
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 215
            },
            name: "newCursor",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 215
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 215
            },
            name: "formatted",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 215
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
      line: 242
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 242
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 242
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 242
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
          line: 242
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
      line: 246
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 246
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 246
        },
        kind: "void"
      }
    }
  }], ["ClangCursorType", {
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
  }], ["ClangCursorExtent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 21
    },
    name: "ClangCursorExtent",
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
        name: "start",
        type: {
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
              line: 22
            },
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 22
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
          line: 23
        },
        name: "end",
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
      }]
    }
  }], ["ClangLocation", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 26
    },
    name: "ClangLocation",
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
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
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
          line: 29
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
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
      line: 32
    },
    name: "ClangSourceRange",
    definition: {
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
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            name: "line",
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
              line: 34
            },
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 34
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
          line: 35
        },
        name: "end",
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
      }]
    }
  }], ["ClangCompileResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 38
    },
    name: "ClangCompileResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 39
        },
        name: "diagnostics",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 39
          },
          kind: "array",
          type: {
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
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 40
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 41
              },
              name: "severity",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 41
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 42
              },
              name: "location",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 42
                },
                kind: "named",
                name: "ClangLocation"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 43
              },
              name: "ranges",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 43
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 43
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 43
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
                line: 44
              },
              name: "fixits",
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
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 45
                    },
                    name: "range",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 45
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 46
                    },
                    name: "value",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 46
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
                line: 56
              },
              name: "children",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 56
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 56
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 57
                    },
                    name: "spelling",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 57
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 58
                    },
                    name: "location",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 58
                      },
                      kind: "named",
                      name: "ClangLocation"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 59
                    },
                    name: "ranges",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 59
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 59
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
          line: 64
        },
        name: "accurateFlags",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
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
      line: 67
    },
    name: "ClangCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 67
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 68
        },
        name: "chunks",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          kind: "array",
          type: {
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
              name: "spelling",
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
              name: "isPlaceHolder",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 70
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 71
              },
              name: "isOptional",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 71
                },
                kind: "boolean"
              },
              optional: true
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
          kind: "string"
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
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 94
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 94
          },
          kind: "named",
          name: "ClangCursorExtent"
        },
        optional: false
      }]
    }
  }], ["ClangOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 97
    },
    name: "ClangOutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 97
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 98
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 99
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 99
          },
          kind: "named",
          name: "ClangCursorExtent"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 100
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 100
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 102
        },
        name: "cursor_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 102
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 105
        },
        name: "params",
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
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 107
        },
        name: "tparams",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 107
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 109
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 109
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 109
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        },
        optional: true
      }]
    }
  }], ["ClangLocalReferences", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 112
    },
    name: "ClangLocalReferences",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 112
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 113
        },
        name: "cursor_name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 113
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 114
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 114
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 115
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 115
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 115
            },
            kind: "named",
            name: "ClangCursorExtent"
          }
        },
        optional: false
      }]
    }
  }]])
});