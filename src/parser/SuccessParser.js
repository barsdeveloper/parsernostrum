import StringParser from "./StringParser.js"

/** @extends StringParser<""> */
export default class SuccessParser extends StringParser {

    static instance = new SuccessParser()

    static {
        StringParser.successParserInstance = this.instance
    }

    constructor() {
        super("")
    }

    /**
     * @protected
     * @param {Context} context
     */
    doToString(context, indent = 0) {
        return "<SUCCESS>"
    }
}
