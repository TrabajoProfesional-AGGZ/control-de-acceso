import { Home, ScanLine } from 'lucide-react';
import { LectorAcceso } from '../../components/LectorAcceso/LectorAcceso';
import './ControlAccesoPage.css';
import { useState, useEffect } from 'react';
import { getEventosActivos } from '../../services/eventosService';

export function ControlAccesoPage({ onVolver }) {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [cargandoEventos, setCargandoEventos] = useState(true);
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setCargandoEventos(true);
        const data = await getEventosActivos();
        setEventos(data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setCargandoEventos(false);
      }
    };

    fetchEventos();
  }, []);

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

      <div className="evento-selector-container">
        <label htmlFor="select-evento" className="evento-label">
          Modo de Operación:
        </label>
        <select 
          id="select-evento" 
          className="evento-select"
          value={eventoSeleccionado} 
          onChange={(e) => setEventoSeleccionado(e.target.value)}
          disabled={cargandoEventos}
        >
          <option value="">Ingreso normal al club</option>
          {eventos.map((evento) => (
            <option key={evento.id} value={evento.id}>
              Validar entrada: {evento.nombre}
            </option>
          ))}
        </select>
        {cargandoEventos && <span className="loading-text">Cargando eventos...</span>}
      </div>

      <LectorAcceso idEvento={eventoSeleccionado} />

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
