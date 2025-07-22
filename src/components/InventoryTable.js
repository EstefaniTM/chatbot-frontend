import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const InventoryTable = ({ open, onClose, inventoryData, columns }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>Inventario Completo</DialogTitle>
    <DialogContent>
      {inventoryData.length > 0 ? (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={inventoryData}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        </Box>
      ) : (
        <Typography>No hay datos de inventario cargados.</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cerrar</Button>
    </DialogActions>
  </Dialog>
);

export default InventoryTable;
