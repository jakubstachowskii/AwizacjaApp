import React, { useCallback, useEffect, useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, IconButton, Box, Typography
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { compactEmptyRowSx } from '../../../theme/designTokens';

const FIELDS = [
  { name: 'name', label: 'Nazwa firmy / osoby' },
  { name: 'nip', label: 'NIP' },
  { name: 'phone', label: 'Telefon' },
  { name: 'email', label: 'E-mail' },
  { name: 'address', label: 'Adres' },
  { name: 'type', label: 'Typ (firma/rolnik)' }
];

export default function CustomersView() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [form, setForm] = useState({ name: '', nip: '', phone: '', email: '', address: '', type: 'firma' });

  const load = useCallback(async () => setRows(await window.electronAPI.dbGetAll('sales_customers', 'name') || []), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name?.trim()) return;
    await window.electronAPI.dbInsert('sales_customers', form);
    setOpen(false);
    setForm({ name: '', nip: '', phone: '', email: '', address: '', type: 'firma' });
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    await window.electronAPI.dbDelete('sales_customers', rowToDelete.id);
    setConfirmOpen(false);
    setRowToDelete(null);
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  return (
    <Box>
      <PageHeader
        title="Klienci"
        subtitle="Baza odbiorców i kontrahentów sprzedażowych"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowy klient</Button>}
      />
      <DataPanel>
        <Table size="small" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>NIP</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Telefon</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak klientów — dodaj pierwszego rekord.</Typography></TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.nip || '—'}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{r.phone || '—'}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => { setRowToDelete(r); setConfirmOpen(true); }}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowy klient</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {FIELDS.map((f) => (
              <Grid item xs={12} sm={6} key={f.name}>
                <TextField fullWidth size="small" label={f.label} value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save} disabled={!form.name?.trim()}>Zapisz</Button></DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setRowToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń klienta"
        message={rowToDelete ? `Czy na pewno usunąć klienta "${rowToDelete.name}"?` : ''}
        confirmText="Usuń"
      />
    </Box>
  );
}
