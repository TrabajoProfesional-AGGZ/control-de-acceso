import { Home, ScanLine } from 'lucide-react';
import { LectorAcceso } from '../../components/LectorAcceso/LectorAcceso';
import './ControlAccesoPage.css';

export function ControlAccesoPage({ onVolver }) {
  return (
    <div className="control-acceso-page">
      <div className="control-acceso-banner">
        <div className="control-acceso-banner-texture" aria-hidden="true" />

        <div className="control-acceso-banner-titulo">
          <ScanLine size={22} className="control-acceso-banner-icono" aria-hidden="true" />
          <h1>Control de Acceso</h1>
        </div>
        <p className="control-acceso-banner-subtitulo">
          Escaneá el QR del socio para validar su ingreso
        </p>
      </div>

      <LectorAcceso />

      <button
        onClick={onVolver}
        className="control-acceso-home-btn"
        aria-label="Ir a la página principal"
      >
        <Home size={20} />
        Ir al inicio
      </button>
    </div>
  );
}
