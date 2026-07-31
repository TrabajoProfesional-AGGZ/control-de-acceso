import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';

jest.mock('../../firebase', () => ({ auth: {} }));
jest.mock('../../utils/authService', () => ({ changePassword: jest.fn() }));

const empleado = {
  legajo: '1000',
  nombre: 'Carlos',
  apellido: 'Gomez',
  mail: 'carlos@club.com',
  dni: '30111222',
};

describe('HomePage', () => {
  test('muestra el banner de bienvenida con los datos del empleado, sin estado financiero', () => {
    render(<HomePage empleado={empleado} cerrarSesion={jest.fn()} />);
    expect(screen.getByText('Bienvenido Carlos Gomez')).toBeInTheDocument();
    expect(screen.getByText('Legajo 1000')).toBeInTheDocument();
    expect(screen.queryByText(/estado/i)).not.toBeInTheDocument();
  });

  test('el ícono de perfil abre y cierra la vista de perfil', () => {
    render(<HomePage empleado={empleado} cerrarSesion={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /mi perfil/i }));
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mi perfil/i }));
    expect(screen.getByText('Bienvenido Carlos Gomez')).toBeInTheDocument();
  });
});
