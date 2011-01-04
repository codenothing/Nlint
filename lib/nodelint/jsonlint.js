/*
	Jison generated parser
	MIT Licensed
	Zach Carter
*/
module.exports = (function(){
var parser = {trace: function trace() {
},
yy: {},
symbols_: {"JSONString":2,"STRING":3,"JSONNumber":4,"NUMBER":5,"JSONNullLiteral":6,"NULL":7,"JSONBooleanLiteral":8,"TRUE":9,"FALSE":10,"JSONText":11,"JSONObject":12,"JSONArray":13,"JSONValue":14,"{":15,"}":16,"JSONMemberList":17,"JSONMember":18,":":19,",":20,"[":21,"]":22,"JSONElementList":23,"$accept":0,"$end":1},
terminals_: {"3":"STRING","5":"NUMBER","7":"NULL","9":"TRUE","10":"FALSE","15":"{","16":"}","19":":","20":",","21":"[","22":"]"},
productions_: [0,[2,1],[4,1],[6,1],[8,1],[8,1],[11,1],[11,1],[14,1],[14,1],[14,1],[14,1],[14,1],[14,1],[12,2],[12,3],[18,3],[17,1],[17,3],[13,2],[13,3],[23,1],[23,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy) {
    var $$ = arguments[5], $0 = arguments[5].length;
    switch (arguments[4]) {
      case 1:
        this.$ = yytext;
        break;
      case 2:
        this.$ = Number(yytext);
        break;
      case 3:
        this.$ = null;
        break;
      case 4:
        this.$ = true;
        break;
      case 5:
        this.$ = false;
        break;
      case 6:
        return this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 7:
        return this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 8:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 9:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 10:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 11:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 12:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 13:
        this.$ = $$[$0 - 1 + 1 - 1];
        break;
      case 14:
        this.$ = {};
        break;
      case 15:
        this.$ = $$[$0 - 3 + 2 - 1];
        break;
      case 16:
        this.$ = [$$[$0 - 3 + 1 - 1], $$[$0 - 3 + 3 - 1]];
        break;
      case 17:
        this.$ = {};
        this.$[$$[$0 - 1 + 1 - 1][0]] = $$[$0 - 1 + 1 - 1][1];
        break;
      case 18:
        this.$ = $$[$0 - 3 + 1 - 1];
        $$[$0 - 3 + 1 - 1][$$[$0 - 3 + 3 - 1][0]] = $$[$0 - 3 + 3 - 1][1];
        break;
      case 19:
        this.$ = [];
        break;
      case 20:
        this.$ = $$[$0 - 3 + 2 - 1];
        break;
      case 21:
        this.$ = [$$[$0 - 1 + 1 - 1]];
        break;
      case 22:
        this.$ = $$[$0 - 3 + 1 - 1];
        $$[$0 - 3 + 1 - 1].push($$[$0 - 3 + 3 - 1]);
        break;
      default:;
    }
},
table: [{"11":1,"12":2,"13":3,"15":[1,4],"21":[1,5]},{"1":[3]},{"1":[2,6]},{"1":[2,7]},{"16":[1,6],"17":7,"18":8,"2":9,"3":[1,10]},{"22":[1,11],"23":12,"14":13,"6":14,"8":15,"2":16,"4":17,"12":18,"13":19,"7":[1,20],"9":[1,21],"10":[1,22],"3":[1,10],"5":[1,23],"15":[1,4],"21":[1,5]},{"1":[2,14],"22":[2,14],"20":[2,14],"16":[2,14]},{"16":[1,24],"20":[1,25]},{"16":[2,17],"20":[2,17]},{"19":[1,26]},{"19":[2,1],"22":[2,1],"20":[2,1],"16":[2,1]},{"1":[2,19],"22":[2,19],"20":[2,19],"16":[2,19]},{"22":[1,27],"20":[1,28]},{"22":[2,21],"20":[2,21]},{"22":[2,8],"20":[2,8],"16":[2,8]},{"22":[2,9],"20":[2,9],"16":[2,9]},{"22":[2,10],"20":[2,10],"16":[2,10]},{"22":[2,11],"20":[2,11],"16":[2,11]},{"22":[2,12],"20":[2,12],"16":[2,12]},{"22":[2,13],"20":[2,13],"16":[2,13]},{"22":[2,3],"20":[2,3],"16":[2,3]},{"22":[2,4],"20":[2,4],"16":[2,4]},{"22":[2,5],"20":[2,5],"16":[2,5]},{"22":[2,2],"20":[2,2],"16":[2,2]},{"1":[2,15],"22":[2,15],"20":[2,15],"16":[2,15]},{"18":29,"2":9,"3":[1,10]},{"14":30,"6":14,"8":15,"2":16,"4":17,"12":18,"13":19,"7":[1,20],"9":[1,21],"10":[1,22],"3":[1,10],"5":[1,23],"15":[1,4],"21":[1,5]},{"1":[2,20],"22":[2,20],"20":[2,20],"16":[2,20]},{"14":31,"6":14,"8":15,"2":16,"4":17,"12":18,"13":19,"7":[1,20],"9":[1,21],"10":[1,22],"3":[1,10],"5":[1,23],"15":[1,4],"21":[1,5]},{"16":[2,18],"20":[2,18]},{"16":[2,16],"20":[2,16]},{"22":[2,22],"20":[2,22]}],
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], table = this.table, yytext = "", yylineno = 0, yyleng = 0, shifts = 0, reductions = 0;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    var parseError = this.yy.parseError = this.yy.parseError || this.parseError;

    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token];
        }
        return token;
    }

    var symbol, state, action, a, r, yyval = {}, p, len, ip = 0, newState, expected;
    symbol = lex();
    while (true) {
        state = stack[stack.length - 1];
        action = table[state] && table[state][symbol];
        if (typeof action === "undefined" || !action.length || !action[0]) {
            expected = [];
            for (p in table[state]) {
                if (this.terminals_[p] && p != 1) {
                    expected.push("'" + this.terminals_[p] + "'");
                }
            }
            if (this.lexer.showPosition) {
                parseError("Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", "), {text: this.lexer.match, token: this.terminals_[symbol], line: this.lexer.yylineno, expected: expected});
            } else {
                parseError("Parse error on line " + (yylineno + 1) + ": Unexpected '" + this.terminals_[symbol] + "'", {text: this.lexer.match, token: this.terminals_[symbol], line: this.lexer.yylineno, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        a = action;
        switch (a[0]) {
          case 1:
            shifts++;
            stack.push(symbol);
            ++ip;
            yyleng = this.lexer.yyleng;
            yytext = this.lexer.yytext;
            yylineno = this.lexer.yylineno;
            symbol = lex();
            vstack.push(null);
            stack.push(a[1]);
            break;
          case 2:
            reductions++;
            len = this.productions_[a[1]][1];
            yyval.$ = vstack[vstack.length - len];
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, a[1], vstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[a[1]][0]);
            vstack.push(yyval.$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
          case 3:
            this.reductionCount = reductions;
            this.shiftCount = shifts;
            return true;
          default:;
        }
    }
    return true;
}};/* Jison generated lexer */
var lexer = (function(){var lexer = ({EOF:"",
parseError:function parseError(str, hash) {
    if (this.yy.parseError) {
        this.yy.parseError(str, hash);
    } else {
        throw new Error(str);
    }
},
setInput:function (input) {
    this._input = input;
    this._more = this._less = this.done = false;
    this.yylineno = this.yyleng = 0;
    this.yytext = this.matched = this.match = "";
    return this;
},
input:function () {
    var ch = this._input[0];
    this.yytext += ch;
    this.yyleng++;
    this.match += ch;
    this.matched += ch;
    var lines = ch.match(/\n/);
    if (lines) {
        this.yylineno++;
    }
    this._input = this._input.slice(1);
    return ch;
},
unput:function (ch) {
    this._input = ch + this._input;
    return this;
},
more:function () {
    this._more = true;
    return this;
},
pastInput:function () {
    var past = this.matched.substr(0, this.matched.length - this.match.length);
    return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
},
upcomingInput:function () {
    var next = this.match;
    if (next.length < 20) {
        next += this._input.substr(0, 20 - next.length);
    }
    return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
},
showPosition:function () {
    var pre = this.pastInput();
    var c = (new Array(pre.length + 1)).join("-");
    return pre + this.upcomingInput() + "\n" + c + "^";
},
next:function () {
    if (this.done) {
        return this.EOF;
    }
    if (!this._input) {
        this.done = true;
    }
    var token, match, lines;
    if (!this._more) {
        this.yytext = "";
        this.match = "";
    }
    for (var i = 0; i < this.rules.length; i++) {
        match = this._input.match(this.rules[i]);
        if (match) {
            lines = match[0].match(/\n/g);
            if (lines) {
                this.yylineno += lines.length;
            }
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, i);
            if (token) {
                return token;
            } else {
                return;
            }
        }
    }
    if (this._input == this.EOF) {
        return this.EOF;
    } else {
        this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {text: "", token: null, line: this.yylineno});
    }
},
lex:function () {
    var r = this.next();
    if (typeof r !== "undefined") {
        return r;
    } else {
        return this.lex();
    }
}});
lexer.performAction = function anonymous(yy, yy_) {
    switch (arguments[2]) {
      case 0:
        break;
      case 1:
        return 5;
        break;
      case 2:
        yy_.yytext = yy_.yytext.substr(1, yy_.yyleng - 2);
        return 3;
        break;
      case 3:
        return 15;
        break;
      case 4:
        return 16;
        break;
      case 5:
        return 21;
        break;
      case 6:
        return 22;
        break;
      case 7:
        return 20;
        break;
      case 8:
        return 19;
        break;
      case 9:
        return 9;
        break;
      case 10:
        return 10;
        break;
      case 11:
        return 7;
        break;
      case 12:
        return "INVALID";
        break;
      default:;
    }
};
lexer.rules = [/^\s+/,/^-?([0-9]|[1-9][0-9]+)(\.[0-9]+)?([eE][-+]?[0-9]+)?\b\b/,/^"(\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^\0-\x08\x0a-\x1f"\\])*"/,/^\{/,/^\}/,/^\[/,/^\]/,/^,/,/^:/,/^true\b/,/^false\b/,/^null\b/,/^./];return lexer;})()
parser.lexer = lexer;
return parser;
})();
