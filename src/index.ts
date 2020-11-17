#!/usr/bin/env node
// .....................Node Module Imports Begins................................
import { machineId } from 'node-machine-id';
import CryptoJS from 'crypto-js';
import program from "commander";
import inquirer from 'inquirer';
import figlet from 'figlet';
import clear from "clear";
import chalk from 'chalk';
import fs from "fs";

var child_process = require('child_process');
const axios = require('axios').default;
const io = require('socket.io-client');
const readline = require('readline');
const open = require('open');
const os = require('os');

const filePath = os.homedir() + '/toyConfig.json';
const LOGINURL = 'https://play.toybox.dev';
const LOGIN = '/login';
const osSystem = os.platform();
let userNameQ = [{
  type: "input",
  name: "email",
  message: "email:",
}];

let passwordQ = [{
  type: "password",
  name: "password",
  message: "password:",
}];
export const httpClient = axios.create({
  baseURL: 'https://apiserver.toybox.dev'
});

// ...............Code Implementation Begins Here............................

if (process.argv[2] === undefined) {
  clear();                                 // Clears the command Line Interface
  ToyLog();
}

export function ToyLog(): void {
  console.log(
    chalk.red(figlet.textSync("Toy-Server", { horizontalLayout: "full" }))
  );
  console.log('Usage: toyserver install cli:- To install the Toy CLI globally in user system');
}

/**
 * function to generate Hash key
 * @param socId : Socket ID
 * @param callback : Hash key return in callback
 */
export async function GenerateHashKey(socId: any, callback: any) {
  const macId = await machineId();
  const timestamp = new Date().getTime();
  const socketId = socId;
  const hashKey = { macId, socketId, timestamp };
  const ciphertext = await CryptoJS.AES.encrypt(JSON.stringify(hashKey), 'ToyPlay123').toString();
  callback(ciphertext);
}

export function Login() {
  console.log(chalk.green("ToyPlay: Press any key to open up the browser to login or q to exit:"));
  var socket = io.connect('https://apiserver.toybox.dev', { reconnect: false });
  console.log(socket);
  socket.on('connect', () => {
    GenerateHashKey(socket.id, (ciphertext: any) => {
      const loginPageUrl = LOGINURL + LOGIN + '?hashId=' + ciphertext;
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.on('keypress', (str, key) => {
        key.name === 'q' ? process.exit() : open(loginPageUrl);
      });
    });
  });
  socket.on("AuthMsgFromToyPlay", function (loginUser: any) {
    const loginData = {
      isLoggedIn: true,
      loginUser: loginUser,
    }
    const LoggedInMessage = `You are now Logged In \n Username: ${chalk.green(loginData.loginUser.userLogin.name)} \n Email: ${chalk.green(loginData.loginUser.userLogin.email)}`;
    console.log(LoggedInMessage);
    fs.writeFileSync(filePath, JSON.stringify(loginData));
    downlaodCLI(loginData, socket, process);
  });
}

export function IsFileExists(filePath: any) {
  if (!fs.existsSync(filePath)) {
    return false;
  } else {
    return true;
  }
}

export async function downlaodCLI(loginData: any, socket?: any, process?: any) {
  console.log(loginData)
  let command;
  try {
    const response = await httpClient({
      url: '/api/auth/cli/install',
      method: "POST",
      headers: {
        Authorization: loginData.token
      }
    });
    console.log(response.data);
    command = osSystem === 'darwin' ? `sudo npm install -g ${response.data.install}` : `npm install -g ${response.data.install}`;
    console.log('Installing the package for you. Please wait window will automatically close on completion');
    child_process.execSync(command, { stdio: [0, 1, 2] });
    // socket.disconnect();
    // process.exit();
  } catch (error) {
    console.log(chalk.red("Command Execution Failed. Please try agian...."));
  }
}


export function CMDLogin() {
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
    password: password
  };
  try {
    const response = await httpClient({
      url: '/api/auth/login',
      data: payload,
      method: "POST",
    });
    const LoggedInMessage = `You are now Logged In \n Username: ${chalk.green(response.data.userLogin.name)} \n Email: ${chalk.green(response.data.userLogin.email)}`;
    console.log(LoggedInMessage);
    fs.writeFileSync(filePath, JSON.stringify(response.data));
    downlaodCLI(response.data);
  } catch (error) {
    console.log(chalk.red(error.message));
  }
}

/**
* This method is used to invoke the command:-toy Login
* to allow the user to login into the ToyBox
*/
program
  .command("install <cli>")
  .description("Install the CLI globally")
  .action(() => {
    // Login()
    CMDLogin();
  });

program.parse(process.argv);
//Code Implementation Ends Here
