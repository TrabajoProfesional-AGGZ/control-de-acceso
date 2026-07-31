import { useState } from 'react';
import { Header } from '../../components/Header/Header';
import { WelcomeCard } from '../../components/WelcomeCard/WelcomeCard';
import { PerfilPage } from '../PerfilPage/PerfilPage';
import '../../control-theme.css';
import './HomePage.css';

export function HomePage({ empleado, cerrarSesion }) {
  const [vista, setVista] = useState('inicio');

  return (
    <div>
      <Header
        onPerfil={() => setVista(vista === 'perfil' ? 'inicio' : 'perfil')}
      />

      <main className="home-page">
        {vista === 'perfil' ? (
          <PerfilPage empleado={empleado} cerrarSesion={cerrarSesion} />
        ) : (
          <WelcomeCard empleado={empleado} />
        )}
      </main>
    </div>
  );
}
