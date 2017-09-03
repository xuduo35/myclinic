import React, { Component } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'react-router';
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

class SiderCustom extends Component {
    state = {
        collapsed: false,
        mode: 'inline',
        openKey: '',
        selectedKey: ''
    };
    componentDidMount() {
        this.setMenuOpen(this.props);
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        this.onCollapse(nextProps.collapsed);
        this.setMenuOpen(nextProps)
    }
    setMenuOpen = props => {
        const {path} = props;
        this.setState({
            openKey: path.substr(0, path.lastIndexOf('/')),
            selectedKey: path
        });
    };
    onCollapse = (collapsed) => {
        console.log(collapsed);
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline',
        });
    };
    menuClick = e => {
        this.setState({
            selectedKey: e.key
        });
        console.log(this.state);

    };
    openMenu = v => {
        console.log(v);
        this.setState({
            openKey: v[v.length - 1]
        })
    };
    render() {
        return (
            <Sider
                trigger={null}
                breakpoint="lg"
                collapsed={this.props.collapsed}
                style={{overflowY: 'auto', marginBottom: -9999}}>
                <div className="logo" />
                <Menu
                    onClick={this.menuClick}
                    theme="dark"
                    mode={this.state.mode}
                    selectedKeys={[this.state.selectedKey]}
                    openKeys={[this.state.openKey]}
                    onOpenChange={this.openMenu}>
                    <Menu.Item key="/app/dashboard/index">
                        <Link to={'/app/dashboard/index'}><Icon type="mobile" /><span className="nav-text">首页</span></Link>
                    </Menu.Item>
                    <SubMenu
                        key="/app/case"
                        title={<span><Icon type="bars" /><span className="nav-text">病例</span></span>}>
                        <Menu.Item key="/app/case/list"><Link to={'/app/case/list'}>总览</Link></Menu.Item>
                        <Menu.Item key="/app/case/history"><Link to={'/app/case/history'}>病程</Link></Menu.Item>
                        <Menu.Item key="/app/case/new"><Link to={'/app/case/new'}>新建</Link></Menu.Item>
                        <Menu.Item key="/app/case/fetchlist"><Link to={'/app/case/fetchlist'}>取药</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu
                        key="/app/medicine"
                        title={<span><Icon type="medicine-box" /><span className="nav-text">药品</span></span>}>
                        <Menu.Item key="/app/medicine/list"><Link to={'/app/medicine/list'}>药品管理</Link></Menu.Item>
                        <Menu.Item key="/app/medicine/inlist"><Link to={'/app/medicine/inlist'}>进药记录</Link></Menu.Item>
                        <Menu.Item key="/app/medicine/outlist"><Link to={'/app/medicine/outlist'}>开药记录</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu
                        key="/app/prescribe"
                        title={<span><Icon type="file-text" /><span className="nav-text">处方</span></span>}>
                        <Menu.Item key="/app/prescribe/list"><Link to={'/app/prescribe/list'}>处方管理</Link></Menu.Item>
                    </SubMenu>
                </Menu>
                <style>
                    {`
                    #nprogress .spinner{
                        left: ${this.state.collapsed ? '70px' : '206px'};
                        right: 0 !important;
                    }
                    `}
                </style>
            </Sider>
        )
    }
}

export default SiderCustom;