import { ipcMain, shell } from 'electron';
import path from 'path';
import dayjs from 'dayjs';
import { search, searchDetail, parseUrl } from './search';

const fse = require('fs-extra');
const dl = require('download-file-with-progressbar');

// 搜索图书
ipcMain.on('searchText', async (event, arg) => {
    console.log('arg', arg);
    try {
        const response = await search(arg);
        console.log('title', response);
        event.sender.send('searchResult', response);
    } catch (err) {
        console.error('error', err);
    }
});

// 查找图书格式及下载链接
ipcMain.on('searchDetail', async (event, arg) => {
    try {
        const response = await searchDetail(arg);
        console.log('searchDetail', response);
        event.sender.send('searchResultDetail', response);
    } catch (err) {
        console.error('error', err);
    }
});

// 获取网盘中图书的下载地址
ipcMain.on('parseBook', async (event, arg) => {
    try {
        const response = await parseUrl(arg);
        console.log('parseBook', response);
        event.sender.send('downloadInfo', response);
    } catch (err) {
        console.error('error', err);
    }
});

// 图书下载
ipcMain.on('downloadBookFile', async (event, arg) => {
    console.log('arg', arg);
    const { downurl: url, bookId, file_name: filename, file_size: filesize } = arg;
    const currentDay = dayjs().format('YYYY-MM-DD');
    const dirPath = path.join(__dirname, `../../download/`);
    const filePath = path.join(dirPath, currentDay);
    fse.ensureDirSync(filePath);

    // 下载配置项
    const option = {
        filename,
        dir: filePath,
        onDone: () => {
            // console.log('done', info);
            event.sender.send('downloadDone', {
                bookId,
                done: true,
                path: filePath
            });
        },
        onError: (err: any) => {
            console.log('error', err);
        },
        onProgress: (curr: number, total: number) => {
            const progress = ((curr / total) * 100).toFixed(2) + '%';
            event.sender.send('downloadProgress', {
                bookId,
                progress,
                filename,
                filesize: (filesize / 1024 / 1024).toFixed(2) + 'MB',
                dirPath,
            });
        },
    };
    dl(url, option);
});

// 打开文件所在位置
ipcMain.on('openFilePath', async (event, args) => {
    shell.openPath(args);
});
