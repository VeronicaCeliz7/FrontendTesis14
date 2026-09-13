import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarLotes, crearLote, actualizarLote, eliminarLote } from '../services/lotes.service';

export const useLotes = () => {
  const queryClient = useQueryClient();

  // =============================================
  // Query para obtener lotes
  // =============================================
  const {
    data: lotes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => listarLotes(),
  });

  // =============================================
  // Mutación para CREAR lote
  // =============================================
  const { mutate: agregarLote, isPending: creando } = useMutation({
    mutationFn: (nuevoLote: { nombre: string; poligono: any; hectareas: number; campo_id: number }) =>
      crearLote(nuevoLote.nombre, nuevoLote.poligono, nuevoLote.hectareas, nuevoLote.campo_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });

  // =============================================
  // Mutación para ACTUALIZAR lote
  // =============================================
  const { mutate: actualizarLoteMutacion, isPending: actualizando } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre?: string; hectareas?: number; poligono?: any; campo_id: number } }) =>
      actualizarLote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });

  // =============================================
  // Mutación para ELIMINAR lote
  // =============================================
  const { mutate: eliminarLoteMutacion, isPending: eliminando } = useMutation({
    mutationFn: ({ id, campoId }: { id: number; campoId: number }) =>
      eliminarLote(id, campoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });

  return {
    lotes,
    isLoading,
    error,
    agregarLote,
    creando,
    actualizarLote: actualizarLoteMutacion,
    actualizando,
    eliminarLote: eliminarLoteMutacion,
    eliminando,
  };
};