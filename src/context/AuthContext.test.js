import { render, screen, act } from '@testing-library/react';
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

describe('AuthProvider — carga de perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
