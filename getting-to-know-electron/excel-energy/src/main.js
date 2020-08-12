const colors = require('colors');
const {app, browserWindow, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

console.log('Application running ...'.green);

// Electron-reload
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron.cmd')
    });
}

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        minWidth: 1200,
        minHeight: 600,
        width: 1200,
        height: 600,
        center: true,
        title: 'Energy Excel',
        autoHideMenuBar: true
    });

    mainWindow.setIcon(path.join(__dirname, '../assets/logo.png'));

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "../index.html"),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        mainWindow = null;
        app.quit();
    });
}

app.on('ready', async() => {
    await createWindow();
});