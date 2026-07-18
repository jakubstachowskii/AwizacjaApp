// Centralna lista dozwolonych tabel – synchronizowana ze schema.sql
const ALLOWED_TABLES = [
  'grains', 'contractors', 'appointments', 'weights', 'settings',
  'skup_intakes', 'skup_intake_adjustments', 'skup_contractors', 'skup_grains',
  'skup_prices', 'skup_documents', 'skup_quality_rules', 'skup_contracts',
  'skup_scale_config', 'skup_scale_readings', 'skup_weight_audit', 'skup_deliveries',
  'magazyn_warehouses', 'magazyn_stock_levels', 'magazyn_movements', 'magazyn_transfers',
  'magazyn_quality_samples', 'magazyn_quality_certificates',
  'magazyn_inventories', 'magazyn_inventory_items', 'magazyn_storage_plans',
  'magazyn_batches', 'magazyn_batch_movements',
  'jakosc_tests', 'jakosc_certificates', 'jakosc_processes', 'jakosc_process_checks',
  'jakosc_devices', 'jakosc_measurements',
  'sales_customers', 'sales_products', 'sales_orders', 'sales_order_items',
  'sales_deliveries', 'sales_delivery_items', 'sales_price_lists', 'sales_prices',
  'sales_invoices', 'sales_invoice_items', 'sales_payments'
];

function isAllowedTable(table) {
  return ALLOWED_TABLES.includes(table);
}

module.exports = { ALLOWED_TABLES, isAllowedTable };
