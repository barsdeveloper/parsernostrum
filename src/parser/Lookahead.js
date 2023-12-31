import Parser from "./Parser.js"
import Reply from "../Reply.js"

/** @template {Parser<any>} T */
export default class Lookahead extends Parser {

    #parser
    get parser() {
        return this.#parser
    }

    #type
    get type() {
        return this.#type
    }

    /**
     * @readonly
     * @enum {String}
     */
    static Type = {
        NEGATIVE_AHEAD: "?!",
        NEGATIVE_BEHIND: "?<!",
        POSITIVE_AHEAD: "?=",
        POSITIVE_BEHIND: "?<=",
    }

    /**
     * @param {T} parser
     * @param {Type} type
     */
    constructor(parser, type) {
        super()
        this.#parser = parser
        this.#type = type
    }

    unwrap() {
        return [this.#parser]
    }

    /**
     * @template {Parser<any>[]} P
     * @param {P} parsers
     */
    wrap(...parsers) {
        return new Lookahead(parsers[0], this.#type)
    }

    /**
     * @param {Context} context
     * @param {Number} position
     */
    parse(context, position) {
        if (
            this.#type === Lookahead.Type.NEGATIVE_BEHIND
            || this.#type === Lookahead.Type.POSITIVE_BEHIND
        ) {
            throw new Error("Lookbehind is not implemented yet")
        } else {
            const result = this.#parser.parse(context, position)
            return result.status == (this.#type === Lookahead.Type.POSITIVE_AHEAD)
                ? Reply.makeSuccess(position, "")
                : Reply.makeFailure(position)
        }
    }

    /**
     * @protected
     * @param {Context} context
     */
    doToString(context, indent = 0) {
        return "(" + this.#type + this.#parser.toString(context, indent) + ")"
    }
}
