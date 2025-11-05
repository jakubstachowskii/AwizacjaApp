import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TablePagination, TextField, Snackbar, Alert, TableSortLabel, TableContainer, Paper } from '@mui/material';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import IntakeFormDialog from '../components/IntakeFormDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import ScaleWidget from '../components/ScaleWidget';

const Intakes = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [grains, setGrains] = useState([]);

  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('intake_datetime');
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
      const [data, cts, grs] = await Promise.all([
        window.electronAPI.dbGetAll('skup_intakes', 'intake_datetime'),
        window.electronAPI.dbGetAll('skup_contractors', 'name'),
        window.electronAPI.dbGetAll('skup_grains', 'name')
      ]);
      setRows(data.reverse());
      setContractors(cts);
      setGrains(grs);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      setSnack({ open: true, message: 'Błąd ładowania danych', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = useCallback(() => {
    setEditingRow(null);
    setDialogOpen(true);
  }, []);

  const onEdit = useCallback((row) => {
    setEditingRow(row);
    setDialogOpen(true);
  }, []);

  const requestDelete = useCallback((row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  }, []);

  const onDeleteConfirmed = useCallback(async () => {
    try {
      if (rowToDelete) {
        await window.electronAPI.dbDelete('skup_intakes', rowToDelete.id);
        setSnack({ open: true, message: 'Usunięto przyjęcie', severity: 'success' });
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
        await window.electronAPI.dbUpdate('skup_intakes', editingRow.id, payload);
        setSnack({ open: true, message: 'Zapisano zmiany', severity: 'success' });
      } else {
        await window.electronAPI.dbInsert('skup_intakes', payload);
        setSnack({ open: true, message: 'Dodano przyjęcie', severity: 'success' });
      }
      setDialogOpen(false);
      emitRefresh();
      await load();
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      setSnack({ open: true, message: 'Błąd zapisu', severity: 'error' });
    }
  }, [editingRow, load]);

  const contractorNameMap = useMemo(() => Object.fromEntries(contractors.map(c => [c.id, c.name])), [contractors]);
  const grainNameMap = useMemo(() => Object.fromEntries(grains.map(g => [g.id, g.name])), [grains]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return rows.filter(r =>
      String(r.id).includes(q) ||
      (r.document_number || '').toLowerCase().includes(q) ||
      (contractorNameMap[r.contractor_id] || '').toLowerCase().includes(q) ||
      (grainNameMap[r.grain_id] || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  }, [rows, filter, contractorNameMap, grainNameMap]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      let av = a[orderBy];
      let bv = b[orderBy];
      if (av == null) av = '';
      if (bv == null) bv = '';
      if (typeof av === 'string') av = av.toString();
      if (typeof bv === 'string') bv = bv.toString();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Przyjęcia
        </Typography>
        <Button variant="contained" startIcon={<FaPlus />} onClick={onAdd}>
          Dodaj przyjęcie
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <ScaleWidget />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Szukaj..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 900, md: 'auto' }
          }
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9' } }}>
              <TableCell sortDirection={orderBy === 'id' ? order : false} sx={{ minWidth: 60 }}>
                <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={handleSort('id')}>ID</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'intake_datetime' ? order : false} sx={{ minWidth: 120 }}>
                <TableSortLabel active={orderBy === 'intake_datetime'} direction={orderBy === 'intake_datetime' ? order : 'asc'} onClick={handleSort('intake_datetime')}>Data</TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 150 }}>Kontrahent</TableCell>
              <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>Zboże</TableCell>
              <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>Dokument</TableCell>
              <TableCell sortDirection={orderBy === 'net_weight' ? order : false} sx={{ minWidth: 100 }}>
                <TableSortLabel active={orderBy === 'net_weight'} direction={orderBy === 'net_weight' ? order : 'asc'} onClick={handleSort('net_weight')}>Netto [t]</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'price_per_unit' ? order : false} sx={{ minWidth: 120, display: { xs: 'none', lg: 'table-cell' } }}>
                <TableSortLabel active={orderBy === 'price_per_unit'} direction={orderBy === 'price_per_unit' ? order : 'asc'} onClick={handleSort('price_per_unit')}>Cena [PLN/t]</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'amount' ? order : false} sx={{ minWidth: 120 }}>
                <TableSortLabel active={orderBy === 'amount'} direction={orderBy === 'amount' ? order : 'asc'} onClick={handleSort('amount')}>Kwota [PLN]</TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.intake_datetime}</TableCell>
                <TableCell>{contractorNameMap[r.contractor_id] || r.contractor_id}</TableCell>
                <TableCell>{grainNameMap[r.grain_id] || r.grain_id}</TableCell>
                <TableCell>{r.document_number}</TableCell>
                <TableCell>{r.net_weight}</TableCell>
                <TableCell>{r.price_per_unit}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.status}</TableCell>
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

      <IntakeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRow}
        contractors={contractors}
        grains={grains}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDeleteConfirmed}
        title="Usuń przyjęcie"
        content={rowToDelete ? `Czy na pewno usunąć przyjęcie ID ${rowToDelete.id}?` : ''}
        confirmText="Usuń"
      />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Intakes;
