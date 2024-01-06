import Parser from "./Parser.js"
import Reply from "../Reply.js"

/**
 * @template {String} T
 * @extends {Parser<T>}
 */
export default class StringParser extends Parser {

    static successParserInstance

    #value
    get value() {
        return this.#value
    }

    /** @param {T} value */
    constructor(value) {
        super()
        this.#value = value
    }

    /**
     * @param {Context} context
     * @param {Number} position
     */
    parse(context, position) {
        const end = position + this.#value.length
        const value = context.input.substring(position, end)
        return this.#value === value
            ? Reply.makeSuccess(end, this.#value)
            : Reply.makeFailure(position)
    }

    /**
     * @protected
     * @param {Context} context
     * @param {Parser<any>} highlight
     */
    doToString(context, indent, highlight) {
        const inlined = this.value.replaceAll("\n", "\\n")
        let result = this.value.length !== 1 || this.value.trim() !== this.value
            ? `"${inlined.replaceAll('"', '\\"')}"`
            : inlined
        if (highlight === this) {
            result += "\n" + Parser.indentation.repeat(indent) + "^".repeat(result.length) + " " + Parser.highlight
        }
        return result
    }
}
