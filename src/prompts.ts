import inquirer from 'inquirer';
import { CommentConfig } from './types';

export async function promptForConfig(): Promise<CommentConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Which documentation format would you like to use?',
      choices: [
        { name: 'Documentation.js (default)', value: 'documentation' },
        { name: 'JSDoc', value: 'jsdoc' },
        { name: 'TypeDoc', value: 'typedoc' }
      ],
      default: 'documentation'
    },
    {
      type: 'confirm',
      name: 'includeTypes',
      message: 'Include type information?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeDescriptions',
      message: 'Include descriptions?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include examples?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeParams',
      message: 'Include parameter documentation?',
      default: true
    },
    {
      type: 'confirm',
      name: 'includeReturns',
      message: 'Include return value documentation?',
      default: true
    }
  ]);

  return answers as CommentConfig;
}

export async function promptForFiles(): Promise<string[]> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'files',
      message: 'Enter file paths or glob patterns (comma-separated):',
      default: '**/*.{js,ts,jsx,tsx}'
    }
  ]);

  return answers.files.split(',').map((file: string) => file.trim());
}

export async function promptForAction(): Promise<string> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Generate comments', value: 'generate' },
        { name: 'Clean up garbage comments', value: 'cleanup' },
        { name: 'Both generate and cleanup', value: 'both' }
      ],
      default: 'generate'
    }
  ]);

  return answers.action;
}