export const stockItems = [
  { id:1, name:'A101 – Polymer Sheet 2mm', sku:'PLY-001', category:'Raw Material', qty:450, unit:'Kg',  rate:180, value:81000,  warehouse:'Mumbai Main', reorderLevel:100, status:'Normal'    },
  { id:2, name:'B202 – Chemical Mix Type3', sku:'CHM-002', category:'Chemical',    qty:80,  unit:'Ltr', rate:420, value:33600,  warehouse:'Mumbai Main', reorderLevel:150, status:'Low Stock' },
  { id:3, name:'C303 – Packing Box 12x10', sku:'PKG-003', category:'Packaging',   qty:0,   unit:'Pcs', rate:25,  value:0,      warehouse:'Pune Storage', reorderLevel:500, status:'Out of Stock' },
  { id:4, name:'D404 – Label Print A4',    sku:'LBL-004', category:'Packaging',   qty:2400,unit:'Pcs', rate:3,   value:7200,   warehouse:'Mumbai Main', reorderLevel:500, status:'Normal'    },
  { id:5, name:'E505 – Polymer Grade B',   sku:'PLY-005', category:'Raw Material', qty:1200,unit:'Kg', rate:195, value:234000, warehouse:'Delhi Hub',   reorderLevel:200, status:'Overstocked'},
  { id:6, name:'F606 – Industrial Tape',   sku:'PKG-006', category:'Packaging',   qty:320, unit:'Roll',rate:45,  value:14400,  warehouse:'Pune Storage', reorderLevel:100, status:'Normal'    },
  { id:7, name:'G707 – Solvent Type A',    sku:'CHM-007', category:'Chemical',    qty:40,  unit:'Ltr', rate:380, value:15200,  warehouse:'Mumbai Main', reorderLevel:80,  status:'Low Stock' },
  { id:8, name:'H808 – Steel Rod 12mm',    sku:'STL-008', category:'Raw Material', qty:600, unit:'Pcs', rate:220, value:132000, warehouse:'Delhi Hub',   reorderLevel:100, status:'Normal'    },
];

export const warehouses = [
  { id:1, name:'Mumbai Main Warehouse', code:'WH-001', address:'Bhiwandi, Mumbai', totalSKUs:5, totalValue:379800, supervisor:'Ramesh' },
  { id:2, name:'Pune Storage',          code:'WH-002', address:'Pimpri, Pune',     totalSKUs:3, totalValue:21600,  supervisor:'Suresh'  },
  { id:3, name:'Delhi Hub',             code:'WH-003', address:'Okhla, Delhi',     totalSKUs:2, totalValue:366000, supervisor:'Mahesh'  },
];

export const stockMovements = [
  { id:1, date:'10 Jul 2025', item:'A101 – Polymer Sheet 2mm', type:'Purchase',   qty:'+200', warehouse:'Mumbai Main', ref:'PI-2025-0456', balance:450 },
  { id:2, date:'09 Jul 2025', item:'B202 – Chemical Mix Type3',type:'Sales',      qty:'-50',  warehouse:'Mumbai Main', ref:'SI-2025-0782', balance:80  },
  { id:3, date:'08 Jul 2025', item:'C303 – Packing Box 12x10', type:'Sales',      qty:'-100', warehouse:'Pune Storage',ref:'SI-2025-0781', balance:0   },
  { id:4, date:'07 Jul 2025', item:'E505 – Polymer Grade B',   type:'Transfer',   qty:'+400', warehouse:'Delhi Hub',   ref:'STR-001',      balance:1200},
  { id:5, date:'06 Jul 2025', item:'D404 – Label Print A4',    type:'Adjustment', qty:'+200', warehouse:'Mumbai Main', ref:'ADJ-001',      balance:2400},
  { id:6, date:'05 Jul 2025', item:'G707 – Solvent Type A',    type:'Sales',      qty:'-20',  warehouse:'Mumbai Main', ref:'SI-2025-0780', balance:40  },
];

export const stockKPIs = {
  totalItems: 8, totalValue: 517400, lowStock: 2, outOfStock: 1, overstocked: 1,
};
