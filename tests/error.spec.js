import { test, expect } from "@playwright/test"
import JsonGrammar from "../src/grammars/JsonGrammar.js"
import P from "../src/Parsernostrum.js"
import MathGrammar from "../src/grammars/MathGrammar.js"

test("Test 1", async ({ page }) => {
    const p = P.seq(P.str("alpha"), P.str("beta"))
    let error = ""
    try {
        p.parse("alphaUnrelated")
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: alphaUnrelated\n'
        + '\n'
        + 'Input: alphaUnrelated\n'
        + '            ^ From here (line: 1, column: 6, offset: 5)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    SEQ<\n'
        + '        "alpha"\n'
        + '        ^^^^^^^ Last valid parser\n'
        + '        "beta"\n'
        + '    >\n'
    )
})

test("Test 2", async ({ page }) => {
    const p = P.alt(
        P.seq(P.str("aaa"), P.str("alpha")),
        P.seq(P.str("aaaa"), P.str("bc")),
        P.seq(P.str("aaaaa"), P.str("xyz")),
        P.seq(P.str("aa"), P.str("b")),
    )
    let error = ""
    try {
        p.parse("aaaa")
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: aaaa\n'
        + '\n'
        + 'Input: aaaa\n'
        + '           ^ From here (line: 1, column: 5, offset: 4), end of string\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        SEQ<\n'
        + '            "aaa"\n'
        + '            "alpha"\n'
        + '        >\n'
        + '        | SEQ<\n'
        + '            "aaaa"\n'
        + '            ^^^^^^ Last valid parser\n'
        + '            "bc"\n'
        + '        >\n'
        + '        | SEQ<\n'
        + '            "aaaaa"\n'
        + '            "xyz"\n'
        + '        >\n'
        + '        | SEQ<\n'
        + '            "aa"\n'
        + '            b\n'
        + '        >\n'
        + '    >\n'
    )
})

test("Test JsonGrammar 1", async ({ page }) => {
    let error = ""
    try {
        JsonGrammar.json.parse(`
            {
                "glossary": {
                    "title": "example glossary",
                    "GlossDiv": {
                        "title": "S",
                        "GlossList": {
                            "GlossEntry": {
                                "ID": "SGML",
                                "SortAs": "SGML",
                                "GlossTerm": "Standard Generalized Markup Language",
                                "Acronym": "SGML",
                                "Abbrev": [ISO 8879:1986",
                                "GlossDef": {
                                    "para": "A meta-markup language, used to create markup languages such as DocBook.",
                                    "GlossSeeAlso": ["GML", "XML"]
                                },
                                "GlossSee": "markup"
                            }
                        }
                    }
                }
            }
        `.trim())
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: { ... "glossary": { ... "title": "example glossary", ... "Gl\n'
        + '\n'
        + 'Input: ..."Abbrev": [ISO 8879:1986", ... "GlossDef": { ... "para": "A ...\n'
        + '                     ^ From here (line: 12, column: 44, offset: 511)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        P.doubleQuotedString\n'
        + '        | P.numberExponential\n'
        + '        | SEQ<\n'
        + '            /\\{\\s*/\n'
        + '            SEQ<\n'
        + '                SEQ<\n'
        + '                    P.doubleQuotedString\n'
        + '                    /\\s*:\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<(...) => { ... }>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    SEQ<\n'
        + '                        P.doubleQuotedString\n'
        + '                        /\\s*:\\s*/\n'
        + '                        <...>\n'
        + '                    > -> map<(...) => { ... }>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]> -> map<(...) => { ... }>\n'
        + '            /\\s*}/\n'
        + '        > -> map<([_0, object, _2]) => object>\n'
        + '        | SEQ<\n'
        + '            /\\[\\s*/\n'
        + '            ^^^^^^^ Last valid parser\n'
        + '            SEQ<\n'
        + '                <...>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]>\n'
        + '            /\\s*\\]/\n'
        + '        > -> map<([_0, values, _2]) => values>\n'
        + '        | "true" -> map<() => true>\n'
        + '        | "false" -> map<() => false>\n'
        + '        | "null" -> map<() => null>\n'
        + '    >\n'
    )
})

test("Test JsonGrammar 2", async ({ page }) => {
    let error = ""
    try {
        JsonGrammar.json.parse(`
            {
                "glossary": {
                    "title": "example glossary",
                    "GlossDiv": {
                        "title": "S",
                        "GlossList": {
                            "GlossEntry": {
                                "ID": "SGML",
                                "SortAs": "SGML",
                                "GlossTerm": "Standard Generalized Markup Language",
                                "Acronym": "SGML",
                                "Abbrev": "ISO 8879:1986",
                                "GlossDef": {
                                    "para": "A meta-markup language, used to create markup languages such as DocBook.",
                                    "GlossSeeAlso": ["GML", "XML"
                                },
                                "GlossSee": "markup"
                            }
                        }
                    }
                }
            }
        `.trim())
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: { ... "glossary": { ... "title": "example glossary", ... "Gl\n'
        + '\n'
        + 'Input: ..."GlossSeeAlso": ["GML", "XML" ... }, ... "GlossSee": "markup...\n'
        + '                                       ^ From here (line: 15, column: 66, offset: 758)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        P.doubleQuotedString\n'
        + '        ^^^^^^^^^^^^^^^^^^^^ Last valid parser\n'
        + '        | P.numberExponential\n'
        + '        | SEQ<\n'
        + '            /\\{\\s*/\n'
        + '            SEQ<\n'
        + '                SEQ<\n'
        + '                    P.doubleQuotedString\n'
        + '                    /\\s*:\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<(...) => { ... }>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    SEQ<\n'
        + '                        P.doubleQuotedString\n'
        + '                        /\\s*:\\s*/\n'
        + '                        <...>\n'
        + '                    > -> map<(...) => { ... }>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]> -> map<(...) => { ... }>\n'
        + '            /\\s*}/\n'
        + '        > -> map<([_0, object, _2]) => object>\n'
        + '        | SEQ<\n'
        + '            /\\[\\s*/\n'
        + '            SEQ<\n'
        + '                <...>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]>\n'
        + '            /\\s*\\]/\n'
        + '        > -> map<([_0, values, _2]) => values>\n'
        + '        | "true" -> map<() => true>\n'
        + '        | "false" -> map<() => false>\n'
        + '        | "null" -> map<() => null>\n'
        + '    >\n'
    )
})

test("Test JsonGrammar 3", async ({ page }) => {
    let error = ""
    try {
        JsonGrammar.json.parse(`
            {
                "glossary": {
                    "title": "example glossary",
                    "GlossDiv": {
                        "title": "S",
                        "GlossList": {
                            "GlossEntry": {
                                "ID": "SGML",
                                "SortAs": "SGML",
                                "GlossTerm": "Standard Generalized Markup Language",
                                "Acronym": "SGML",
                                "Abbrev": "ISO 8879:1986",
                                "GlossDef": {
                                    "para": "A meta-markup language, used to create markup languages such as DocBook.",
                                    "GlossSeeAlso": ["GML", "XML"]
                                },
                                "GlossSee": "markup"
                            }
                        }
                    }
                }
        `.trim())
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: { ... "glossary": { ... "title": "example glossary", ... "Gl\n'
        + '\n'
        + 'Input: ...} ... } ... } ... }\n'
        + '                             ^ From here (line: 21, column: 18, offset: 943), end of string\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        P.doubleQuotedString\n'
        + '        | P.numberExponential\n'
        + '        | SEQ<\n'
        + '            /\\{\\s*/\n'
        + '            SEQ<\n'
        + '                SEQ<\n'
        + '                    P.doubleQuotedString\n'
        + '                    /\\s*:\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<(...) => { ... }>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    SEQ<\n'
        + '                        P.doubleQuotedString\n'
        + '                        /\\s*:\\s*/\n'
        + '                        <...>\n'
        + '                    > -> map<(...) => { ... }>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]> -> map<(...) => { ... }>\n'
        + '            /\\s*}/\n'
        + '            ^^^^^^ Last valid parser\n'
        + '        > -> map<([_0, object, _2]) => object>\n'
        + '        | SEQ<\n'
        + '            /\\[\\s*/\n'
        + '            SEQ<\n'
        + '                <...>\n'
        + '                SEQ<\n'
        + '                    /\\s*,\\s*/\n'
        + '                    <...>\n'
        + '                > -> map<([_, v]) => v>*\n'
        + '            > -> map<([first, rest]) => [first, ...rest]>\n'
        + '            /\\s*\\]/\n'
        + '        > -> map<([_0, values, _2]) => values>\n'
        + '        | "true" -> map<() => true>\n'
        + '        | "false" -> map<() => false>\n'
        + '        | "null" -> map<() => null>\n'
        + '    >\n'
    )
})

test("Test MathGrammar 1", async ({ page }) => {
    let error = ""
    try {
        MathGrammar.expression.parse(`5 + 10 - )30`)
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: 5 + 10 - )30\n'
        + '\n'
        + 'Input: 5 + 10 - )30\n'
        + '                ^ From here (line: 1, column: 10, offset: 9)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        SEQ<\n'
        + '            ALT<\n'
        + '                P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '                | SEQ<\n'
        + '                    "("\n'
        + '                    P.whitespaceOpt\n'
        + '                    <...>\n'
        + '                    P.whitespaceOpt\n'
        + '                    ")"\n'
        + '                > -> map<([_0, _1, entries]) => [this.#evaluate(entries)]>\n'
        + '            >\n'
        + '            SEQ<\n'
        + '                P.whitespaceOpt\n'
        + '                ALT<\n'
        + '                    "^" -> map<(...) => { ... }>\n'
        + '                    | "*" -> map<(...) => { ... }>\n'
        + '                    | "/" -> map<(...) => { ... }>\n'
        + '                    | "+" -> map<(...) => { ... }>\n'
        + '                    | "-" -> map<(...) => { ... }>\n'
        + '                > -> map<v => v>\n'
        + '                P.whitespaceOpt\n'
        + '                ^^^^^^^^^^^^^^^ Last valid parser\n'
        + '                <...>\n'
        + '            > -> map<(...) => { ... }>+ -> map<values => values.flatMap(v => v)>\n'
        + '        > -> map<([term, fragment]) => [...term, ...fragment]>\n'
        + '        | P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '    > -> map<v => this.#evaluate(v)>\n'
    )
})

test("Test MathGrammar 2", async ({ page }) => {
    let error = ""
    try {
        MathGrammar.expression.parse(`-30+(2^(1 + 1)*5))`)
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: -30+(2^(1 + 1)*5))\n'
        + '\n'
        + 'Input: -30+(2^(1 + 1)*5))\n'
        + '                        ^ From here (line: 1, column: 18, offset: 17)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        SEQ<\n'
        + '            ALT<\n'
        + '                P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '                | SEQ<\n'
        + '                    "("\n'
        + '                    P.whitespaceOpt\n'
        + '                    <...>\n'
        + '                    P.whitespaceOpt\n'
        + '                    ")"\n'
        + '                    ^^^ Last valid parser\n'
        + '                > -> map<([_0, _1, entries]) => [this.#evaluate(entries)]>\n'
        + '            >\n'
        + '            SEQ<\n'
        + '                P.whitespaceOpt\n'
        + '                ALT<\n'
        + '                    "^" -> map<(...) => { ... }>\n'
        + '                    | "*" -> map<(...) => { ... }>\n'
        + '                    | "/" -> map<(...) => { ... }>\n'
        + '                    | "+" -> map<(...) => { ... }>\n'
        + '                    | "-" -> map<(...) => { ... }>\n'
        + '                > -> map<v => v>\n'
        + '                P.whitespaceOpt\n'
        + '                <...>\n'
        + '            > -> map<(...) => { ... }>+ -> map<values => values.flatMap(v => v)>\n'
        + '        > -> map<([term, fragment]) => [...term, ...fragment]>\n'
        + '        | P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '    > -> map<v => this.#evaluate(v)>\n'
    )
})

test("Test MathGrammar 3", async ({ page }) => {
    let error = ""
    try {
        MathGrammar.expression.parse(`9 + (2^x*4)`)
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: 9 + (2^x*4)\n'
        + '\n'
        + 'Input: 9 + (2^x*4)\n'
        + '              ^ From here (line: 1, column: 8, offset: 7)\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    ALT<\n'
        + '        SEQ<\n'
        + '            ALT<\n'
        + '                P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '                | SEQ<\n'
        + '                    "("\n'
        + '                    P.whitespaceOpt\n'
        + '                    <...>\n'
        + '                    P.whitespaceOpt\n'
        + '                    ")"\n'
        + '                > -> map<([_0, _1, entries]) => [this.#evaluate(entries)]>\n'
        + '            >\n'
        + '            SEQ<\n'
        + '                P.whitespaceOpt\n'
        + '                ALT<\n'
        + '                    "^" -> map<(...) => { ... }>\n'
        + '                    ^^^ Last valid parser\n'
        + '                    | "*" -> map<(...) => { ... }>\n'
        + '                    | "/" -> map<(...) => { ... }>\n'
        + '                    | "+" -> map<(...) => { ... }>\n'
        + '                    | "-" -> map<(...) => { ... }>\n'
        + '                > -> map<v => v>\n'
        + '                P.whitespaceOpt\n'
        + '                <...>\n'
        + '            > -> map<(...) => { ... }>+ -> map<values => values.flatMap(v => v)>\n'
        + '        > -> map<([term, fragment]) => [...term, ...fragment]>\n'
        + '        | P.number -> map<v => Number(v)> -> map<v => [v]>\n'
        + '    > -> map<v => this.#evaluate(v)>\n'
    )
})

/** @type {P<any>} */
const palindromeParser = P.alt(
    P.reg(/[a-z]/).chain(c =>
        P.seq(
            P.lazy(() => palindromeParser).opt(),
            P.str(c)
        ).map(([recursion, _]) => c + recursion + c)
    ),
    P.reg(/([a-z])\1?/)
).opt()

test("Test Palindrome 1", async ({ page }) => {
    let error = ""
    try {
        palindromeParser.parse(`aabcba`)
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: aabcba\n'
        + '\n'
        + 'Input: aabcba\n'
        + '             ^ From here (line: 1, column: 7, offset: 6), end of string\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    <ALT<\n'
        + '        /[a-z]/ => chained<f()>\n'
        + '        ^^^^^^^ Last valid parser\n'
        + '        | /([a-z])\\1?/\n'
        + '    >>?\n'
    )
})

test("Test Palindrome 2", async ({ page }) => {
    let error = ""
    try {
        palindromeParser.parse(`abccbax`)
    } catch (e) {
        error = /** @type {Error} */(e).message
    }
    expect(error).toEqual(
        'Could not parse: abccbax\n'
        + '\n'
        + 'Input: abccbax\n'
        + '              ^ From here (line: 1, column: 8, offset: 7), end of string\n'
        + '\n'
        + 'Last valid parser matched:\n'
        + '    <ALT<\n'
        + '        /[a-z]/ => chained<f()>\n'
        + '        ^^^^^^^ Last valid parser\n'
        + '        | /([a-z])\\1?/\n'
        + '    >>?\n'
    )
})
