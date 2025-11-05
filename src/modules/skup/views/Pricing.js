import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Snackbar, Alert, TablePagination, TableSortLabel, TableContainer, Paper } from '@mui/material';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import PriceFormDialog from '../components/PriceFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const Pricing = () => {
  const [rows, setRows] = useState([]);
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('valid_from');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const emitRefresh = () => window.dispatchEvent(new Event('skup:refresh'));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [prices, grs] = await Promise.all([
        window.electronAPI.dbGetAll('skup_prices', 'valid_from'),
        window.electronAPI.dbGetAll('skup_grains', 'name')
      ]);
      setRows(prices.reverse());
      setGrains(grs);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      setSnack({ open: true, message: 'Błąd ładowania danych', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onAdd = () => { setEditingRow(null); setDialogOpen(true); };
  const onEdit = (row) => { setEditingRow(row); setDialogOpen(true); };
  const requestDelete = (row) => { setRowToDelete(row); setConfirmOpen(true); };

  const onDeleteConfirmed = useCallback(async () => {
    try {
      if (rowToDelete) {
        await window.electronAPI.dbDelete('skup_prices', rowToDelete.id);
        setSnack({ open: true, message: 'Usunięto cenę', severity: 'success' });
        emitRefresh();
        await load();
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      setSnack({ open: true, message: 'Błąd usuwania', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setRowToDelete(null);
    }
  }, [rowToDelete, load]);

  const handleSubmit = useCallback(async (payload) => {
    try {
      if (editingRow) {
        await window.electronAPI.dbUpdate('skup_prices', editingRow.id, payload);
        setSnack({ open: true, message: 'Zapisano zmiany', severity: 'success' });
      } else {
        await window.electronAPI.dbInsert('skup_prices', payload);
        setSnack({ open: true, message: 'Dodano cenę', severity: 'success' });
      }
      setDialogOpen(false);
      emitRefresh();
      await load();
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      setSnack({ open: true, message: 'Błąd zapisu', severity: 'error' });
    }
  }, [editingRow, load]);

  const grainNameMap = useMemo(() => Object.fromEntries(grains.map(g => [g.id, g.name])), [grains]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return rows.filter(r =>
      String(r.id).includes(q) ||
      (grainNameMap[r.grain_id] || '').toLowerCase().includes(q) ||
      (r.currency || '').toLowerCase().includes(q)
    );
  }, [rows, filter, grainNameMap]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      let av = a[orderBy];
      let bv = b[orderBy];
      if (av == null) av = '';
      if (bv == null) bv = '';
      if (av < bv) return order === 'asc' ? -1 : 1;
      if (av > bv) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [filtered, order, orderBy]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleSort = (property) => () => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Cenniki
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Szukaj..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button variant="contained" startIcon={<FaPlus />} onClick={onAdd} disabled={loading}>Dodaj</Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9' } }}>
              <TableCell sortDirection={orderBy === 'id' ? order : false}>
                <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={handleSort('id')}>ID</TableSortLabel>
              </TableCell>
              <TableCell>Zboże</TableCell>
              <TableCell sortDirection={orderBy === 'valid_from' ? order : false}>
                <TableSortLabel active={orderBy === 'valid_from'} direction={orderBy === 'valid_from' ? order : 'asc'} onClick={handleSort('valid_from')}>Ważne od</TableSortLabel>
              </TableCell>
              <TableCell>Ważne do</TableCell>
              <TableCell sortDirection={orderBy === 'price_per_unit' ? order : false}>
                <TableSortLabel active={orderBy === 'price_per_unit'} direction={orderBy === 'price_per_unit' ? order : 'asc'} onClick={handleSort('price_per_unit')}>Cena</TableSortLabel>
              </TableCell>
              <TableCell>Waluta</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{grainNameMap[r.grain_id] || r.grain_id}</TableCell>
                <TableCell>{r.valid_from}</TableCell>
                <TableCell>{r.valid_to || '-'}</TableCell>
                <TableCell>{r.price_per_unit}</TableCell>
                <TableCell>{r.currency}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(r)}><FaEdit /></IconButton>
                  <IconButton size="small" onClick={() => requestDelete(r)} sx={{ ml: 1 }}><FaTrash /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <PriceFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRow}
        grains={grains}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDeleteConfirmed}
        title="Usuń cenę"
        content={rowToDelete ? `Czy na pewno usunąć cenę ID ${rowToDelete.id}?` : ''}
        confirmText="Usuń"
      />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Pricing;
