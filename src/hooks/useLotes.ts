import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarLotes, crearLote } from '../services/lotes.service';
import { useAuth } from './useAuth';

export const useLotes = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Query para obtener lotes
  const {
    data: lotes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => listarLotes(token!), // ✅ pasamos el token como función
    enabled: !!token, // ✅ solo ejecuta si hay token
  });

  // Mutación para crear lote
  const { mutate: agregarLote, isPending: creando } = useMutation({
    mutationFn: (nuevoLote: { nombre: string; poligono: any; hectareas: number }) =>
      crearLote(nuevoLote.nombre, nuevoLote.poligono, nuevoLote.hectareas, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });

  return { lotes, isLoading, error, agregarLote, creando };
};