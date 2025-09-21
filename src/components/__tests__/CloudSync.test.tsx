import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FinanceProvider } from '../../context/FinanceContext';
import CloudSyncPanel from '../CloudSyncPanel';
import CloudConfigModal from '../CloudConfigModal';

// Mock fetch
global.fetch = jest.fn();

const mockConfig = {
  apiEndpoint: 'https://api.example.com',
  apiKey: 'test-api-key',
  userId: 'test-user-id',
  autoSyncInterval: 30
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <FinanceProvider>
      {component}
    </FinanceProvider>
  );
};

describe('Cloud Sync Components', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  describe('CloudSyncPanel', () => {
    it('should render cloud sync panel', () => {
      renderWithProvider(
        <CloudSyncPanel 
          config={mockConfig} 
          onTransactionsUpdate={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Sincronización en la Nube')).toBeInTheDocument();
    });

    it('should show online status when connected', () => {
      renderWithProvider(
        <CloudSyncPanel 
          config={mockConfig} 
          onTransactionsUpdate={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Conectado')).toBeInTheDocument();
    });

    it('should show sync buttons when settings are opened', async () => {
      renderWithProvider(
        <CloudSyncPanel 
          config={mockConfig} 
          onTransactionsUpdate={jest.fn()} 
        />
      );
      
      const settingsBtn = screen.getByRole('button', { name: /configuración/i });
      fireEvent.click(settingsBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Sincronizar')).toBeInTheDocument();
        expect(screen.getByText('Descargar')).toBeInTheDocument();
        expect(screen.getByText('Backup')).toBeInTheDocument();
      });
    });

    it('should handle sync to cloud', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ syncId: 'test-sync-id', version: 1 })
      });

      renderWithProvider(
        <CloudSyncPanel 
          config={mockConfig} 
          onTransactionsUpdate={jest.fn()} 
        />
      );
      
      // Open settings
      const settingsBtn = screen.getByRole('button', { name: /configuración/i });
      fireEvent.click(settingsBtn);
      
      // Click sync button
      const syncBtn = await screen.findByText('Sincronizar');
      fireEvent.click(syncBtn);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          `${mockConfig.apiEndpoint}/transactions`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockConfig.apiKey}`,
              'X-User-ID': mockConfig.userId
            })
          })
        );
      });
    });

    it('should handle sync from cloud', async () => {
      const mockTransactions = [
        { id: '1', description: 'Test', amount: 100, type: 'income', category: 'salario', date: '2023-01-01' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactions: mockTransactions })
      });

      const mockOnUpdate = jest.fn();

      renderWithProvider(
        <CloudSyncPanel 
          config={mockConfig} 
          onTransactionsUpdate={mockOnUpdate} 
        />
      );
      
      // Open settings
      const settingsBtn = screen.getByRole('button', { name: /configuración/i });
      fireEvent.click(settingsBtn);
      
      // Click download button
      const downloadBtn = await screen.findByText('Descargar');
      fireEvent.click(downloadBtn);
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockTransactions);
      });
    });
  });

  describe('CloudConfigModal', () => {
    it('should render cloud config modal', () => {
      renderWithProvider(
        <CloudConfigModal
          isOpen={true}
          onClose={jest.fn()}
          onSave={jest.fn()}
        />
      );
      
      expect(screen.getByText('Configuración de Sincronización en la Nube')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const mockOnSave = jest.fn();
      
      renderWithProvider(
        <CloudConfigModal
          isOpen={true}
          onClose={jest.fn()}
          onSave={mockOnSave}
        />
      );
      
      const saveBtn = screen.getByText('Guardar Configuración');
      fireEvent.click(saveBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Endpoint de API es requerido')).toBeInTheDocument();
        expect(screen.getByText('API Key es requerida')).toBeInTheDocument();
        expect(screen.getByText('ID de usuario es requerido')).toBeInTheDocument();
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should validate URL format', async () => {
      const mockOnSave = jest.fn();
      
      renderWithProvider(
        <CloudConfigModal
          isOpen={true}
          onClose={jest.fn()}
          onSave={mockOnSave}
        />
      );
      
      const endpointInput = screen.getByLabelText(/endpoint de api/i);
      fireEvent.change(endpointInput, { target: { value: 'invalid-url' } });
      
      const saveBtn = screen.getByText('Guardar Configuración');
      fireEvent.click(saveBtn);
      
      await waitFor(() => {
        expect(screen.getByText('URL inválida')).toBeInTheDocument();
      });
    });

    it('should save valid configuration', async () => {
      const mockOnSave = jest.fn();
      
      renderWithProvider(
        <CloudConfigModal
          isOpen={true}
          onClose={jest.fn()}
          onSave={mockOnSave}
        />
      );
      
      // Fill in valid data
      fireEvent.change(screen.getByLabelText(/endpoint de api/i), {
        target: { value: 'https://api.example.com' }
      });
      fireEvent.change(screen.getByLabelText(/api key/i), {
        target: { value: 'test-api-key' }
      });
      fireEvent.change(screen.getByLabelText(/id de usuario/i), {
        target: { value: 'test-user-id' }
      });
      fireEvent.change(screen.getByLabelText(/intervalo de auto-sincronización/i), {
        target: { value: '30' }
      });
      
      const saveBtn = screen.getByText('Guardar Configuración');
      fireEvent.click(saveBtn);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          apiEndpoint: 'https://api.example.com',
          apiKey: 'test-api-key',
          userId: 'test-user-id',
          autoSyncInterval: 30
        });
      });
    });

    it('should test connection', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' })
      });
      
      renderWithProvider(
        <CloudConfigModal
          isOpen={true}
          onClose={jest.fn()}
          onSave={jest.fn()}
        />
      );
      
      // Fill in valid data
      fireEvent.change(screen.getByLabelText(/endpoint de api/i), {
        target: { value: 'https://api.example.com' }
      });
      fireEvent.change(screen.getByLabelText(/api key/i), {
        target: { value: 'test-api-key' }
      });
      fireEvent.change(screen.getByLabelText(/id de usuario/i), {
        target: { value: 'test-user-id' }
      });
      
      const testBtn = screen.getByText('Probar Conexión');
      fireEvent.click(testBtn);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://api.example.com/health',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-api-key',
              'X-User-ID': 'test-user-id'
            })
          })
        );
      });
    });
  });
});
