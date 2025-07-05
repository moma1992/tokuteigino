import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  School, 
  AccountCircle,
  Logout,
  Settings
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, profile, isAuthenticated, logout } = useAuthStore();

  const menuItems = [
    { text: 'ホーム', path: '/' },
    { text: '学習', path: '/study' },
    { text: '練習', path: '/practice' },
    { text: 'プロフィール', path: '/profile' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        TOKUTEI Learning
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} component={Link} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <School sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            TOKUTEI Learning
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            特定技能試験学習支援アプリ
          </Typography>
          
          {/* Authentication Section */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {profile?.full_name || user?.email}
                </Typography>
              )}
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                size="small"
              >
                <Avatar
                  src={profile?.avatar_url}
                  sx={{ width: 32, height: 32 }}
                >
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                variant="outlined"
                sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
              >
                ログイン
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/signup"
                variant="contained"
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
              >
                新規登録
              </Button>
            </Box>
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <Avatar>
            <Settings fontSize="small" />
          </Avatar>
          プロフィール設定
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Avatar>
            <Logout fontSize="small" />
          </Avatar>
          ログアウト
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;