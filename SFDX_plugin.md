local-dev-tools
===============

local development and testing of lightning web components

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g local-dev-tools
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
local-dev-tools/1.0.0 darwin-x64 node-v10.15.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* `sfdx force:lightning:lwc:start [--open <lwc file name>] [--port <integer>] [--stop] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal]`

```
USAGE
  $ sfdx force:lightning:lwc:start [--open <lwc file name>] [--port <integer>] [--stop] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal]

OPTIONS
  -s, --stop                                       stop the running dev server
  -o, --open=LWC file name                         LWC file to open
  -p, --port=port number                           set the port for the dev server (defaults to 8080)
  -u, --targetusername=targetusername              username or alias for the target org; overrides default target org
  -v, --targetdevhubusername=targetdevhubusername  username or alias for the dev hub org; overrides default dev hub org
  --apiversion=apiversion                          override the api version used for api requests made by this command
  --json                                           format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)   [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx force:lightning:lwc:start -o myLWCexample
     <browser window will launch to myLWCexample>
  
  $ sfdx force:lightning:lwc:start -s
     Stopping dev server on port 8080
```

<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `force:lightning:lwc:start` command:
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx force:lightning:lwc:start --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run force:lightning:lwc:start
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
