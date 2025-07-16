import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin-js';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        plugins: {
            '@stylistic/js': stylistic,
            jsdoc: jsdoc
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Foundry VTT globals
                game: 'readonly',
                canvas: 'readonly',
                ui: 'readonly',
                foundry: 'readonly',
                Hooks: 'readonly',
                CONFIG: 'readonly',
                ChatMessage: 'readonly',
                Dialog: 'readonly',
                renderTemplate: 'readonly',
                duplicate: 'readonly',
                mergeObject: 'readonly',
                expandObject: 'readonly',
                flattenObject: 'readonly',
                deepClone: 'readonly',
                isNewerVersion: 'readonly',
                randomID: 'readonly',
                
                // WFRP4e System globals
                warhammer: 'readonly',
                SocketHandlers: 'readonly',
                
                // WFRP4e Models and Classes
                ArmourModel: 'readonly',
                SkillDialog: 'readonly',
                TestWFRP: 'readonly',
                ChannelTest: 'readonly',
                CastTest: 'readonly',
                
                // Foundry VTT Canvas/PIXI globals
                PIXI: 'readonly',
                Ray: 'readonly',
                
                // Helper classes (might be from other modules)
                AreaHelpers: 'readonly',
                TokenHelpers: 'readonly',
                
                // Browser globals
                console: 'readonly',
                $: 'readonly',
                jQuery: 'readonly'
            }
        },
        rules: {
            // Code quality rules
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': 'error',
            'curly': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2, 10, 100] }],
            
            // Stylistic rules
            '@stylistic/js/indent': ['error', 4],
            '@stylistic/js/quotes': ['error', 'single'],
            '@stylistic/js/semi': ['error', 'always'],
            '@stylistic/js/comma-dangle': ['error', 'never'],
            '@stylistic/js/object-curly-spacing': ['error', 'always'],
            '@stylistic/js/array-bracket-spacing': ['error', 'never'],
            '@stylistic/js/brace-style': ['error', '1tbs'],
            '@stylistic/js/keyword-spacing': 'error',
            '@stylistic/js/space-before-blocks': 'error',
            '@stylistic/js/space-before-function-paren': ['error', 'never'],
            '@stylistic/js/space-in-parens': ['error', 'never'],
            '@stylistic/js/space-infix-ops': 'error',
            '@stylistic/js/space-unary-ops': 'error',
            '@stylistic/js/no-trailing-spaces': 'error',
            '@stylistic/js/eol-last': 'error',
            '@stylistic/js/max-len': ['error', { code: 120 }],
            
            // JSDoc rules
            'jsdoc/require-description': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-returns-description': 'off',
            'jsdoc/require-param-type': 'off',
            'jsdoc/require-returns': 'off',
            'jsdoc/require-jsdoc': ['error', {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true
                }
            }],
            'jsdoc/tag-lines': 'off'
        }
    },
    {
        files: ['rollup.config.js', 'dbpacker.js', 'foundry-path.mjs'],
        rules: {
            // Relaxed rules for build files
            'no-console': 'off',
            'jsdoc/require-jsdoc': 'off'
        }
    }
];