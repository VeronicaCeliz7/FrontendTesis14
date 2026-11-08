import { useState, useRef, useEffect } from 'react';
import localforage from 'localforage';
import { Mic, Square, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/axios'; // Ajustá la ruta si es necesario

export function GrabadoraVoz({ loteId }: { loteId: number }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [pendientes, setPendientes] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. EL VIGILANTE: Busca audios pendientes y los sube si hay internet
  const sincronizarAudios = async () => {
    if (!navigator.onLine) return;

    const keys = await localforage.keys();
    const audiosPendientes = keys.filter(k => k.startsWith('audio_lote_'));

    for (const key of audiosPendientes) {
      const data: any = await localforage.getItem(key);
      if (data && !data.sincronizado) {
        try {
          const formData = new FormData();
          formData.append('audio', data.audio, 'nota.webm');
          formData.append('loteId', String(data.loteId));

          // Hacemos la petición al backend
          await api.post('/notas/subir', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          // Si se subió bien, lo borramos del teléfono
          await localforage.removeItem(key);
          toast.success('🎙️ Audio sincronizado con AlfaTrace');
        } catch (error) {
          console.error('Error al sincronizar audio:', error);
        }
      }
    }
    actualizarContador();
  };

  const actualizarContador = async () => {
    const keys = await localforage.keys();
    const pendientes = keys.filter(k => k.startsWith('audio_lote_')).length;
    setPendientes(pendientes);
  };

  useEffect(() => {
    actualizarContador();
    // Escuchamos cuando vuelve el internet
    window.addEventListener('online', sincronizarAudios);
    // Intentamos sincronizar al cargar el componente
    sincronizarAudios();

    return () => window.removeEventListener('online', sincronizarAudios);
  }, []);

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Grabando...');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const guardarEnTelefono = async () => {
    if (!audioBlob) return;
    try {
      const audioKey = `audio_lote_${loteId}_${Date.now()}`;
      await localforage.setItem(audioKey, {
        loteId,
        fecha: new Date().toISOString(),
        audio: audioBlob,
        sincronizado: false
      });

      toast.success('Audio guardado. Enviando...');
      setAudioBlob(null);
      setAudioUrl(null);
      actualizarContador();
      
      // Forzamos el envío inmediato
      await sincronizarAudios(); 
      
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el audio');
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-white shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Nota de voz</span>
        {isRecording && <span className="text-xs text-red-500 animate-pulse">🔴 Grabando...</span>}
        {pendientes > 0 && <span className="text-xs text-blue-500 font-bold">⏳ {pendientes} pendientes</span>}
      </div>

      <div className="flex gap-2">
        {!isRecording && !audioUrl && (
          <button onClick={iniciarGrabacion} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
            <Mic size={16} /> Grabar
          </button>
        )}

        {isRecording && (
          <button onClick={detenerGrabacion} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
            <Square size={16} /> Detener
          </button>
        )}

        {audioUrl && (
          <>
            <button onClick={guardarEnTelefono} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
              💾 Guardar y Enviar
            </button>
            <button onClick={() => { setAudioUrl(null); setAudioBlob(null); }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300">
              <Trash2 size={16} /> Borrar
            </button>
          </>
        )}
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} className="w-full h-10 mt-2" />
      )}

      {pendientes > 0 && (
        <button onClick={sincronizarAudios} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded text-xs hover:bg-gray-200 mt-2">
          <UploadCloud size={14} /> Sincronizar ahora
        </button>
      )}
    </div>
  );
}