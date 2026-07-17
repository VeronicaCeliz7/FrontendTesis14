// TesisFrontend/src/utils/format.ts

/**
 * Formatea un valor NDVI de forma segura
 * @param ndvi - Valor NDVI (puede ser número, string, null, undefined)
 * @returns String formateado con 3 decimales o 'N/A'
 */
export const formatearNDVI = (ndvi: any): string => {
    if (ndvi === null || ndvi === undefined) return 'N/A';
    const num = typeof ndvi === 'number' ? ndvi : parseFloat(ndvi);
    return isNaN(num) ? 'N/A' : num.toFixed(3);
};

/**
 * Formatea un área (hectáreas) de forma segura
 * @param hectareas - Valor de hectáreas (puede ser número, string, null, undefined)
 * @returns String formateado con 2 decimales o '0.00'
 */
export const formatearArea = (hectareas: any): string => {
    if (hectareas === null || hectareas === undefined) return '0.00';
    const num = typeof hectareas === 'number' ? hectareas : parseFloat(hectareas);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

/**
 * Formatea un valor de radiación de forma segura
 * @param radiacion - Valor de radiación (puede ser número, string, null, undefined)
 * @returns String formateado con 1 decimal y 'MJ/m²' o 'N/A'
 */
export const formatearRadiacion = (radiacion: any): string => {
    if (radiacion === null || radiacion === undefined) return 'N/A';
    const num = typeof radiacion === 'number' ? radiacion : parseFloat(radiacion);
    return isNaN(num) ? 'N/A' : `${num.toFixed(1)} MJ/m²`;
};

/**
 * Formatea un valor numérico de forma segura
 * @param value - Valor numérico (puede ser número, string, null, undefined)
 * @param decimals - Número de decimales (por defecto 2)
 * @param fallback - Valor por defecto (por defecto '0.00')
 * @returns String formateado o fallback
 */
export const formatearNumero = (value: any, decimals: number = 2, fallback: string = '0.00'): string => {
    if (value === null || value === undefined) return fallback;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? fallback : num.toFixed(decimals);
};