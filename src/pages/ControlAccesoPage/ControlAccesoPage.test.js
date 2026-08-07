import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlAccesoPage } from './ControlAccesoPage';
import { getEventosActivos } from '../../services/eventosService';

jest.mock('../../services/eventosService');

jest.mock('../../components/LectorAcceso/LectorAcceso', () => ({
  LectorAcceso: ({ idEvento }) => <div data-testid="lector-mock">Evento ID: {idEvento}</div>
}));

describe('ControlAccesoPage - Selección de Eventos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('carga los eventos y el selector funciona correctamente', async () => {
    getEventosActivos.mockResolvedValue([
      { id: 'evento-123', nombre: 'Partido de Verano' }
    ]);

    render(<ControlAccesoPage onVolver={jest.fn()} />);

    expect(screen.getByText('Cargando eventos...')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText('Cargando eventos...'));

    const select = screen.getByLabelText('Modo de Operación:');
    expect(select).not.toBeDisabled();
    
    expect(screen.getByText('Validar entrada: Partido de Verano')).toBeInTheDocument();

    expect(screen.getByTestId('lector-mock')).toHaveTextContent('Evento ID:');

    await userEvent.selectOptions(select, 'evento-123');

    expect(screen.getByTestId('lector-mock')).toHaveTextContent('Evento ID: evento-123');
  });

  test('maneja el error si falla la carga de eventos', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    getEventosActivos.mockRejectedValue(new Error('Network error'));

    render(<ControlAccesoPage onVolver={jest.fn()} />);

    await waitForElementToBeRemoved(() => screen.queryByText('Cargando eventos...'));

    const select = screen.getByLabelText('Modo de Operación:');
    expect(select).not.toBeDisabled();
    
    expect(screen.queryByText(/Validar entrada:/)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});