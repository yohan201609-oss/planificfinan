import React from 'react';
import { X, Search } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getAllCategories } from '../utils/categories';
import './TransactionFilters.css';

const TransactionFilters = () => {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    uniqueCategories 
  } = useFinance();

  const handleFilterChange = (filterType, value) => {
    setFilters({ [filterType]: value });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters({ search: value });
  };

  const availableCategories = getAllCategories().filter(cat => 
    uniqueCategories.includes(cat.key)
  );

  return (
    <section className="filters-section">
      <h2>Filtros y Búsqueda</h2>
      
      <div className="filters-container">
        <div className="search-group">
          <label htmlFor="search-input">
            <Search size={16} />
            Buscar:
          </label>
          <input
            type="text"
            id="search-input"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Buscar por descripción o categoría..."
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="filter-type">Tipo:</label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-category">Categoría:</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">Todas</option>
              {availableCategories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <button 
              onClick={clearFilters}
              className="btn-clear"
              type="button"
            >
              <X size={16} />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransactionFilters;



