import {
    CheckCircle as CheckCircleIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Menu as MenuIcon,
    People as PeopleIcon,
    Restaurant as RestaurantIcon,
    ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Estoque', icon: <InventoryIcon />, path: '/estoque' },
        { text: 'Funcionários', icon: <PeopleIcon />, path: '/funcionarios' },
        { text: 'Pratos do Dia', icon: <RestaurantIcon />, path: '/pratos' },
        { text: 'Check-in', icon: <CheckCircleIcon />, path: '/checkin' },
        { text: 'Lista de Compras', icon: <ShoppingCartIcon />, path: '/lista-compras' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Controle Cozinha
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => {
                    const isSelected = location.pathname === item.path;
                    return (
                        <ListItem
                            key={item.text}
                            onClick={() => handleMenuClick(item.path)}
                            sx={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                                color: isSelected ? 'white' : 'inherit',
                                '&:hover': {
                                    backgroundColor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isSelected ? 'white' : 'inherit',
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - 250px)` },
                    ml: { md: '250px' },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Controle de Cozinha IBFT
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: 250 }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 250,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 250,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - 250px)` },
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
