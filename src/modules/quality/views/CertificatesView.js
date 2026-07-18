import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography, IconButton
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import { compactEmptyRowSx } from '../../../theme/designTokens';

const FIELDS = [
  { name: 'certificate_number', label: 'Numer certyfikatu' },
  { name: 'issue_date', label: 'Data wystawienia', type: 'date' },
  { name: 'valid_until', label: 'Ważny do', type: 'date' },
  { name: 'issuer', label: 'Wystawca' },
  { name: 'status', label: 'Status' },
  { name: 'notes', label: 'Notatki' }
];

export default function CertificatesView() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ certificate_number: '', issue_date: new Date().toISOString().slice(0, 10), status: 'aktywne', issuer: '', notes: '' });

  const load = useCallback(async () => {
    setRows(await window.electronAPI.dbGetAll('jakosc_certificates', 'issue_date') || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await window.electronAPI.dbInsert('jakosc_certificates', form);
    setOpen(false);
    load();
    window.dispatchEvent(new Event('quality:refresh'));
  };

  return (
    <Box>
      <PageHeader
        title="Certyfikaty jakości"
        subtitle="Dokumenty potwierdzające zgodność partii"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowy certyfikat</Button>}
      />
      <DataPanel>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Numer</TableCell><TableCell>Data</TableCell><TableCell>Wystawca</TableCell><TableCell>Status</TableCell><TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak certyfikatów.</Typography></TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.certificate_number}</TableCell>
                <TableCell>{r.issue_date}</TableCell>
                <TableCell>{r.issuer || '—'}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={async () => { await window.electronAPI.dbDelete('jakosc_certificates', r.id); load(); window.dispatchEvent(new Event('quality:refresh')); }}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowy certyfikat</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {FIELDS.map((f) => (
              <Grid item xs={12} sm={6} key={f.name}>
                <TextField fullWidth size="small" label={f.label} type={f.type || 'text'} InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                  value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save}>Zapisz</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
