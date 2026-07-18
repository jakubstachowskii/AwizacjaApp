import React, { useContext, useState } from 'react';
import {
  Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Box, useMediaQuery, useTheme
} from '@mui/material';
import { FaThLarge, FaChevronDown } from 'react-icons/fa';
import { AppContext } from '../../App';
import { MODULE_LIST } from '../../theme/designTokens';

export default function ModuleSwitcher({ currentModuleId }) {
  const { setCurrentView } = useContext(AppContext) || {};
  const [anchor, setAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = (view) => {
    setCurrentView?.(view);
    setAnchor(null);
  };

  const trigger = isMobile ? (
    <IconButton
      onClick={(e) => setAnchor(e.currentTarget)}
      aria-label="Przełącz moduł"
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, color: 'text.secondary' }}
    >
      <FaThLarge size={14} />
    </IconButton>
  ) : (
    <Button
      variant="outlined"
      size="small"
      onClick={(e) => setAnchor(e.currentTarget)}
      startIcon={<FaThLarge size={11} />}
      endIcon={<FaChevronDown size={10} />}
      sx={{
        textTransform: 'none',
        borderColor: 'divider',
        color: 'text.primary',
        fontWeight: 600,
        fontSize: '0.8125rem',
        px: 1.5,
        py: 0.75,
        bgcolor: 'background.paper',
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' }
      }}
    >
      Moduły
    </Button>
  );

  return (
    <>
      {trigger}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            minWidth: { xs: 'min(100vw - 32px, 320px)', sm: 280 },
            maxWidth: '100vw',
            mt: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
            PRZEŁĄCZ MODUŁ
          </Typography>
        </Box>
        {MODULE_LIST.map((m) => {
          const Icon = m.icon;
          const selected = m.id === currentModuleId;
          return (
            <MenuItem
              key={m.id}
              selected={selected}
              onClick={() => navigate(m.view)}
              sx={{
                py: 1.25,
                '&.Mui-selected': {
                  bgcolor: m.accentSoft || `${m.accent}0c`,
                  '&:hover': { bgcolor: m.accentSoft || `${m.accent}14` }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: m.accentSoft || `${m.accent}12`,
                    color: m.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={13} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={m.title}
                secondary={m.subtitle}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 600, fontSize: '0.875rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          );
        })}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => navigate('splash')} sx={{ py: 1 }}>
          <ListItemText
            primary="Ekran startowy"
            secondary="Wybór modułu"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
