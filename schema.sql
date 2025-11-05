-- Tabela zbóż
CREATE TABLE IF NOT EXISTS grains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL DEFAULT 't',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela kontrahentów
CREATE TABLE IF NOT EXISTS contractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    nip VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    type VARCHAR(20) DEFAULT 'rolnik', -- rolnik, firma, transport
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela awizacji
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) NOT NULL, -- dostawa, odbiór
    datetime DATETIME NOT NULL,
    grain_id INTEGER NOT NULL,
    quantity DECIMAL(10,3),
    plate_number VARCHAR(20) NOT NULL,
    contractor_id INTEGER NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'oczekująca', -- oczekująca, w_trakcie, zakończona, anulowana
    contract_number VARCHAR(50), -- numer kontraktu dla dostaw wychodzących
    delivery_type VARCHAR(20) DEFAULT 'skup', -- skup, kontrakt, inne
    
    -- Dodatkowe pola dla szczegółowych informacji
    driver_name VARCHAR(100),
    phone VARCHAR(20),
    trailer_plate VARCHAR(20),
    expected_duration VARCHAR(50),
    special_instructions TEXT,
    company VARCHAR(100),
    entry_time DATETIME,
    expected_exit_time DATETIME,
    gate VARCHAR(50),
    purpose VARCHAR(100),
    cargo_type VARCHAR(50),
    cargo_weight DECIMAL(10,3),
    cargo_unit VARCHAR(20),
    wz_number VARCHAR(50),
    wz_date DATE,
    contractor_name VARCHAR(200),
    contractor_address TEXT,
    delivery_address TEXT,
    shipper_name VARCHAR(200),
    shipper_address TEXT,
    is_return BOOLEAN DEFAULT FALSE,
    return_reason TEXT,
    return_quantity DECIMAL(10,3),
    return_unit VARCHAR(20),
    original_delivery_date DATE,
    original_delivery_number VARCHAR(50),
    
    -- Pola jakościowe zboża
    moisture_content DECIMAL(5,2), -- wilgotność w %
    impurities_content DECIMAL(5,2), -- zanieczyszczenia w %
    protein_content DECIMAL(5,2), -- zawartość białka w %
    falling_number INTEGER, -- liczba opadania
    hectoliter_weight DECIMAL(6,2), -- masa hektolitrowa w kg/hl
    test_weight DECIMAL(6,2), -- masa testowa w kg/hl
    grain_class VARCHAR(50), -- klasa zboża
    quality_notes TEXT, -- notatki o jakości
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE RESTRICT
);

-- Tabela ważeń
CREATE TABLE IF NOT EXISTS weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    brutto DECIMAL(10,3),
    tara DECIMAL(10,3),
    netto DECIMAL(10,3),
    weight_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Tabela ustawień aplikacji
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_grain_id ON appointments(grain_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contractor_id ON appointments(contractor_id);
CREATE INDEX IF NOT EXISTS idx_weights_appointment_id ON weights(appointment_id);
CREATE INDEX IF NOT EXISTS idx_contractors_type ON contractors(type);
CREATE INDEX IF NOT EXISTS idx_contractors_name ON contractors(name);

-- Usunięto przykładowe dane, baza startuje pusta

-- ==========================================
-- Tabele modułu SKUP (nie kolidują z Awizacje)
-- ==========================================

-- Główna tabela przyjęć w module Skup
CREATE TABLE IF NOT EXISTS skup_intakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contractor_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    document_number VARCHAR(50),
    gross_weight DECIMAL(10,3),
    tare_weight DECIMAL(10,3),
    net_weight DECIMAL(10,3),
    price_per_unit DECIMAL(10,2), -- cena za jednostkę (np. t)
    currency VARCHAR(3) DEFAULT 'PLN',
    amount DECIMAL(12,2), -- kwota netto/brutto w zależności od polityki
    moisture_content DECIMAL(5,2),
    impurities_content DECIMAL(5,2),
    protein_content DECIMAL(5,2),
    hectoliter_weight DECIMAL(6,2),
    quality_notes TEXT,
    status VARCHAR(20) DEFAULT 'nowe', -- nowe, weryfikacja, zatwierdzone, odrzucone
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Pozycje potrąceń/jakości (dodatkowe korekty do przyjęcia)
CREATE TABLE IF NOT EXISTS skup_intake_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER NOT NULL,
    code VARCHAR(50) NOT NULL, -- np. WILG, ZAN, INNE
    description VARCHAR(200),
    value DECIMAL(10,3),
    unit VARCHAR(20),
    amount_change DECIMAL(12,2), -- wpływ na kwotę
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intake_id) REFERENCES skup_intakes(id) ON DELETE CASCADE
);

-- Cenniki dla skupu (per zboże, przedział dat)
CREATE TABLE IF NOT EXISTS skup_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grain_id INTEGER NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    price_per_unit DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Dokumenty (np. KP, KW, RW, PZ, WZ) powiązane ze skupem
CREATE TABLE IF NOT EXISTS skup_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER,
    doc_type VARCHAR(20) NOT NULL, -- KP, KW, PZ, WZ, FV itp.
    doc_number VARCHAR(50) NOT NULL,
    doc_date DATE NOT NULL,
    gross_amount DECIMAL(12,2),
    net_amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'PLN',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intake_id) REFERENCES skup_intakes(id) ON DELETE SET NULL
);

-- Indeksy dla SKUP
CREATE INDEX IF NOT EXISTS idx_skup_intakes_datetime ON skup_intakes(intake_datetime);
CREATE INDEX IF NOT EXISTS idx_skup_intakes_contractor ON skup_intakes(contractor_id);
CREATE INDEX IF NOT EXISTS idx_skup_intakes_grain ON skup_intakes(grain_id);
CREATE INDEX IF NOT EXISTS idx_skup_prices_valid ON skup_prices(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_skup_documents_number ON skup_documents(doc_number);

-- ==========================================
-- Słowniki dedykowane dla modułu SKUP
-- (separacja od słowników Awizacji)
-- ==========================================

CREATE TABLE IF NOT EXISTS skup_contractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    nip VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    type VARCHAR(20) DEFAULT 'rolnik',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skup_grains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL DEFAULT 't',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skup_contractors_name ON skup_contractors(name);
CREATE INDEX IF NOT EXISTS idx_skup_contractors_type ON skup_contractors(type);
CREATE INDEX IF NOT EXISTS idx_skup_grains_name ON skup_grains(name);

-- ==========================================
-- Waga samochodowa i odczyty (SKUP)
-- ==========================================

CREATE TABLE IF NOT EXISTS skup_scale_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    mode VARCHAR(10) DEFAULT 'mock', -- mock/serial/tcp
    serial_port VARCHAR(100),
    serial_baud INTEGER,
    tcp_host VARCHAR(100),
    tcp_port INTEGER,
    frame_format VARCHAR(100),
    stability_threshold DECIMAL(10,3) DEFAULT 0.5,
    stability_time_ms INTEGER DEFAULT 1000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skup_scale_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reading_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(20) NOT NULL, -- mock/serial/tcp
    value DECIMAL(10,3) NOT NULL,
    unit VARCHAR(10) DEFAULT 'kg',
    stable BOOLEAN DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_skup_scale_readings_datetime ON skup_scale_readings(reading_datetime);

-- ==========================================
-- Reguły potrąceń jakości i kontrakty skupu (SKUP)
-- ==========================================

CREATE TABLE IF NOT EXISTS skup_quality_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grain_id INTEGER NOT NULL,
    param VARCHAR(50) NOT NULL, -- moisture, impurities, protein, etc.
    min_value DECIMAL(10,3),
    max_value DECIMAL(10,3),
    deduction_type VARCHAR(20) NOT NULL DEFAULT 'percent', -- percent/absolute
    deduction_value DECIMAL(10,3) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES skup_grains(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skup_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contractor_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    contract_number VARCHAR(50),
    valid_from DATE NOT NULL,
    valid_to DATE,
    base_price_per_unit DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    volume_limit DECIMAL(12,3), -- t
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contractor_id) REFERENCES skup_contractors(id) ON DELETE CASCADE,
    FOREIGN KEY (grain_id) REFERENCES skup_grains(id) ON DELETE CASCADE
);

-- Dostawy/wysyłki (SKUP)
CREATE TABLE IF NOT EXISTS skup_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_date DATE NOT NULL DEFAULT (date('now')),
    contractor_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    plate_number VARCHAR(20),
    driver_name VARCHAR(100),
    quantity DECIMAL(10,3),
    unit VARCHAR(20) DEFAULT 'ton',
    destination VARCHAR(200),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'planowana', -- planowana, w_drodze, dostarczona, anulowana
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contractor_id) REFERENCES skup_contractors(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES skup_grains(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_skup_contracts_valid ON skup_contracts(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_skup_deliveries_date ON skup_deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_skup_deliveries_contractor ON skup_deliveries(contractor_id);
CREATE INDEX IF NOT EXISTS idx_skup_deliveries_grain ON skup_deliveries(grain_id);

-- Audit korekt wag i zmian
CREATE TABLE IF NOT EXISTS skup_weight_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intake_id INTEGER,
    field VARCHAR(20) NOT NULL, -- gross/tare/net
    old_value DECIMAL(10,3),
    new_value DECIMAL(10,3),
    reason TEXT,
    source VARCHAR(20) DEFAULT 'manual', -- manual/scale
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intake_id) REFERENCES skup_intakes(id) ON DELETE CASCADE
);

-- ==========================================
-- MODUŁ MAGAZYNOWY
-- ==========================================

-- Magazyny/silosy
CREATE TABLE IF NOT EXISTS magazyn_warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(20) DEFAULT 'silos', -- silos, magazyn, bunkier
    capacity DECIMAL(12,3), -- pojemność w tonach
    unit VARCHAR(20) DEFAULT 't',
    location VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stany magazynowe (aktualne ilości zbóż w magazynach)
CREATE TABLE IF NOT EXISTS magazyn_stock_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 't',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE CASCADE,
    UNIQUE(warehouse_id, grain_id)
);

-- Ruchy magazynowe (przyjęcia, wydania, przesunięcia)
CREATE TABLE IF NOT EXISTS magazyn_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- przyjecie, wydanie, przesuniecie, korekta
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    reference_type VARCHAR(50), -- skup_intake, appointment, manual, etc.
    reference_id INTEGER, -- ID z tabeli źródłowej
    document_number VARCHAR(50),
    movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Przesunięcia między magazynami
CREATE TABLE IF NOT EXISTS magazyn_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_warehouse_id INTEGER NOT NULL,
    to_warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    document_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Kontrola jakości - próbki
CREATE TABLE IF NOT EXISTS magazyn_quality_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    sample_number VARCHAR(50) NOT NULL UNIQUE,
    sample_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantity DECIMAL(8,3), -- ilość próbki w kg
    moisture_content DECIMAL(5,2), -- wilgotność w %
    impurities_content DECIMAL(5,2), -- zanieczyszczenia w %
    protein_content DECIMAL(5,2), -- zawartość białka w %
    falling_number INTEGER, -- liczba opadania
    hectoliter_weight DECIMAL(6,2), -- masa hektolitrowa w kg/hl
    test_weight DECIMAL(6,2), -- masa testowa w kg/hl
    grain_class VARCHAR(50), -- klasa zboża
    quality_grade VARCHAR(20), -- ocena jakości
    notes TEXT,
    tested_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Certyfikaty jakości
CREATE TABLE IF NOT EXISTS magazyn_quality_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    certificate_date DATE NOT NULL,
    valid_until DATE,
    issuing_authority VARCHAR(200),
    quality_parameters TEXT, -- JSON z parametrami jakości
    file_path VARCHAR(500), -- ścieżka do pliku certyfikatu
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Inwentaryzacje
CREATE TABLE IF NOT EXISTS magazyn_inventories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    inventory_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'rozpoczeta', -- rozpoczeta, zakonczona, anulowana
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT
);

-- Pozycje inwentaryzacji
CREATE TABLE IF NOT EXISTS magazyn_inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    expected_quantity DECIMAL(12,3), -- oczekiwana ilość
    actual_quantity DECIMAL(12,3), -- rzeczywista ilość
    unit VARCHAR(20) DEFAULT 't',
    difference DECIMAL(12,3), -- różnica
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES magazyn_inventories(id) ON DELETE CASCADE,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Planowanie składowania
CREATE TABLE IF NOT EXISTS magazyn_storage_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL,
    grain_id INTEGER NOT NULL,
    planned_quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    planned_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'planowane', -- planowane, w_realizacji, zakonczone, anulowane
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE RESTRICT,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

-- Indeksy dla modułu magazynowego
CREATE INDEX IF NOT EXISTS idx_magazyn_stock_levels_warehouse ON magazyn_stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_stock_levels_grain ON magazyn_stock_levels(grain_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_movements_warehouse ON magazyn_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_movements_grain ON magazyn_movements(grain_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_movements_date ON magazyn_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_magazyn_movements_type ON magazyn_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_magazyn_transfers_date ON magazyn_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_magazyn_quality_samples_date ON magazyn_quality_samples(sample_date);
CREATE INDEX IF NOT EXISTS idx_magazyn_quality_certificates_date ON magazyn_quality_certificates(certificate_date);
CREATE INDEX IF NOT EXISTS idx_magazyn_inventories_date ON magazyn_inventories(inventory_date);
CREATE INDEX IF NOT EXISTS idx_magazyn_storage_plans_date ON magazyn_storage_plans(planned_date);

-- Partie i ruchy na partiach (MAGAZYN)
CREATE TABLE IF NOT EXISTS magazyn_batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_number VARCHAR(50) NOT NULL UNIQUE,
    grain_id INTEGER NOT NULL,
    origin VARCHAR(200), -- pochodzenie: gospodarstwo/pole/kontrahent
    harvest_year INTEGER,
    quality_params TEXT, -- JSON: wilgotnosc, zanieczyszczenia, bialko, hl itd.
    physical_mass DECIMAL(12,3) DEFAULT 0, -- masa fizyczna (t)
    trade_mass DECIMAL(12,3) DEFAULT 0, -- masa handlowa (po korektach wilgotnosci)
    status VARCHAR(20) DEFAULT 'aktywna', -- aktywna, zablokowana, zamknieta
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS magazyn_batch_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    warehouse_id INTEGER,
    movement_type VARCHAR(20) NOT NULL, -- przyjecie, wydanie, przesuniecie, mieszanie
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES magazyn_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_magazyn_batches_grain ON magazyn_batches(grain_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_batch_movements_batch ON magazyn_batch_movements(batch_id);
CREATE INDEX IF NOT EXISTS idx_magazyn_batch_movements_date ON magazyn_batch_movements(movement_date);

-- ==========================================
-- MODUŁ KONTROLI JAKOŚCI (JAKOSC)
-- ==========================================

-- Laboratorium: rejestr badań jakościowych
CREATE TABLE IF NOT EXISTS jakosc_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sample_code VARCHAR(50) NOT NULL,
    test_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grain_id INTEGER,
    contractor_id INTEGER,
    source VARCHAR(30), -- skup/magazyn/zewnętrzne
    moisture_content DECIMAL(5,2),
    impurities_content DECIMAL(5,2),
    protein_content DECIMAL(5,2),
    falling_number INTEGER,
    hectoliter_weight DECIMAL(6,2),
    gluten DECIMAL(5,2),
    zearalenone_ppb DECIMAL(8,2),
    vomitoxin_ppb DECIMAL(8,2),
    result VARCHAR(20), -- zgodny/niezgodny
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE SET NULL,
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL
);

-- Certyfikaty jakości
CREATE TABLE IF NOT EXISTS jakosc_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    valid_until DATE,
    grain_id INTEGER,
    scope TEXT, -- opis zakresu
    parameters TEXT, -- JSON parametrów
    file_path VARCHAR(500),
    issuer VARCHAR(200),
    status VARCHAR(20) DEFAULT 'aktywne', -- aktywne/wygasłe/zawieszone
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grain_id) REFERENCES grains(id) ON DELETE SET NULL
);

-- Procesy: HACCP/GMP
CREATE TABLE IF NOT EXISTS jakosc_processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- HACCP/GMP
    owner VARCHAR(100),
    is_active BOOLEAN DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rejestr kontroli procesów (punkty CCP, audyty, inspekcje)
CREATE TABLE IF NOT EXISTS jakosc_process_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id INTEGER NOT NULL,
    check_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checkpoint VARCHAR(100),
    parameter VARCHAR(100),
    measured_value VARCHAR(100),
    limit_low VARCHAR(100),
    limit_high VARCHAR(100),
    result VARCHAR(20), -- ok/nok
    corrective_action TEXT,
    checked_by VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (process_id) REFERENCES jakosc_processes(id) ON DELETE CASCADE
);

-- Urządzenia pomiarowe
CREATE TABLE IF NOT EXISTS jakosc_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
    calibration_date DATE,
    calibration_due DATE,
    connection_type VARCHAR(20) DEFAULT 'manual', -- manual/serial/tcp
    serial_port VARCHAR(100),
    serial_baud INTEGER,
    tcp_host VARCHAR(100),
    tcp_port INTEGER,
    status VARCHAR(20) DEFAULT 'aktywne',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rejestr pomiarów z urządzeń
CREATE TABLE IF NOT EXISTS jakosc_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    measurement_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    parameter VARCHAR(50) NOT NULL, -- wilgotnosc, temp, itp.
    value VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    source VARCHAR(20) DEFAULT 'manual', -- manual/serial/tcp
    reference_type VARCHAR(30), -- intake/sample/warehouse
    reference_id INTEGER,
    notes TEXT,
    FOREIGN KEY (device_id) REFERENCES jakosc_devices(id) ON DELETE CASCADE
);

-- Indeksy JAKOSC
CREATE INDEX IF NOT EXISTS idx_jakosc_tests_date ON jakosc_tests(test_date);
CREATE INDEX IF NOT EXISTS idx_jakosc_certificates_dates ON jakosc_certificates(issue_date, valid_until);
CREATE INDEX IF NOT EXISTS idx_jakosc_process_checks_datetime ON jakosc_process_checks(check_datetime);
CREATE INDEX IF NOT EXISTS idx_jakosc_measurements_datetime ON jakosc_measurements(measurement_datetime);

-- ==========================================
-- MODUŁ SPRZEDAŻY (SALES)
-- ==========================================

-- Klienci/odbiorcy
CREATE TABLE IF NOT EXISTS sales_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    nip VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    type VARCHAR(20) DEFAULT 'firma', -- firma, rolnik, hurtownia
    payment_terms INTEGER DEFAULT 14, -- dni płatności
    credit_limit DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Produkty do sprzedaży (zboża i inne)
CREATE TABLE IF NOT EXISTS sales_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL DEFAULT 't',
    category VARCHAR(50) DEFAULT 'zboze', -- zboze, pasza, inne
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Zamówienia sprzedaży
CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status VARCHAR(20) DEFAULT 'nowe', -- nowe, potwierdzone, w_realizacji, wyslane, zrealizowane, anulowane
    total_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PLN',
    payment_terms INTEGER DEFAULT 14,
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES sales_customers(id) ON DELETE RESTRICT
);

-- Pozycje zamówień
CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES sales_products(id) ON DELETE RESTRICT
);

-- Dostawy/wysyłki
CREATE TABLE IF NOT EXISTS sales_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    order_id INTEGER NOT NULL,
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_time TIME,
    transport_company VARCHAR(200),
    driver_name VARCHAR(100),
    plate_number VARCHAR(20),
    trailer_plate VARCHAR(20),
    phone VARCHAR(20),
    delivery_address TEXT,
    status VARCHAR(20) DEFAULT 'planowana', -- planowana, w_drodze, dostarczona, anulowana
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE RESTRICT
);

-- Pozycje dostaw
CREATE TABLE IF NOT EXISTS sales_delivery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id INTEGER NOT NULL,
    order_item_id INTEGER NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    warehouse_id INTEGER, -- z którego magazynu
    quality_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES sales_deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES sales_order_items(id) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES magazyn_warehouses(id) ON DELETE SET NULL
);

-- Cenniki sprzedaży
CREATE TABLE IF NOT EXISTS sales_price_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ceny w cennikach
CREATE TABLE IF NOT EXISTS sales_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_list_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    customer_id INTEGER, -- NULL = cena ogólna, konkretny ID = cena dla klienta
    price_per_unit DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    min_quantity DECIMAL(12,3) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (price_list_id) REFERENCES sales_price_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES sales_products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES sales_customers(id) ON DELETE CASCADE
);

-- Faktury
CREATE TABLE IF NOT EXISTS sales_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id INTEGER,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    vat_amount DECIMAL(12,2) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    status VARCHAR(20) DEFAULT 'wystawiona', -- wystawiona, wyslana, oplacona, przeterminowana
    payment_date DATE,
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES sales_customers(id) ON DELETE RESTRICT
);

-- Pozycje faktur
CREATE TABLE IF NOT EXISTS sales_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    description VARCHAR(200),
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 't',
    unit_price DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    vat_amount DECIMAL(12,2) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES sales_products(id) ON DELETE RESTRICT
);

-- Płatności
CREATE TABLE IF NOT EXISTS sales_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    payment_method VARCHAR(20) DEFAULT 'przelew', -- przelew, gotowka, karta, czek
    reference_number VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE
);

-- Indeksy dla modułu sprzedaży
CREATE INDEX IF NOT EXISTS idx_sales_customers_name ON sales_customers(name);
CREATE INDEX IF NOT EXISTS idx_sales_customers_type ON sales_customers(type);
CREATE INDEX IF NOT EXISTS idx_sales_orders_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_deliveries_number ON sales_deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_sales_deliveries_date ON sales_deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_sales_deliveries_order ON sales_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_prices_list ON sales_prices(price_list_id);
CREATE INDEX IF NOT EXISTS idx_sales_prices_product ON sales_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_prices_customer ON sales_prices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_number ON sales_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sales_payments_invoice ON sales_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_payments_date ON sales_payments(payment_date);