"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const config_1 = require("./config");
const analyzer_1 = require("./analyzer");
const generator_1 = require("./generator");
const cleaner_1 = require("./cleaner");
const file_utils_1 = require("./file-utils");
const ast_injector_1 = require("./ast-injector");
const template_engine_1 = require("./template-engine");
const prompts_1 = require("./prompts");
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const ora_1 = __importDefault(require("ora"));
async function main() {
    console.log(chalk_1.default.blue(figlet_1.default.textSync('Comment Genius', { horizontalLayout: 'full' })));
    try {
        const configManager = new config_1.ConfigManager();
        const config = await (0, prompts_1.promptForConfig)();
        await configManager.saveConfig(config);
        const action = await (0, prompts_1.promptForAction)();
        const filePatterns = await (0, prompts_1.promptForFiles)();
        const files = await file_utils_1.FileUtils.findFiles(filePatterns);
        if (files.length === 0) {
            console.log(chalk_1.default.yellow('No files found matching the patterns.'));
            return;
        }
        console.log(chalk_1.default.green(`Found ${files.length} file(s) to process:`));
        files.forEach(file => console.log(`  - ${file}`));
        if (action === 'generate' || action === 'both') {
            await generateComments(files, config);
        }
        if (action === 'cleanup' || action === 'both') {
            await cleanupComments(files);
        }
        console.log(chalk_1.default.green('✅ All done!'));
    }
    catch (error) {
        if (error instanceof Error)
            console.error(chalk_1.default.red('❌ Error:'), error.message);
        process.exit(1);
    }
}
async function generateComments(files, config) {
    const spinner = (0, ora_1.default)('Generating comments...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        const templateEngine = new template_engine_1.TemplateEngine(config);
        const generator = new generator_1.CommentGenerator(config);
        // Load custom templates if specified
        if (config.templatePath) {
            await templateEngine.loadCustomTemplatesFromFile(config.templatePath);
        }
        for (const file of files) {
            try {
                const analysis = analyzer.analyzeFile(file);
                let content = await file_utils_1.FileUtils.readFile(file);
                const commentsToInject = new Map();
                // Generate comments for all elements
                for (const func of analysis.functions) {
                    const comment = generator.generateFunctionComment(func);
                    commentsToInject.set(func.name, comment);
                }
                for (const cls of analysis.classes) {
                    const comment = generator.generateClassComment(cls);
                    commentsToInject.set(cls.name, comment);
                    for (const method of cls.methods) {
                        const methodComment = generator.generateMethodComment(method);
                        commentsToInject.set(`${cls.name}.${method.name}`, methodComment);
                    }
                    for (const prop of cls.properties) {
                        const propComment = generator.generatePropertyComment(prop);
                        commentsToInject.set(`${cls.name}.${prop.name}`, propComment);
                    }
                }
                for (const variable of analysis.variables) {
                    const comment = generator.generateVariableComment(variable);
                    commentsToInject.set(variable.name, comment);
                }
                // Use AST-based injection
                content = ast_injector_1.ASTCommentInjector.injectComments(content, commentsToInject);
                await file_utils_1.FileUtils.writeFile(file, content);
                spinner.text = `Processed: ${file}`;
            }
            catch (error) {
                if (error instanceof Error)
                    spinner.warn(`Skipped ${file}: ${error.message}`);
            }
        }
        spinner.succeed('Comment generation completed!');
    }
    catch (error) {
        spinner.fail('Comment generation failed!');
        throw error;
    }
}
async function cleanupComments(files) {
    const spinner = (0, ora_1.default)('Cleaning up comments...').start();
    try {
        const cleaner = new cleaner_1.CommentCleaner();
        for (const file of files) {
            try {
                const cleanedContent = await cleaner.cleanFile(file);
                await file_utils_1.FileUtils.writeFile(file, cleanedContent);
                spinner.text = `Cleaned: ${file}`;
            }
            catch (error) {
                if (error instanceof Error)
                    spinner.warn(`Skipped ${file}: ${error.message}`);
            }
        }
        spinner.succeed('Comment cleanup completed!');
    }
    catch (error) {
        spinner.fail('Comment cleanup failed!');
        throw error;
    }
}
//# sourceMappingURL=index.js.map