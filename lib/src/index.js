#!/usr/bin/env node
"use strict";var __awaiter=this&&this.__awaiter||function(e,a,s,l){return new(s=s||Promise)(function(o,t){function n(e){try{i(l.next(e))}catch(e){t(e)}}function r(e){try{i(l.throw(e))}catch(e){t(e)}}function i(e){var t;e.done?o(e.value):((t=e.value)instanceof s?t:new s(function(e){e(t)})).then(n,r)}i((l=l.apply(e,a||[])).next())})},__generator=this&&this.__generator||function(o,n){var r,i,a,s={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]},e={next:t(0),throw:t(1),return:t(2)};return"function"==typeof Symbol&&(e[Symbol.iterator]=function(){return this}),e;function t(t){return function(e){return function(t){if(r)throw new TypeError("Generator is already executing.");for(;s;)try{if(r=1,i&&(a=2&t[0]?i.return:t[0]?i.throw||((a=i.return)&&a.call(i),0):i.next)&&!(a=a.call(i,t[1])).done)return a;switch(i=0,a&&(t=[2&t[0],a.value]),t[0]){case 0:case 1:a=t;break;case 4:return s.label++,{value:t[1],done:!1};case 5:s.label++,i=t[1],t=[0];continue;case 7:t=s.ops.pop(),s.trys.pop();continue;default:if(!(a=0<(a=s.trys).length&&a[a.length-1])&&(6===t[0]||2===t[0])){s=0;continue}if(3===t[0]&&(!a||t[1]>a[0]&&t[1]<a[3])){s.label=t[1];break}if(6===t[0]&&s.label<a[1]){s.label=a[1],a=t;break}if(a&&s.label<a[2]){s.label=a[2],s.ops.push(t);break}a[2]&&s.ops.pop(),s.trys.pop();continue}t=n.call(o,s)}catch(e){t=[6,e],i=0}finally{r=a=0}if(5&t[0])throw t[1];return{value:t[0]?t[1]:void 0,done:!0}}([t,e])}}},__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.IsFileExists=exports.Login=exports.GenerateHashKey=exports.downlaodCLI=exports.GetSubscription=exports.GetLoginData=exports.CMDLogin=exports.ToyLog=exports.httpClient=void 0;var node_machine_id_1=require("node-machine-id"),crypto_js_1=__importDefault(require("crypto-js")),commander_1=__importDefault(require("commander")),inquirer_1=__importDefault(require("inquirer")),figlet_1=__importDefault(require("figlet")),clear_1=__importDefault(require("clear")),chalk_1=__importDefault(require("chalk")),fs_1=__importDefault(require("fs")),child_process=require("child_process"),axios=require("axios").default,io=require("socket.io-client"),readline=require("readline"),open=require("open"),os=require("os"),filePath=os.homedir()+"/toyConfig.json",LOGINURL="https://play.toybox.dev",LOGIN="/login",osSystem=os.platform(),userNameQ=[{type:"input",name:"email",message:"email:"}],passwordQ=[{type:"password",name:"password",message:"password:"}];function ToyLog(){console.log(chalk_1.default.red(figlet_1.default.textSync("Toy-Server",{horizontalLayout:"full"}))),console.log("Usage: toyserver install cli:- To install the Toy CLI globally in user system")}function CMDLogin(){var t,o;inquirer_1.default.prompt(userNameQ).then(function(e){t=e.email,inquirer_1.default.prompt(passwordQ).then(function(e){o=e.password,GetLoginData(t,o)})})}function GetLoginData(r,i){return __awaiter(this,void 0,void 0,function(){var t,o,n;return __generator(this,function(e){switch(e.label){case 0:o={email:r,password:i},e.label=1;case 1:return e.trys.push([1,4,,5]),[4,exports.httpClient({url:"/toybox/signin",data:o,method:"POST"})];case 2:return[4,GetSubscription(t=e.sent())];case 3:return o=e.sent(),n={isLoggedIn:!0,loginUser:t.data,subscription:o.data},o="You are now Logged In \n Username: "+chalk_1.default.green(n.loginUser["custom:firstName"]+n.loginUser["custom:lastName"])+" \n Email: "+chalk_1.default.green(n.loginUser["cognito:username"]),console.log(o),fs_1.default.writeFileSync(filePath,JSON.stringify(n)),downlaodCLI(n),[3,5];case 4:return n=e.sent(),console.log(chalk_1.default.red(n.message)),[3,5];case 5:return[2]}})})}function GetSubscription(o){return __awaiter(this,void 0,void 0,function(){var t;return __generator(this,function(e){return t={id:o.data["cognito:username"]},[2,exports.httpClient({url:"/users/fetch",data:t,method:"POST",headers:{Authorization:"Bearer "+o.data.idToken}})]})})}function downlaodCLI(o,e,t){return __awaiter(this,void 0,void 0,function(){var t;return __generator(this,function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,exports.httpClient({url:"/auth/install",method:"POST",headers:{Authorization:o.loginUser.idToken}})];case 1:return t=e.sent(),t="darwin"===osSystem?"sudo npm install -g "+t.data.install:"npm install -g "+t.data.install,console.log("Installing the package for you. Please wait window will automatically close on completion"),child_process.execSync(t,{stdio:[0,1,2]}),[3,3];case 2:return e.sent(),console.log(chalk_1.default.red("Command Execution Failed. Please try agian....")),[3,3];case 3:return[2]}})})}function GenerateHashKey(n,r){return __awaiter(this,void 0,void 0,function(){var t,o;return __generator(this,function(e){switch(e.label){case 0:return[4,node_machine_id_1.machineId()];case 1:return t=e.sent(),o=(new Date).getTime(),o={macId:t,socketId:n,timestamp:o},[4,crypto_js_1.default.AES.encrypt(JSON.stringify(o),"ToyPlay123").toString()];case 2:return o=e.sent(),r(o),[2]}})})}function Login(){console.log(chalk_1.default.green("ToyPlay: Press any key to open up the browser to login or q to exit:"));var o=io.connect("https://apiserver.toybox.dev",{reconnect:!1});console.log(o),o.on("connect",function(){GenerateHashKey(o.id,function(e){var o=LOGINURL+LOGIN+"?hashId="+e;readline.emitKeypressEvents(process.stdin),process.stdin.setRawMode(!0),process.stdin.on("keypress",function(e,t){"q"===t.name?process.exit():open(o)})})}),o.on("AuthMsgFromToyPlay",function(e){var t={isLoggedIn:!0,loginUser:e},e="You are now Logged In \n Username: "+chalk_1.default.green(t.loginUser.userLogin.name)+" \n Email: "+chalk_1.default.green(t.loginUser.userLogin.email);console.log(e),fs_1.default.writeFileSync(filePath,JSON.stringify(t)),downlaodCLI(t,o,process)})}function IsFileExists(e){return!!fs_1.default.existsSync(e)}exports.httpClient=axios.create({baseURL:"https://dev-api.toybox.dev"}),void 0===process.argv[2]&&(clear_1.default(),ToyLog()),exports.ToyLog=ToyLog,exports.CMDLogin=CMDLogin,exports.GetLoginData=GetLoginData,exports.GetSubscription=GetSubscription,exports.downlaodCLI=downlaodCLI,exports.GenerateHashKey=GenerateHashKey,exports.Login=Login,exports.IsFileExists=IsFileExists,commander_1.default.command("install <cli>").description("Install the CLI globally").action(function(){CMDLogin()}),commander_1.default.parse(process.argv);