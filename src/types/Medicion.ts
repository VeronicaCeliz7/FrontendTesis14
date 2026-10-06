export interface Medicion {
    id: number;
    lote_id: number;
    fecha: string;
    ndvi: number;
    fuente: string;
    baja_confianza?: boolean;
    es_corte?: boolean;      // ✅ NUEVO
    es_outlier?: boolean;    // ✅ NUEVO
}