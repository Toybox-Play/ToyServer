#!/usr/bin/env node
// .....................Node Module Imports Begins................................
import { machineId } from 'node-machine-id';
import CryptoJS from 'crypto-js';
import program from "commander";
import figlet from 'figlet';
import clear from "clear";
import chalk from 'chalk';
import fs from "fs";

const io = require('socket.io-client');
const readline = require('readline');
const open = require('open');
const os = require('os');


const filePath = os.homedir() + '/toyConfig.json';
const LOGINURL = 'https://play.toybox.dev';
const LOGIN = '/login';

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
  var socket = io.connect('https://api.toy-boxpro.com', { reconnect: false });
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
    socket.disconnect();
    process.exit()
  });
}


/**
* This method is used to invoke the command:-toy Login
* to allow the user to login into the ToyBox
*/
program
  .command("install <cli>")
  .description("Install the CLI globally")
  .action(() => {
    Login()
  });

program.parse(process.argv);
//Code Implementation Ends Here
