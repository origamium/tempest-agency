module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2018,
        project: "./tsconfig.json",
        sourceType: "module",
        createDefaultProgram: true,
        ecmaFeatures: {
            modules: true
        }
    },
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    plugins: ["@typescript-eslint"],
    settings: {
        node: {
            tryExtensions: [".ts", ".json"]
        }
    }
};