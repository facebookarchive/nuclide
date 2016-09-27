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
  }], ["ClangLocation", {
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
  }], ["ClangSourceRange", {
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
          kind: "named",
          name: "NuclideUri"
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
  }], ["ClangCompileResult", {
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
  }], ["ClangCompletion", {
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
  }], ["ClangDeclaration", {
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
  }], ["ClangCursor", {
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
      }]
    }
  }], ["ClangOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 89
    },
    name: "ClangOutlineTree",
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
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 92
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 94
        },
        name: "cursor_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 94
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 97
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 97
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 97
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 99
        },
        name: "tparams",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 99
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 99
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 101
        },
        name: "children",
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
      line: 104
    },
    name: "ClangLocalReferences",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 104
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 105
        },
        name: "cursor_name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 105
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 106
        },
        name: "cursor_kind",
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
        name: "references",
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
            kind: "named",
            name: "atom$Range"
          }
        },
        optional: false
      }]
    }
  }]])
});