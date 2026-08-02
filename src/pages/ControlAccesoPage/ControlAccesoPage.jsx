import { ArrowLeft } from 'lucide-react';
import { LectorAcceso } from '../../components/LectorAcceso/LectorAcceso';
import './ControlAccesoPage.css';

export function ControlAccesoPage({ onVolver }) {
  return (
    <div className="control-acceso-page">
      <div className="control-acceso-banner">
        <button
          onClick={onVolver}
          className="control-acceso-volver"
          aria-label="Volver al inicio"
        >
          <ArrowLeft size={20} />
        </button>
        <h1>Control de Acceso</h1>
      </div>

      <LectorAcceso />
    </div>
  );
}
