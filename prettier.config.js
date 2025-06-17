module.exports = {
    arrowParens: 'always',
    bracketSpacing: true,
    endOfLine: 'lf',
    bracketSameLine: false,
    jsxSingleQuote: true,
    printWidth: 80,
    proseWrap: 'always',
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    useTabs: false,
    overrides: [
        {
            files: ['*.md'],
            options: {
                proseWrap: 'preserve',
            },
        },
    ],
};
