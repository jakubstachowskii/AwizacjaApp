import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography,
  IconButton, FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { compactEmptyRowSx } from '../../../theme/designTokens';

const emptyItem = () => ({ product_id: '', quantity: '', unit_price: '', unit: 't' });

export default function OrdersView() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [form, setForm] = useState({
    order_number: '',
    customer_id: '',
    order_date: new Date().toISOString().slice(0, 10),
    status: 'nowe',
    notes: ''
  });
  const [items, setItems] = useState([emptyItem()]);

  const load = useCallback(async () => {
    const [o, c, p, allItems] = await Promise.all([
      window.electronAPI.dbGetAll('sales_orders', 'order_date'),
      window.electronAPI.dbGetAll('sales_customers', 'name'),
      window.electronAPI.dbGetAll('sales_products', 'name'),
      window.electronAPI.dbGetAll('sales_order_items', 'id')
    ]);
    setRows(o || []);
    setCustomers(c || []);
    setProducts(p || []);
    const counts = {};
    for (const it of allItems || []) {
      counts[it.order_id] = (counts[it.order_id] || 0) + 1;
    }
    setItemCounts(counts);
  }, []);

  useEffect(() => { load(); }, [load]);

  const orderTotal = useMemo(() => items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unit_price) || 0;
    return sum + q * p;
  }, 0), [items]);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => setItems((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const resetForm = () => {
    setForm({
      order_number: '',
      customer_id: '',
      order_date: new Date().toISOString().slice(0, 10),
      status: 'nowe',
      notes: ''
    });
    setItems([emptyItem()]);
  };

  const save = async () => {
    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0 && Number(it.unit_price) >= 0);
    if (!form.order_number || !form.customer_id) return;

    const orderResult = await window.electronAPI.dbInsert('sales_orders', {
      ...form,
      customer_id: Number(form.customer_id),
      total_amount: validItems.reduce((s, it) => s + Number(it.quantity) * Number(it.unit_price), 0)
    });

    const orderId = orderResult?.id;
    if (orderId) {
      for (const it of validItems) {
        const qty = Number(it.quantity);
        const price = Number(it.unit_price);
        await window.electronAPI.dbInsert('sales_order_items', {
          order_id: orderId,
          product_id: Number(it.product_id),
          quantity: qty,
          unit: it.unit || 't',
          unit_price: price,
          total_price: qty * price
        });
      }
    }

    setOpen(false);
    resetForm();
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  const requestDelete = (order) => {
    setOrderToDelete(order);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    await window.electronAPI.dbDelete('sales_orders', orderToDelete.id);
    setConfirmOpen(false);
    setOrderToDelete(null);
    load();
    window.dispatchEvent(new Event('sales:refresh'));
  };

  return (
    <Box>
      <PageHeader
        title="Zamówienia"
        subtitle="Rejestr zamówień sprzedażowych z pozycjami"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowe zamówienie</Button>}
      />
      <DataPanel>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Numer</TableCell>
              <TableCell>Klient</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Pozycji</TableCell>
              <TableCell align="right">Kwota</TableCell>
              <TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={7}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak zamówień.</Typography></TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.order_number}</TableCell>
                <TableCell>{customers.find((c) => c.id === r.customer_id)?.name || r.customer_id}</TableCell>
                <TableCell>{r.order_date}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">{itemCounts[r.id] || 0}</TableCell>
                <TableCell align="right">{Number(r.total_amount || 0).toFixed(2)} PLN</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => requestDelete(r)}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowe zamówienie</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Numer zamówienia" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small"><InputLabel>Klient</InputLabel>
                <Select value={form.customer_id} label="Klient" onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" type="date" label="Data" InputLabelProps={{ shrink: true }} value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} size="small" label="Notatki" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pozycje zamówienia</Typography>
            <Button size="small" startIcon={<FaPlus />} onClick={addItem}>Dodaj pozycję</Button>
          </Box>

          {products.length === 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
              Brak produktów w bazie — dodaj je w tabeli sales_products lub przez import danych startowych.
            </Typography>
          )}

          {items.map((it, idx) => (
            <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small"><InputLabel>Produkt</InputLabel>
                  <Select value={it.product_id} label="Produkt" onChange={(e) => updateItem(idx, 'product_id', e.target.value)}>
                    {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField fullWidth size="small" type="number" label="Ilość" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField fullWidth size="small" type="number" label="Cena/j." value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} />
              </Grid>
              <Grid item xs={3} sm={2}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {(Number(it.quantity || 0) * Number(it.unit_price || 0)).toFixed(2)} PLN
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <IconButton size="small" color="error" onClick={() => removeItem(idx)}><FaTrash size={14} /></IconButton>
              </Grid>
            </Grid>
          ))}

          <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'right', mt: 2 }}>
            Razem: {orderTotal.toFixed(2)} PLN
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Anuluj</Button>
          <Button variant="contained" onClick={save} disabled={!form.order_number || !form.customer_id}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setOrderToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń zamówienie"
        message={orderToDelete ? `Czy na pewno usunąć zamówienie "${orderToDelete.order_number}"?` : ''}
        confirmText="Usuń"
      />
    </Box>
  );
}
