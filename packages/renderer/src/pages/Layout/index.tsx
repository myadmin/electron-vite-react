import React, { memo, useEffect, useMemo, useState } from 'react';
import { Layout, Menu, MenuProps } from 'antd';
import { matchRoutes, Outlet, useLocation, NavLink } from 'react-router-dom';
import router from '@/router';
import './index.scss';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const LayoutPage = () => {
  const [defaultSelectedKeys, setSelectKey] = useState<string[]>(['1']);
  const [defaultOpenKeys, setDefaultOpenKeys] = useState<string[]>(['1']);
  const [initial, setInitial] = useState(false);
  const location = useLocation();

  const items: MenuItem[] = useMemo(() => {
    return router && (router[0]?.children || []).map((item) => {
      return getItem(<NavLink className={({ isActive }) => isActive ? 'ant-menu-item-selected' : ''} to={item.path as string}>{item.title}</NavLink>, item.path as string, item.icon)
    });
  }, []);

  useEffect(() => {
    const routes = matchRoutes(router, { pathname: location.pathname });
    console.log('routes', routes, location.pathname);
    const pathArr: string[] = [];
    if (routes && routes.length) {
      routes.forEach(item => {
        const path = item.route.path;
        if (path === location.pathname) {
          pathArr.push(path);
        }
      });
    }
    setSelectKey(pathArr);
    setDefaultOpenKeys(pathArr);
    setInitial(true);
  }, [location]);

  if (!initial) {
    return null;
  }

  return (
    <Layout>
      <Layout>
        <Sider width={240} className="site-layout-background">
          <Menu
            defaultSelectedKeys={defaultSelectedKeys}
            defaultOpenKeys={defaultOpenKeys}
            selectedKeys={defaultSelectedKeys}
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default memo(LayoutPage);