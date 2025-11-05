import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook do zarządzania danymi aplikacji
export const useAppData = () => {
  const [appointments, setAppointments] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pobieranie awizacji z bazy danych
  const fetchAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      if (window.electronAPI) {
        const data = await window.electronAPI.dbGetAppointments(filters);
        setAppointments(data);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd podczas pobierania awizacji:', err);
      }
      setError('Nie udało się pobrać awizacji');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobieranie kontrahentów
  const fetchContractors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (window.electronAPI) {
        const data = await window.electronAPI.dbGetAll('contractors');
        setContractors(data);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd podczas pobierania kontrahentów:', err);
      }
      setError('Nie udało się pobrać kontrahentów');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobieranie zbóż
  const fetchGrains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (window.electronAPI) {
        const data = await window.electronAPI.dbGetAll('grains');
        setGrains(data);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd podczas pobierania zbóż:', err);
      }
      setError('Nie udało się pobrać zbóż');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generyczna funkcja do operacji CRUD
  const createCRUDOperations = (entityName, fetchFunction) => {
    const addEntity = useCallback(async (entityData) => {
      try {
        setLoading(true);
        setError(null);
        if (window.electronAPI) {
          const result = await window.electronAPI.dbInsert(entityName, entityData);
          await fetchFunction();
          return result;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Błąd podczas dodawania ${entityName}:`, err);
        }
        setError(`Nie udało się dodać ${entityName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [fetchFunction]);

    const updateEntity = useCallback(async (id, entityData) => {
      try {
        setLoading(true);
        setError(null);
        if (window.electronAPI) {
          const result = await window.electronAPI.dbUpdate(entityName, id, entityData);
          await fetchFunction();
          return result;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Błąd podczas aktualizacji ${entityName}:`, err);
        }
        setError(`Nie udało się zaktualizować ${entityName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [fetchFunction]);

    const deleteEntity = useCallback(async (id) => {
      try {
        setLoading(true);
        setError(null);
        if (window.electronAPI) {
          const result = await window.electronAPI.dbDelete(entityName, id);
          await fetchFunction();
          return result;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Błąd podczas usuwania ${entityName}:`, err);
        }
        setError(`Nie udało się usunąć ${entityName}`);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [fetchFunction]);

    return { addEntity, updateEntity, deleteEntity };
  };

  // Operacje dla awizacji
  const { addEntity: addAppointment, updateEntity: updateAppointment, deleteEntity: deleteAppointment } = 
    createCRUDOperations('appointments', fetchAppointments);

  // Operacje dla kontrahentów
  const { addEntity: addContractor, updateEntity: updateContractor, deleteEntity: deleteContractor } = 
    createCRUDOperations('contractors', fetchContractors);

  // Operacje dla zbóż
  const { addEntity: addGrain, updateEntity: updateGrain, deleteEntity: deleteGrain } = 
    createCRUDOperations('grains', fetchGrains);

  // Shippers to alias dla contractors - usuwamy duplikację
  const shippers = contractors;
  const addShipper = addContractor;
  const updateShipper = updateContractor;
  const deleteShipper = deleteContractor;
  const fetchShippers = fetchContractors;

  // Sprawdzenie integralności bazy danych przy starcie
  const checkDatabaseHealth = useCallback(async () => {
    try {
      if (window.electronAPI?.dbCheckIntegrity) {
        await window.electronAPI.dbCheckIntegrity();
        console.log('✓ Sprawdzenie integralności bazy danych: OK');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd sprawdzania integralności bazy danych:', error);
      }
      setError('Błąd integralności bazy danych');
    }
  }, []);

  // Inicjalizacja danych
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Sprawdź integralność bazy danych
        await checkDatabaseHealth();
        
        // Pobierz dane
        await Promise.all([
          fetchAppointments(),
          fetchContractors(),
          fetchGrains()
        ]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Błąd inicjalizacji danych:', error);
        }
        setError('Błąd inicjalizacji danych aplikacji');
      }
    };

    initializeData();
  }, [fetchAppointments, fetchContractors, fetchGrains, checkDatabaseHealth]);

  // Funkcje zarządzania bazą danych
  const optimizeDatabase = useCallback(async () => {
    try {
      if (window.electronAPI?.dbOptimize) {
        await window.electronAPI.dbOptimize();
        console.log('✓ Optymalizacja bazy danych zakończona');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd optymalizacji bazy danych:', error);
      }
      throw error;
    }
  }, []);

  const getDatabaseInfo = useCallback(async () => {
    try {
      if (window.electronAPI?.dbGetInfo) {
        return await window.electronAPI.dbGetInfo();
      }
      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd pobierania informacji o bazie danych:', error);
      }
      throw error;
    }
  }, []);

  const cleanupDatabase = useCallback(async (options = {}) => {
    try {
      if (window.electronAPI?.dbCleanup) {
        return await window.electronAPI.dbCleanup(options);
      }
      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd czyszczenia bazy danych:', error);
      }
      throw error;
    }
  }, []);

  // Memoizacja zwracanych wartości dla lepszej wydajności
  return useMemo(() => ({
    appointments,
    contractors,
    shippers,
    grains,
    loading,
    error,
    fetchAppointments,
    fetchContractors,
    fetchShippers,
    fetchGrains,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addContractor,
    updateContractor,
    deleteContractor,
    addShipper,
    updateShipper,
    deleteShipper,
    addGrain,
    updateGrain,
    deleteGrain,
    setError,
    // Nowe funkcje zarządzania bazą danych
    checkDatabaseHealth,
    optimizeDatabase,
    getDatabaseInfo,
    cleanupDatabase
  }), [
    appointments,
    contractors,
    grains,
    loading,
    error,
    fetchAppointments,
    fetchContractors,
    fetchGrains,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addContractor,
    updateContractor,
    deleteContractor,
    addGrain,
    updateGrain,
    deleteGrain,
    setError,
    checkDatabaseHealth,
    optimizeDatabase,
    getDatabaseInfo,
    cleanupDatabase
  ]);
}; 