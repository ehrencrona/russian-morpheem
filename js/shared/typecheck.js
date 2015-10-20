function typecheck(args, type1, type2, etc) {
    for (var i = 0; i < arguments.length-1; i++) {
        var expectedType = arguments[i + 1]
        var argument = args[i]

        if (typeof expectedType == 'string') {
            if (typeof argument !== expectedType) {
                throw new Error('Expected argument ' + i + ' to be a ' + expectedType + ' but was ' + typeof argument)
            }
        }
        else {
            if (!(argument instanceof expectedType)) {
                throw new Error('Expected argument ' + i + ' to be a ' + expectedType + ' but was ' + typeof argument)
            }
        }
    }
}

module.exports = typecheck