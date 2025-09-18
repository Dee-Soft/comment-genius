#!/usr/bin/env node

import { ConfigManager } from './config';
import { CodeAnalyzer } from './analyzer';
import { CommentGenerator } from './generator';
import { CommentCleaner } from './cleaner';
import { FileUtils } from './file-utils';
import { promptForConfig, promptForFiles, promptForAction } from './prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';

export async function main(): Promise<void> {
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
    const generator = new CommentGenerator(config);

    for (const file of files) {
      try {
        const analysis = analyzer.analyzeFile(file);
        let content = await FileUtils.readFile(file);

        // Generate comments for functions
        for (const func of analysis.functions) {
          const comment = generator.generateFunctionComment(func);
          content = injectComment(content, func.name, comment);
        }

        // Generate comments for classes
        for (const cls of analysis.classes) {
          const comment = generator.generateClassComment(cls);
          content = injectComment(content, cls.name, comment);
        }

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

function injectComment(content: string, identifier: string, comment: string): string {
  // Simple implementation - in real world, you'd use proper AST manipulation
  const lines = content.split('\n');
  const newLines: string[] = [];
  let injected = false;

  for (const line of lines) {
    if (line.includes(identifier) && !injected) {
      newLines.push(comment);
      injected = true;
    }
    newLines.push(line);
  }

  return newLines.join('\n');
}

// Add missing readFile method to FileUtils
FileUtils.readFile = async (filePath: string): Promise<string> => {
  return await import('fs').then(fs => fs.promises.readFile(filePath, 'utf-8'));
};

// Export for CLI usage
export { main };