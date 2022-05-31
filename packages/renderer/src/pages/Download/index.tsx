import { FC, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Tabs } from 'antd';
import './indes.scss';

interface DownloadBookProps {
  id?: string;
  progress?: string;
  filename: string;
  filesize: string;
  filepath?: string;
  done?: boolean;
  dirPath: string;
}

const { TabPane } = Tabs;

const Download: FC = () => {
  const location: any = useLocation();
  const [books, setBooks] = useState<DownloadBookProps[]>([]);
  const bookList = useRef<DownloadBookProps[]>([]);

  useEffect(() => {
    console.log('location', location);
    // 监听页面跳转获取到的数据，给主进程发起下载通知
    if (location?.state && location?.state?.code === 200) {
      // 下载文件
      window.ipcRenderer.send('downloadBookFile', location?.state);
    }
  }, [location?.state]);

  useEffect(() => {
    // 监听下载进度
    window.ipcRenderer.on('downloadProgress', (event, args: any) => {
      console.log('args', args.progress);
      let allBook: any = [].concat(books as any);
      const filter = allBook.filter((book: DownloadBookProps) => book.id !== args.bookId);
      if (!filter.length) {
        allBook.push({
          id: args.bookId,
          progress: args.progress,
          filename: args.filename,
          filesize: args.filesize,
          done: false,
        });
      }
      bookList.current = allBook;
      setBooks(allBook);
    });

    return () => {
      window.ipcRenderer.removeAllListeners('downloadProgress');
    };
  }, []);

  useEffect(() => {
    // 监听文件是否下载完毕
    window.ipcRenderer.on('downloadDone', (event, args) => {
      let allBook: any = [].concat(bookList.current as any);
      // console.log('allBook', allBook);
      allBook.map((book: any) => {
        if (book.id === args.bookId) {
          book.done = true;
          book.dirPath = args.path;
        }
        return book;
      });
      // console.log('allBook', allBook);
      setBooks(allBook);
    });

    return () => {
      window.ipcRenderer.removeAllListeners('downloadDone');
    };
  }, []);

  // 查看文件位置
  const hanldeViewFile = (path: string) => {
    console.log('文件地址', path);
    window.ipcRenderer.send('openFilePath', path);
  }

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="正在下载" key="1">
        <div className="download-ing">
          {books.length ? (books || []).map(book => (
            <div className='download-item' key={book.id}>
              <div className="progress">
                <div className="progress-item" style={{ width: book.progress }} />
              </div>
              <div className="download-status">
                <div className="status-left">
                  <p className='name'>{book.filename}</p>
                  <p className="size">{book.filesize}</p>
                </div>
                <div className="status-right">
                  {book.done ? <Button type='link' onClick={() => hanldeViewFile(book.dirPath)}>查看文件</Button> : book.progress}
                </div>
              </div>
            </div>
          )) : '暂无下载任务'}
        </div>
      </TabPane>
      <TabPane tab="下载完成" key="2">
        Content of Tab Pane 2
      </TabPane>
    </Tabs>
  )
}

export default Download