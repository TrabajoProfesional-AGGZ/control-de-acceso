import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { CheckCircle2, XCircle } from 'lucide-react';
import { fetchTo } from '../../utils/utils';
import './LectorAcceso.css';

const ESTADO_INICIAL = { tipo: null, mensaje: '', nombre: null, estadoFinanciero: null };

export const LectorAcceso = () => {
  const [resultado, setResultado] = useState(ESTADO_INICIAL);
  const [validando, setValidando] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    async function onScanSuccess(decodedText) {
      if (scannerRef.current) scannerRef.current.pause(true);
      setValidando(true);

      try {
        const res = await fetchTo('/api/v1/accesos/validar', 'POST', {
          qr_data: decodedText,
        });
        const data = await res.json();

        if (res.ok) {
          setResultado({
            tipo: 'exito',
            mensaje: 'Acceso permitido',
            nombre: data.nombre,
            estadoFinanciero: data.estado_financiero,
          });
        } else {
          const detalle = data.detail;
          const esDetalleEstructurado = detalle && typeof detalle === 'object';
          setResultado({
            tipo: 'error',
            mensaje: esDetalleEstructurado
              ? detalle.mensaje
              : (detalle || 'QR inválido o expirado.'),
            nombre: esDetalleEstructurado ? detalle.nombre : null,
            estadoFinanciero: esDetalleEstructurado ? detalle.estado_financiero : null,
          });
        }
      } catch {
        setResultado({
          tipo: 'error',
          mensaje: 'Error procesando el código.',
          nombre: null,
          estadoFinanciero: null,
        });
      } finally {
        setValidando(false);
      }
    }

    function onScanFailure() {
      // html5-qrcode llama esto en cada frame sin QR detectado: no es un error a mostrar.
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const cerrarResultado = () => {
    setResultado(ESTADO_INICIAL);
    if (scannerRef.current) scannerRef.current.resume();
  };

  return (
    <div className="lector-container">
      <div className="lector-camara-wrapper">
        <div id="qr-reader" className="lector-camara" />

        {validando && (
          <div className="lector-overlay lector-overlay--validando">
            <p>Validando credencial...</p>
          </div>
        )}

        {resultado.tipo && (
          <div
            className={`lector-overlay lector-overlay--${resultado.tipo}`}
            role="status"
          >
            {resultado.tipo === 'exito' ? (
              <CheckCircle2 size={48} className="lector-overlay-icono" />
            ) : (
              <XCircle size={48} className="lector-overlay-icono" />
            )}
            <h3 className="lector-overlay-mensaje">{resultado.mensaje}</h3>
            {resultado.nombre && (
              <p className="lector-overlay-nombre">{resultado.nombre}</p>
            )}
            {resultado.tipo === 'error' && resultado.estadoFinanciero && (
              <p className="lector-overlay-estado-financiero">
                Estado financiero: {resultado.estadoFinanciero}
              </p>
            )}
            <button className="lector-overlay-ok" onClick={cerrarResultado}>
              Ok
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
