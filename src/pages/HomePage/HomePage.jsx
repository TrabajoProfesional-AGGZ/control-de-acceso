import { useState } from 'react';
import { Header } from '../../components/Header/Header';
import { WelcomeCard } from '../../components/WelcomeCard/WelcomeCard';
import { PerfilPage } from '../PerfilPage/PerfilPage';
import { LectorAcceso } from '../../components/LectorAcceso/LectorAcceso'; 
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
        {vista === 'perfil' && (
          <PerfilPage empleado={empleado} cerrarSesion={cerrarSesion} />
        )}

        {vista === 'lector' && (
          <div className="lector-view-container">
            <button 
              onClick={() => setVista('inicio')}
              className="btn-volver-lector"
            >
              ← Volver al inicio
            </button>
            
            <LectorAcceso />
          </div>
        )}

        {vista === 'inicio' && (
          <>
            <WelcomeCard empleado={empleado} />
            
            <div className="main-action-container">
              <button 
                onClick={() => setVista('lector')}
                className="btn-escanear-principal"
              >
                <span className="lector-icon">📷</span>
                Escanear Pase de Acceso
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
