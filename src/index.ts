#!/usr/bin/env node
// .....................Node Module Imports Begins................................
import program from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import clear from 'clear';
import chalk from 'chalk';
import fs from 'fs';

var child_process = require('child_process');
const axios = require('axios').default;
const open = require('open');
const os = require('os');

const filePath = os.homedir() + '/toyConfig.json';
const installCLICommand = 'toyserver install cli';
const toyboxWebpage = 'https://dev.toybox.dev';
const osSystem = os.platform();
const cliCommand = 'toy';

let userNameQ = [
  {
    type: 'input',
    name: 'email',
    message: 'email:',
  },
];
let passwordQ = [
  {
    type: 'password',
    name: 'password',
    message: 'password:',
  },
];

export const httpClient = axios.create({
  baseURL: 'https://dev-api.toybox.dev',
});

// ...............Code Implementation Begins Here............................

if (process.argv[2] === undefined) {
  clear();                                              // Clears the command Line Interface
  ToyLog();
  child_process.execSync(installCLICommand, { stdio: [0, 1, 2] });
}

export function ToyLog(): void {
  console.log(chalk.red(figlet.textSync('Toy-Server', { horizontalLayout: 'full' })));
  console.log('Usage: toyserver install cli:- To install the Toy CLI globally in user system');
}

/**This method is invoked on the command 'toyserver install cli' */
export function CMDLogin(): void {
  let email = '';
  let password = '';
  inquirer.prompt(userNameQ).then((answer: any) => {
    email = answer.email;
    inquirer.prompt(passwordQ).then((answer: any) => {
      password = answer.password;
      GetLoginData(email, password);
    });
  });
}

export async function GetLoginData(email: any, password: any) {
  const payload = {
    email: email,
    password: password,
  };
  try {
    const response = await httpClient({
      url: '/toybox/signin',
      data: payload,
      method: 'POST',
    });
    const loginData = {
      ...response.data
    }
    const subscription = await GetSubscription(loginData);
    const LoggedInMessage = `You are now Logged In \n Username: ${chalk.green(response.data['custom:firstName'] + response.data['custom:lastName'])} \n Email: ${chalk.green(response.data['cognito:username'])}`;
    console.log(LoggedInMessage);
    loginData['subscription'] = subscription.data;
    fs.writeFileSync(filePath, JSON.stringify(loginData));
    downlaodCLI(loginData);
  } catch (error) {
    console.log(chalk.red(error.message));
  }
}

export async function GetSubscription(data: any) {
  console.log(data);
  const subPayload = {
    id: data['cognito:username'],
  };
  return httpClient({
    url: '/users/fetch',
    data: subPayload,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.idToken}`,
    },
  });
}

export async function downlaodCLI(data: any) {
  try {
    const response = await httpClient({
      url: '/auth/install',
      method: 'POST',
      headers: {
        Authorization: data.idToken,
      },
    });
    let command = osSystem === 'darwin' ? `sudo npm install -g ${response.data.install}` : `npm install -g ${response.data.install}`;
    console.log('Installing the package for you. Please wait....');
    child_process.execSync(command, { stdio: [0, 1, 2] });
    child_process.execSync(cliCommand, { stdio: [0, 1, 2] });
    open(toyboxWebpage)
  } catch (error) {
    console.log(chalk.red('Command Execution Failed. Please try agian....'));
  }
}

/**
 * This method is used to invoke the command:-toy Login
 * Global Installation of Toy Command Line Interface
 */
program
  .command('install <cli>')
  .description('Global Installation of Toy Command Line Interface')
  .action(() => {
    CMDLogin();
  });
program.parse(process.argv);
//Code Implementation Ends Here
