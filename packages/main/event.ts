import { ipcMain } from 'electron';
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

// 新开一个隐形的窗口，并进行图书下载
ipcMain.on('downloadBookFile', async (event, arg) => {
    // console.log('arg', arg);
    const {
        downurl: url,
        bookId,
        file_name: filename,
        file_size: filesize,
    } = arg;
    const currentDay = dayjs().format('YYYY-MM-DD');
    const filePath = path.join(__dirname, `../../download/`, currentDay);
    fse.ensureDirSync(filePath);

    // TODO
    // 应该根据不同的bookId新建隐藏的窗口进行下载，不会互相影响

    // 下载配置项
    const option = {
        filename,
        dir: filePath,
        onDone: (info: any) => {
            // console.log('done', info);
            event.sender.send('downloadDone', {
                bookId,
                done: true,
                path: info.path,
            });
        },
        onError: (err: any) => {
            console.log('error', err);
        },
        onProgress: (curr: number, total: number) => {
            // console.log('progress', ((curr / total) * 100).toFixed(2) + '%');
            const progress = ((curr / total) * 100).toFixed(2) + '%';
            event.sender.send('downloadProgress', {
                bookId,
                progress,
                filename,
                filesize,
            });
        },
    };
    dl(url, option);
});
