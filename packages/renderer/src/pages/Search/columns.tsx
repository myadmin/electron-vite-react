interface TableColumnsProps {
  handleClickDownload: (record: any) => void;
}

const TableColumns = ({ handleClickDownload }: TableColumnsProps) => {
  const columns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: any) => (
        <a onClick={() => handleClickDownload(record)}>选择下载格式</a>
      ),
    },
  ];

  return columns;
}

export default TableColumns;