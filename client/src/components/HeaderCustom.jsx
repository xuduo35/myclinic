import React, { Component } from 'react';
import { Menu, Icon, Layout, Badge, message } from 'antd';
import { hashHistory } from 'react-router';
import screenfull from 'screenfull';
import axios from 'axios';
import { queryString } from '../utils';
const { Header } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class HeaderCustom extends Component {
    state = {
        user: null
    };
    componentDidMount() {
        var self = this;

        axios.post('/api/user/profile', {})
        .then(function (response) {
            var msg = response.data.msg;

            if (response.data.status != 0) {
                // 重定向到登录界面
                hashHistory.replace({ pathname: '/login' });
                return;
            }

            self.setState({
              user: msg,
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    };
    screenFull = () => {
        if (screenfull.enabled) {
            screenfull.request();
        }

    };
    menuClick = e => {
        console.log(e);
        e.key === 'logout' && this.logout();
    };
    logout = () => {
        localStorage.removeItem('user');
        this.props.router.push('/login')
    };
    render() {
        if (!this.state.user) {
            return (
                <div />
                );
        }

        return (
            <Header style={{ background: '#fff', padding: 0, height: 65 }} className="custom-theme" >
                <Icon
                    className="trigger custom-trigger"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.props.toggle}/>
                <Menu
                    mode="horizontal"
                    style={{ lineHeight: '64px', float: 'right' }}
                    onClick={this.menuClick}>
                    <Menu.Item key="full" onClick={this.screenFull} >
                        <Icon type="arrows-alt" onClick={this.screenFull} />
                    </Menu.Item>
                    <Menu.Item key="notinum">
                    {
                        this.state.user.notinum > 0 ?
                            <Badge dot style={{marginLeft: 10}}>
                                <Icon type="notification" />
                            </Badge>
                        :
                            <Icon type="notification" />
                    }
                    </Menu.Item>
                    <SubMenu title={<span className="avatar"><img style={{width:'40px',height:'40px',borderRadius:'40px'}} src={this.state.user.avatar} alt="头像" /><i className="on bottom b-white" /></span>}>
                        <MenuItemGroup title="用户中心">
                            <Menu.Item key="setting:1">你好 - {this.state.user.name}</Menu.Item>
                            <Menu.Item key="setting:2"><a href='#/app/personal/setting'>个人信息</a></Menu.Item>
                            <Menu.Item key="logout"><span onClick={this.logout}>退出登录</span></Menu.Item>
                        </MenuItemGroup>
                    </SubMenu>
                </Menu>
                <style>{`
                    .ant-menu-submenu-horizontal > .ant-menu {
                        width: 120px;
                        left: -40px;
                    }
                `}</style>
            </Header>
        )
    }
}

export default HeaderCustom;