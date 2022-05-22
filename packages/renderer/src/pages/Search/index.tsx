import React, { useEffect, useRef, useState } from 'react';
import { Input, Row, Col, Table, Button } from 'antd';
import { useToggle } from 'ahooks';
import Modal from './components/Modal';
import columns from './columns';

const Search = () => {
  const [value, setValue] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setToalaPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, { setLeft, setRight }] = useToggle();

  // 点击下载
  const handleClickDownload = (recordData: any) => {
    window.ipcRenderer.send('searchDetail', recordData.link);
    setRight();
  };

  // 监听输入框内容发生改变
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
  }

  // 点击翻页
  const handleChangePage = (pagination: any) => {
    setLoading(true);
    setCurrentPage(pagination.current);
    window.ipcRenderer.send('searchText', { value, currentPage: pagination.current });
  };

  // 点击搜索
  const handleSearch = () => {
    setLoading(true);
    setCurrentPage(1);
    window.ipcRenderer.send('searchText', { value, currentPage });
  };

  useEffect(() => {
    // 返回搜索结果
    window.ipcRenderer.on('searchResult', (event, args) => {
      // console.log('args', args);
      setDataSource(args.data);
      setToalaPage(args.page);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Row gutter={12}>
        <Col span={24}>
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 90px)' }}
              value={value}
              placeholder='输入书名进行查询'
              onChange={handleChange}
              onPressEnter={handleSearch}
              allowClear
            />
            <Button
              type="primary"
              loading={loading}
              onClick={handleSearch}
              style={{ width: '91px' }}
            >
              搜索
            </Button>
          </Input.Group>
        </Col>
        <Col span={24} style={{ marginTop: '10px' }}>
          <Table
            rowKey={'link'}
            columns={columns({ handleClickDownload })}
            size="middle"
            dataSource={dataSource}
            onChange={handleChangePage}
            loading={loading}
            pagination={{
              size: 'default',
              pageSize: 10,
              current: currentPage,
              total: totalPage,
              showTotal: (total: number) => `总共 ${total} 本书`,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
          />
        </Col>
      </Row>
      <Modal
        visible={visible}
        handleOk={() => { }}
        handleCancel={setLeft}
      />
    </>
  )
}

export default Search;