import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle, CameraOff } from 'lucide-react';
import { fetchTo } from '../../utils/utils';
import './LectorAcceso.css';

const ESTADO_INICIAL = { tipo: null, mensaje: '', nombre: null, estadoFinanciero: null };

export const LectorAcceso = () => {
  const [resultado, setResultado] = useState(ESTADO_INICIAL);
  const [validando, setValidando] = useState(false);
  const [errorCamara, setErrorCamara] = useState(false);

  const scannerRef = useRef(null);
  const validandoRef = useRef(false);

  useEffect(() => {
    // html5-qrcode llama a video.play() internamente sin awaitear ni capturar la promesa
    // (ver RenderedCameraImpl.setupSurface en su código fuente). Si el elemento de video se
    // desmonta mientras esa promesa sigue pendiente -típicamente durante el doble montaje de
    // StrictMode en dev, ver `cancelado` más abajo- Chrome la rechaza con un AbortError que
    // nadie atrapa. No hay forma de engancharse a esa promesa desde afuera, así que se ignora
    // puntualmente ese caso conocido (y solo ese) para no ensuciar la consola con ruido inofensivo.
    function ignorarAbortDePlayInterrumpido(event) {
      if (
        event.reason instanceof DOMException &&
        event.reason.name === 'AbortError' &&
        event.reason.message.includes('play() request was interrupted')
      ) {
        event.preventDefault();
      }
    }
    window.addEventListener('unhandledrejection', ignorarAbortDePlayInterrumpido);

    let cancelado = false;
    const qrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = qrCode;

    function detener() {
      try {
        qrCode.stop().then(() => qrCode.clear()).catch(() => {});
      } catch {
        // el escáner nunca llegó a estado "scanning" (permiso pendiente/denegado) — nada que detener
      }
    }

    qrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      )
      .then(() => {
        // en StrictMode (dev) el efecto se monta, limpia y vuelve a montar antes de que
        // .start() resuelva — si ya nos limpiaron para cuando llega acá, hay que frenar
        // la cámara igual (si no, queda un stream de video huérfano).
        if (cancelado) detener();
      })
      .catch(() => {
        if (!cancelado) setErrorCamara(true);
      });

    async function onScanSuccess(decodedText) {
      if (validandoRef.current) return;
      validandoRef.current = true;
      try {
        qrCode.pause(true);
      } catch {
        // el escáner puede no estar corriendo todavía si el usuario escanea muy rápido
      }
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
      cancelado = true;
      detener();
      window.removeEventListener('unhandledrejection', ignorarAbortDePlayInterrumpido);
    };
  }, []);

  const cerrarResultado = () => {
    setResultado(ESTADO_INICIAL);
    validandoRef.current = false;
    try {
      scannerRef.current?.resume();
    } catch {
      // no-op si el escáner no llegó a iniciar
    }
  };

  return (
    <div className="lector-container">
      <div className="lector-camara-wrapper">
        <div id="qr-reader" className="lector-camara" />

        {errorCamara && (
          <div className="lector-overlay lector-overlay--error">
            <CameraOff size={48} className="lector-overlay-icono" />
            <h3 className="lector-overlay-mensaje">No se pudo acceder a la cámara</h3>
            <p className="lector-overlay-nombre">Revisá los permisos de cámara del navegador.</p>
          </div>
        )}

        {validando && (
          <div className="lector-overlay lector-overlay--validando">
            <p>Validando credencial...</p>
          </div>
        )}
      </div>

      {resultado.tipo && (
        <div
          className={`lector-resultado lector-resultado--${resultado.tipo}`}
          role="status"
        >
          {resultado.tipo === 'exito' ? (
            <CheckCircle2 size={48} className="lector-resultado-icono" />
          ) : (
            <XCircle size={48} className="lector-resultado-icono" />
          )}
          <h3 className="lector-resultado-mensaje">{resultado.mensaje}</h3>
          {resultado.nombre && (
            <p className="lector-resultado-nombre">{resultado.nombre}</p>
          )}
          {resultado.tipo === 'error' && resultado.estadoFinanciero && (
            <p className="lector-resultado-estado-financiero">
              Estado financiero: {resultado.estadoFinanciero}
            </p>
          )}
          <button className="lector-resultado-ok" onClick={cerrarResultado}>
            Ok
          </button>
        </div>
      )}
    </div>
  );
};
