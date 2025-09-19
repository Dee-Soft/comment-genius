import { ConfigManager } from './config';
import { CodeAnalyzer } from './analyzer';
import { CommentGenerator } from './generator';
import { CommentCleaner } from './cleaner';
import { FileUtils } from './file-utils';
import { ASTCommentInjector } from './ast-injector';
import { TemplateEngine } from './template-engine';
import { promptForConfig, promptForFiles, promptForAction } from './prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';

async function main(): Promise<void> {
  console.log(chalk.blue(figlet.textSync('Comment Genius', { horizontalLayout: 'full' })));

  try {
    const configManager = new ConfigManager();
    const config = await promptForConfig();
    await configManager.saveConfig(config);

    const action = await promptForAction();
    const filePatterns = await promptForFiles();
    const files = await FileUtils.findFiles(filePatterns);

    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching the patterns.'));
      return;
    }

    console.log(chalk.green(`Found ${files.length} file(s) to process:`));
    files.forEach(file => console.log(`  - ${file}`));

    if (action === 'generate' || action === 'both') {
      await generateComments(files, config);
    }

    if (action === 'cleanup' || action === 'both') {
      await cleanupComments(files);
    }

    console.log(chalk.green('✅ All done!'));
  } catch (error) {
    if (error instanceof Error)
      console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

async function generateComments(files: string[], config: any): Promise<void> {
  const spinner = ora('Generating comments...').start();
  
  try {
    const analyzer = new CodeAnalyzer();
    const templateEngine = new TemplateEngine(config);
    const generator = new CommentGenerator(config);
    
    // Load custom templates if specified
    if (config.templatePath) {
      await templateEngine.loadCustomTemplatesFromFile(config.templatePath);
    }

    for (const file of files) {
      try {
        const analysis = analyzer.analyzeFile(file);
        let content = await FileUtils.readFile(file);

        const commentsToInject = new Map<string, string>();

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
        content = ASTCommentInjector.injectComments(content, commentsToInject);
        
        await FileUtils.writeFile(file, content);
        spinner.text = `Processed: ${file}`;
      } catch (error) {
        if (error instanceof Error)
          spinner.warn(`Skipped ${file}: ${error.message}`);
      }
    }

    spinner.succeed('Comment generation completed!');
  } catch (error) {
    spinner.fail('Comment generation failed!');
    throw error;
  }
}

async function cleanupComments(files: string[]): Promise<void> {
  const spinner = ora('Cleaning up comments...').start();
  
  try {
    const cleaner = new CommentCleaner();

    for (const file of files) {
      try {
        const cleanedContent = await cleaner.cleanFile(file);
        await FileUtils.writeFile(file, cleanedContent);
        spinner.text = `Cleaned: ${file}`;
      } catch (error) {
        if (error instanceof Error)
          spinner.warn(`Skipped ${file}: ${error.message}`);
      }
    }

    spinner.succeed('Comment cleanup completed!');
  } catch (error) {
    spinner.fail('Comment cleanup failed!');
    throw error;
  }
}

// Export for CLI usage
export { main };