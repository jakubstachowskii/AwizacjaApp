/** Prosty test jednostkowy dla dbConstants (bez Jest) */
const { ALLOWED_TABLES, isAllowedTable } = require('../electron/dbConstants');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log('✓', msg); }
  else { failed++; console.error('✗', msg); }
}

assert(Array.isArray(ALLOWED_TABLES) && ALLOWED_TABLES.length > 30, 'ALLOWED_TABLES ma wpisy');
assert(isAllowedTable('grains'), 'grains dozwolone');
assert(isAllowedTable('jakosc_tests'), 'jakosc_tests dozwolone');
assert(isAllowedTable('sales_orders'), 'sales_orders dozwolone');
assert(isAllowedTable('skup_intake_adjustments'), 'skup_intake_adjustments dozwolone');
assert(!isAllowedTable('users'), 'users niedozwolone');
assert(!isAllowedTable('; DROP TABLE grains;--'), 'SQL injection blokowany');

console.log(`\nWynik: ${passed} OK, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
