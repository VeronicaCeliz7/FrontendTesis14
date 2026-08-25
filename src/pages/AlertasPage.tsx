import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { obtenerDecisionesRecientes } from '../services/decisiones.service';

// ✅ FUNCIÓN SEGURA PARA FORMATEAR NDVI
const formatearNDVI = (ndvi: any): string => {
  if (ndvi === null || ndvi === undefined) return 'N/A';
  const num = typeof ndvi === 'number' ? ndvi : parseFloat(ndvi);
  return isNaN(num) ? 'N/A' : num.toFixed(3);
};

const AlertasPage = () => {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        setCargando(true);
        const decisiones = await obtenerDecisionesRecientes();
        
        // Convertir decisiones en alertas
        const alertasConvertidas = decisiones.map((dec: any) => {
          let tipo = 'Alerta';
          let mensaje = '';
          let prioridad = 'Media';
          
          if (dec.semaforo === '🟢 Corte') {
            tipo = 'Corte';
            mensaje = `Lote #${dec.lote_id} tiene NDVI óptimo (${formatearNDVI(dec.ndvi_actual)}) para corte`;
            prioridad = 'Alta';
          } else if (dec.semaforo === '🟡 Esperar') {
            tipo = 'Espera';
            mensaje = `Lote #${dec.lote_id} en espera con NDVI ${formatearNDVI(dec.ndvi_actual)}`;
            prioridad = 'Media';
          } else if (dec.semaforo === '🔴 Riesgo') {
            tipo = 'Riesgo';
            mensaje = `Lote #${dec.lote_id} en riesgo con NDVI ${formatearNDVI(dec.ndvi_actual)}`;
            prioridad = 'Alta';
          } else {
            mensaje = `Lote #${dec.lote_id} - Estado: ${dec.semaforo || 'Sin clasificar'}`;
          }
          
          return {
            id: dec.id,
            tipo: tipo,
            mensaje: mensaje,
            fecha: dec.fecha_analisis ? new Date(dec.fecha_analisis).toLocaleDateString() : 'Fecha no disponible',
            estado: 'Pendiente',
            lote: `Lote #${dec.lote_id}`,
            prioridad: prioridad,
            semaforo: dec.semaforo || '🟡 Esperar',
            ndvi: dec.ndvi_actual,
          };
        });
        
        setAlertas(alertasConvertidas.slice(0, 10));
      } catch (error) {
        console.error('Error cargando alertas:', error);
        setError('Error al cargar las alertas');
      } finally {
        setCargando(false);
      }
    };

    cargarAlertas();
  }, []);

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'Pendiente': 'bg-yellow-500 hover:bg-yellow-600',
      'Atendida': 'bg-green-500 hover:bg-green-600',
    };
    return colors[estado] || 'bg-gray-500';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      'Alta': 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      'Media': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      'Baja': 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    };
    return colors[prioridad] || 'text-gray-600 bg-gray-50';
  };

  const getSemaforoIcon = (semaforo: string) => {
    switch (semaforo) {
      case '🟢 Corte':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case '🟡 Esperar':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case '🔴 Riesgo':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="text-4xl mb-2">❌</p>
          <p className="text-lg font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Alertas de Corte
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Alertas para cortar la alfalfa según NDVI
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {alertas.filter(a => a.estado === 'Pendiente').length} pendientes
          </Badge>
          <Button 
            variant="outline"
            onClick={() => {
              setAlertas(alertas.map(a => ({ ...a, estado: 'Atendida' })));
            }}
          >
            Marcar todo como leído
          </Button>
        </div>
      </div>

      {/* Lista de alertas */}
      {alertas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No hay alertas
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Las alertas aparecerán aquí cuando se analicen los lotes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta) => (
            <Card key={alerta.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="mt-1">
                    {getSemaforoIcon(alerta.semaforo)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {alerta.tipo}
                      </h3>
                      <Badge className={`${getPrioridadColor(alerta.prioridad)} border`}>
                        {alerta.prioridad}
                      </Badge>
                      <Badge className={`${getEstadoColor(alerta.estado)} text-white`}>
                        {alerta.estado}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {alerta.mensaje}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alerta.lote}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alerta.fecha}
                      </span>
                      {alerta.ndvi && (
                        <span className="flex items-center gap-1">
                          📊 NDVI: {formatearNDVI(alerta.ndvi)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 flex-shrink-0">
                    {alerta.estado === 'Pendiente' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setAlertas(alertas.map(a => 
                            a.id === alerta.id ? { ...a, estado: 'Atendida' } : a
                          ));
                        }}
                      >
                        Marcar atendida
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasPage;