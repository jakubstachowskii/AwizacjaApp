// Funkcje walidacji dla formularzy

export const validateContractor = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja nazwy
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Nazwa musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja NIP
  if (data.nip && data.nip.trim().length > 0) {
    const nipRegex = /^\d{10}$/;
    if (!nipRegex.test(data.nip.replace(/\s/g, ''))) {
      errors.nip = 'NIP musi składać się z 10 cyfr';
      isValid = false;
    }
  }

  // Walidacja email
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Nieprawidłowy format email';
      isValid = false;
    }
  }

  // Walidacja telefonu
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Nieprawidłowy format telefonu';
      isValid = false;
    }
  }

  return { isValid, errors };
};

export const validateGrain = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja nazwy zboża
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Nazwa zboża musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja jednostki
  if (!data.unit || data.unit.trim().length === 0) {
    errors.unit = 'Jednostka jest wymagana';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateAppointment = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja daty
  if (!data.datetime) {
    errors.datetime = 'Data i czas są wymagane';
    isValid = false;
  } else {
    const appointmentDate = new Date(data.datetime);
    const now = new Date();
    if (appointmentDate < now) {
      errors.datetime = 'Data nie może być w przeszłości';
      isValid = false;
    }
  }

  // Walidacja zboża
  if (!data.grain_id) {
    errors.grain_id = 'Zboże jest wymagane';
    isValid = false;
  }

  // Walidacja kontrahenta
  if (!data.contractor_id) {
    errors.contractor_id = 'Kontrahent jest wymagany';
    isValid = false;
  }

  // Walidacja ilości
  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = 'Ilość musi być większa od 0';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateCustomer = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja nazwy klienta
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Nazwa klienta musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja NIP
  if (data.nip && data.nip.trim().length > 0) {
    const nipRegex = /^\d{10}$/;
    if (!nipRegex.test(data.nip.replace(/\s/g, ''))) {
      errors.nip = 'NIP musi składać się z 10 cyfr';
      isValid = false;
    }
  }

  // Walidacja email
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Nieprawidłowy format email';
      isValid = false;
    }
  }

  // Walidacja telefonu
  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = 'Nieprawidłowy format telefonu';
      isValid = false;
    }
  }

  // Walidacja terminu płatności
  if (data.payment_terms && (data.payment_terms < 0 || data.payment_terms > 365)) {
    errors.payment_terms = 'Termin płatności musi być między 0 a 365 dni';
    isValid = false;
  }

  // Walidacja limitu kredytowego
  if (data.credit_limit && data.credit_limit < 0) {
    errors.credit_limit = 'Limit kredytowy nie może być ujemny';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateProduct = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja nazwy produktu
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Nazwa produktu musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja kategorii
  if (!data.category) {
    errors.category = 'Kategoria jest wymagana';
    isValid = false;
  }

  // Walidacja jednostki
  if (!data.unit) {
    errors.unit = 'Jednostka jest wymagana';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateOrder = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja numeru zamówienia
  if (!data.order_number || data.order_number.trim().length < 2) {
    errors.order_number = 'Numer zamówienia musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja klienta
  if (!data.customer_id) {
    errors.customer_id = 'Klient jest wymagany';
    isValid = false;
  }

  // Walidacja daty zamówienia
  if (!data.order_date) {
    errors.order_date = 'Data zamówienia jest wymagana';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateInvoice = (data) => {
  const errors = {};
  let isValid = true;

  // Walidacja numeru faktury
  if (!data.invoice_number || data.invoice_number.trim().length < 2) {
    errors.invoice_number = 'Numer faktury musi mieć co najmniej 2 znaki';
    isValid = false;
  }

  // Walidacja klienta
  if (!data.customer_id) {
    errors.customer_id = 'Klient jest wymagany';
    isValid = false;
  }

  // Walidacja daty wystawienia
  if (!data.invoice_date) {
    errors.invoice_date = 'Data wystawienia jest wymagana';
    isValid = false;
  }

  // Walidacja kwoty netto
  if (!data.net_amount || data.net_amount <= 0) {
    errors.net_amount = 'Kwota netto musi być większa od 0';
    isValid = false;
  }

  // Walidacja stawki VAT
  if (data.vat_rate < 0 || data.vat_rate > 100) {
    errors.vat_rate = 'Stawka VAT musi być między 0 a 100%';
    isValid = false;
  }

  return { isValid, errors };
};
