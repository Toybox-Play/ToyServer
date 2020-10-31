#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downlaodCLI = exports.IsFileExists = exports.Login = exports.GenerateHashKey = exports.ToyLog = exports.httpClient = void 0;
// .....................Node Module Imports Begins................................
const node_machine_id_1 = require("node-machine-id");
const crypto_js_1 = __importDefault(require("crypto-js"));
const commander_1 = __importDefault(require("commander"));
const figlet_1 = __importDefault(require("figlet"));
const clear_1 = __importDefault(require("clear"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
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
exports.httpClient = axios.create({
    baseURL: 'https://api.toy-boxpro.com'
});
// ...............Code Implementation Begins Here............................
if (process.argv[2] === undefined) {
    clear_1.default(); // Clears the command Line Interface
    ToyLog();
}
function ToyLog() {
    console.log(chalk_1.default.red(figlet_1.default.textSync("Toy-Server", { horizontalLayout: "full" })));
    console.log('Usage: toyserver install cli:- To install the Toy CLI globally in user system');
}
exports.ToyLog = ToyLog;
/**
 * function to generate Hash key
 * @param socId : Socket ID
 * @param callback : Hash key return in callback
 */
function GenerateHashKey(socId, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const macId = yield node_machine_id_1.machineId();
        const timestamp = new Date().getTime();
        const socketId = socId;
        const hashKey = { macId, socketId, timestamp };
        const ciphertext = yield crypto_js_1.default.AES.encrypt(JSON.stringify(hashKey), 'ToyPlay123').toString();
        callback(ciphertext);
    });
}
exports.GenerateHashKey = GenerateHashKey;
function Login() {
    console.log(chalk_1.default.green("ToyPlay: Press any key to open up the browser to login or q to exit:"));
    var socket = io.connect('https://api.toy-boxpro.com', { reconnect: false });
    socket.on('connect', () => {
        GenerateHashKey(socket.id, (ciphertext) => {
            const loginPageUrl = LOGINURL + LOGIN + '?hashId=' + ciphertext;
            readline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.on('keypress', (str, key) => {
                key.name === 'q' ? process.exit() : open(loginPageUrl);
            });
        });
    });
    socket.on("AuthMsgFromToyPlay", function (loginUser) {
        const loginData = {
            isLoggedIn: true,
            loginUser: loginUser,
        };
        const LoggedInMessage = `You are now Logged In \n Username: ${chalk_1.default.green(loginData.loginUser.userLogin.name)} \n Email: ${chalk_1.default.green(loginData.loginUser.userLogin.email)}`;
        console.log(LoggedInMessage);
        fs_1.default.writeFileSync(filePath, JSON.stringify(loginData));
        downlaodCLI(loginData, socket, process);
    });
}
exports.Login = Login;
function IsFileExists(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return false;
    }
    else {
        return true;
    }
}
exports.IsFileExists = IsFileExists;
function downlaodCLI(loginData, socket, process) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Inside Try Block');
            const response = yield exports.httpClient({
                url: '/api/auth/cli/install',
                method: "POST",
                headers: {
                    Authorization: loginData.loginUser.token
                }
            });
            console.log(response.data.install);
            let command;
            if (osSystem === 'darwin') {
                command = `sudo npm install -g ${response.data.install}`;
            }
            else {
                command = `npm install -g ${response.data.install}`;
            }
            console.log(command);
            console.log('Installing the package for you. Please wait window will automatically close on completion');
            child_process.execSync(command, { stdio: [0, 1, 2] });
            socket.disconnect();
            process.exit();
        }
        catch (error) {
            console.log(chalk_1.default.red(error.message));
        }
    });
}
exports.downlaodCLI = downlaodCLI;
/**
* This method is used to invoke the command:-toy Login
* to allow the user to login into the ToyBox
*/
commander_1.default
    .command("install <cli>")
    .description("Install the CLI globally")
    .action(() => {
    Login();
});
commander_1.default.parse(process.argv);
//Code Implementation Ends Here
