import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

jest.mock('../firebase', () => ({
  auth: { currentUser: { email: 'empleado@example.com' } },
}));

let callbackAuthState;
const mockSignOut = jest.fn();
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    callbackAuthState = callback;
    return () => {};
  },
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock('../utils/utils', () => ({
  fetchTo: jest.fn(),
}));
import { fetchTo } from '../utils/utils';

function Sonda() {
  const { empleado } = useAuth();
  return <span>empleado: {empleado ? empleado.nombre : 'ninguno'}</span>;
}

async function loguearEmpleado(firebaseUser = { email: 'empleado@example.com', getIdToken: async () => 'token' }) {
  fetchTo.mockResolvedValueOnce({ ok: true, json: async () => ({ nombre: 'Carlos' }) });
  await act(async () => {
    await callbackAuthState(firebaseUser);
  });
}

describe('AuthProvider — carga de perfil y cierre de sesión por inactividad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('carga el perfil del empleado tras un login exitoso', async () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>,
    );
    await loguearEmpleado();
    expect(await screen.findByText('empleado: Carlos')).toBeInTheDocument();
  });

  test('cierra la sesión automáticamente tras 10 minutos sin actividad', async () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>,
    );
    await loguearEmpleado();
    expect(await screen.findByText('empleado: Carlos')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(10 * 60 * 1000));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
  });

  test('la actividad del usuario evita el cierre automático antes de tiempo', async () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>,
    );
    await loguearEmpleado();
    await screen.findByText('empleado: Carlos');

    act(() => jest.advanceTimersByTime(9 * 60 * 1000));
    act(() => document.dispatchEvent(new Event('touchstart')));
    act(() => jest.advanceTimersByTime(9 * 60 * 1000));

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test('no cierra sesión por inactividad si no hay un empleado logueado', async () => {
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>,
    );
    await act(async () => {
      await callbackAuthState(null);
    });

    act(() => jest.advanceTimersByTime(60 * 60 * 1000));

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  test('si el backend no puede resolver el perfil, expone un authError y deja empleado en null', async () => {
    fetchTo.mockResolvedValueOnce({ ok: false });
    render(
      <AuthProvider>
        <Sonda />
      </AuthProvider>,
    );
    await act(async () => {
      await callbackAuthState({ email: 'empleado@example.com', getIdToken: async () => 'token' });
    });

    expect(await screen.findByText('empleado: ninguno')).toBeInTheDocument();
  });
});
