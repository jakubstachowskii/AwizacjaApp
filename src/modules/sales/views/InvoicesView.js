import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography,
  IconButton, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';

import ConfirmDialog from '../../../components/ConfirmDialog';
import { compactEmptyRowSx } from '../../../theme/designTokens';

export default function InvoicesView() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [form, setForm] = useState({
    invoice_number: '', customer_id: '', invoice_date: new Date().toISOString().slice(0, 10),
    due_date: new Date().toISOString().slice(0, 10), net_amount: 0, vat_rate: 23, status: 'wystawiona'
  });

  const load = useCallback(async () => {
    setRows(await window.electronAPI.dbGetAll('sales_invoices', 'invoice_date') || []);
    setCustomers(await window.electronAPI.dbGetAll('sales_customers', 'name') || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.invoice_number || !form.customer_id) return;
    const net = Number(form.net_amount) || 0;
    const vat = Number(form.vat_rate) || 23;
    const vatAmount = net * vat / 100;
    await window.electronAPI.dbInsert('sales_invoices', {
      ...form,
      customer_id: Number(form.customer_id),
      net_amount: net,
      vat_amount: vatAmount,
      gross_amount: net + vatAmount
    });
    setOpen(false);
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    await window.electronAPI.dbDelete('sales_invoices', rowToDelete.id);
    setConfirmOpen(false);
    setRowToDelete(null);
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  return (
    <Box>
      <PageHeader
        title="Faktury"
        subtitle="Wystawione dokumenty sprzedażowe"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowa faktura</Button>}
      />
      <DataPanel>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Numer</TableCell><TableCell>Klient</TableCell><TableCell>Data</TableCell><TableCell>Brutto</TableCell><TableCell>Status</TableCell><TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak faktur.</Typography></TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.invoice_number}</TableCell>
                <TableCell>{customers.find((c) => c.id === r.customer_id)?.name || r.customer_id}</TableCell>
                <TableCell>{r.invoice_date}</TableCell>
                <TableCell>{r.gross_amount}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => { setRowToDelete(r); setConfirmOpen(true); }}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowa faktura</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Numer FV" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small"><InputLabel>Klient</InputLabel>
                <Select value={form.customer_id} label="Klient" onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="date" label="Data FV" InputLabelProps={{ shrink: true }} value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="date" label="Termin płatności" InputLabelProps={{ shrink: true }} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="number" label="Kwota netto" value={form.net_amount} onChange={(e) => setForm({ ...form, net_amount: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="number" label="VAT %" value={form.vat_rate} onChange={(e) => setForm({ ...form, vat_rate: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save} disabled={!form.invoice_number || !form.customer_id}>Zapisz</Button></DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setRowToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń fakturę"
        message={rowToDelete ? `Czy na pewno usunąć fakturę "${rowToDelete.invoice_number}"?` : ''}
        confirmText="Usuń"
      />
    </Box>
  );
}
