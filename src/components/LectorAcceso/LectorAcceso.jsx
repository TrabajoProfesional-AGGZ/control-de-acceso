import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { fetchTo } from '../../utils/utils'; 

export const LectorAcceso = () => {
  const [estado, setEstado] = useState('escaneando');
  const [mensaje, setMensaje] = useState('');
  
  // Usamos useRef para guardar la instancia del escáner y que no se pierda entre renders
  const scannerRef = useRef(null);

  useEffect(() => {
    // Solo lo inicializamos si no existe
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false 
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    async function onScanSuccess(decodedText) {
      // Pausamos el escáner usando la referencia
      if (scannerRef.current) scannerRef.current.pause(true);
      setEstado('validando');

      try {
        const partes = decodedText.split('|');
        if (partes.length !== 2) throw new Error('Formato de QR no reconocido');

        const res = await fetchTo('/api/v1/accesos/validar', 'POST', {
          qr_data: decodedText,
        });

        if (res.ok) {
          const data = await res.json();
          setEstado('exito');
          setMensaje(`¡Acceso permitido para ${data.nombre}!`);
        } else {
          setEstado('error');
          setMensaje('QR inválido o expirado.');
        }
      } catch (error) {
        setEstado('error');
        setMensaje(error.message === 'Formato de QR no reconocido' 
          ? 'El QR escaneado no pertenece a SocioUnido.' 
          : 'Error procesando el código.'
        );
      }
      
      // A los 3 segundos volvemos a escanear
      setTimeout(() => {
        setEstado('escaneando');
        if (scannerRef.current) scannerRef.current.resume();
      }, 3000);
    }

    function onScanFailure(error) {
      console.warn(`Escaneo fallido: ${error}`);
    }

    // Cleanup: se ejecuta cuando tocás el botón "Volver al inicio"
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []); // <-- El arreglo vacío asegura que se ejecute una sola vez

  return (
    <div className="lector-container" style={{ textAlign: 'center', padding: '16px', width: '100%' }}>
      <h2>Control de Acceso</h2>
      
      {/* Eliminamos el display 'none', el .pause() ya detiene la cámara correctamente */}
      <div 
        id="qr-reader" 
        style={{ margin: '0 auto', maxWidth: '400px', width: '100%', overflow: 'hidden', borderRadius: '12px' }}
      />
      
      {estado === 'validando' && (
        <div style={{ color: 'var(--color-text-secondary)', padding: '20px' }}>
          Validando credencial en el servidor...
        </div>
      )}
      
      {estado === 'exito' && (
         <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '16px' }}>
           <h3>✓ {mensaje}</h3>
         </div>
      )}
      
      {estado === 'error' && (
         <div style={{ backgroundColor: '#F44336', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '16px' }}>
           <h3>✕ {mensaje}</h3>
         </div>
      )}
    </div>
  );
};