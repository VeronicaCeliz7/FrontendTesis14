// src/components/forms/LaborForm.tsx
import { useState, useRef } from 'react';
import { crearLabor, actualizarLabor, CrearLaborData } from '../../services/labores.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { FileText, X, Loader2, Eye, Camera, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

// =============================================
// TIPOS
// =============================================
interface LaborInicial {
    id: number;
    lote_id: number;
    categoria: string;
    tipo: string;
    fecha: string;
    producto?: string;
    dosis?: number;
    plaga?: string;
    semilla?: string;
    observaciones?: string;
    metadata?: {
        operador?: string;
        maquinaria?: string;
        tipo_maquina?: string;
        clasificacion?: string;
        marca_modelo?: string;
        unidad?: string;
        cantidad_total?: number;
        calidad?: {
            excelente?: number;
            media?: number; // Ya no está "buena"
        };
        receta_url?: string;
        fotos?: string[];
    };
}

interface LaborFormProps {
    loteId: number;
    laborInicial?: LaborInicial | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CATEGORIAS_TIPOS: Record<string, string[]> = {
    'Siembra': ['Siembra', 'Resiembra', 'Preparación del suelo', 'Enmienda (cal, yeso)'],
    'Riego': ['Riego', 'Fertirriego', 'Riego de auxilio'],
    'Fumigación': ['Herbicida', 'Fungicida', 'Insecticida', 'Fertilizante foliar', 'Fertilizante granulado', 'Bioestimulante', 'Otro'],
    'Corte': ['Corte con segadora', 'Corte con hélice', 'Corte con cortadora acondicionadora'],
    'Rastrillado': ['Rastrillado con rastrillo de 8 estrellas', 'Rastrillado con rastrillo de 16 estrellas', 'Rastrillado con otro'],
    'Enfardado': ['Rollo', 'Fardo', 'Megafardo'],
    'Labranza': ['Arado', 'Doble acción', 'Rastra', 'Disco', 'Cincel', 'Rollo', 'Subsolado', 'Nivelación'],
    'Arreglos y mantenimiento': ['Alambrado', 'Maquinaria', 'Bebederos', 'Caminos', 'Molino / bomba', 'Galpón / tinglado', 'Otro'],
    'Otros': ['Recolección de rollos', 'Análisis de suelo', 'Asesoramiento', 'Venta', 'Compra', 'Pesaje', 'Observación', 'Clima', 'Otro'],
};

const MAQUINAS_POR_TIPO: Record<string, string[]> = {
    'Rollo': ['Rotorenfardadora'],
    'Fardo': ['Enfardadora (fardos chicos)'],
    'Megafardo': ['Megaenfardadora (fardos grandes)'],
};

const CLASIFICACIONES_CUTTER = ['Sin cutter', 'Con cutter'];
const UNIDADES_DOSIS = ['L/ha', 'kg/ha', 'g/ha', 'cc/ha', 'L', 'kg'];
const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

// =============================================
// CONFIG CLOUDINARY
// =============================================
const CLOUDINARY_CLOUD_NAME = 'dgajevrs8';
const CLOUDINARY_PRESET = 'alfalfatrace_labores';

// =============================================
// Helper: subir archivo directo a Cloudinary (sin widget)
// =============================================
async function subirACloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', 'alfalfatrace/adjuntos');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: formData }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error subiendo a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
}

// =============================================
// Helper: detectar si es PDF o imagen
// =============================================
function esPdf(url: string) {
    return url.toLowerCase().includes('.pdf');
}

// =============================================
// Helper: capitalizar primera letra
// =============================================
function capitalizarPrimera(valor: string) {
    if (!valor) return valor;
    return valor.charAt(0).toUpperCase() + valor.slice(1);
}

// =============================================
// Helper: convertir número a string para inputs
// =============================================
function numToString(n: number | undefined | null): string {
    if (n === undefined || n === null) return '';
    return String(n);
}

const LaborForm = ({ loteId, laborInicial, onSuccess, onCancel }: LaborFormProps) => {
    const { token } = useAuth();
    
    // Refs para los inputs de archivos
    const archivoInputRef = useRef<HTMLInputElement>(null);
    const recetaInputRef = useRef<HTMLInputElement>(null);

    const esEdicion = !!laborInicial;

    // =============================================
    // ESTADO
    // =============================================
    const [categoria, setCategoria] = useState(laborInicial?.categoria || '');
    const [tipo, setTipo] = useState(laborInicial?.tipo || '');
    const [fecha, setFecha] = useState(
        laborInicial?.fecha
            ? laborInicial.fecha.split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [producto, setProducto] = useState(laborInicial?.producto || '');
    const [dosis, setDosis] = useState(numToString(laborInicial?.dosis));
    const [unidad, setUnidad] = useState(laborInicial?.metadata?.unidad || 'L/ha');
    const [plaga, setPlaga] = useState(laborInicial?.plaga || '');
    const [semilla, setSemilla] = useState(laborInicial?.semilla || '');
    
    // Ejecución Básica
    const [operador, setOperador] = useState(laborInicial?.metadata?.operador || '');
    const [maquinaria, setMaquinaria] = useState(laborInicial?.metadata?.maquinaria || '');
    
    // Enfardado
    const [tipoMaquina, setTipoMaquina] = useState(laborInicial?.metadata?.tipo_maquina || '');
    const [clasificacionMaquina, setClasificacionMaquina] = useState(laborInicial?.metadata?.clasificacion || '');
    const [marcaModelo, setMarcaModelo] = useState(laborInicial?.metadata?.marca_modelo || '');
    const [cantidadTotal, setCantidadTotal] = useState(
        numToString(laborInicial?.metadata?.cantidad_total)
    );
    const [calidadExcelente, setCalidadExcelente] = useState(
        numToString(laborInicial?.metadata?.calidad?.excelente)
    );
    const [calidadMedia, setCalidadMedia] = useState(
        numToString(laborInicial?.metadata?.calidad?.media)
    );

    // Opciones Avanzadas
    const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
    const [observaciones, setObservaciones] = useState(laborInicial?.observaciones || '');
    const [adjuntosUrls, setAdjuntosUrls] = useState<string[]>(
        laborInicial?.metadata?.fotos || []
    );
    
    // Receta (Fumigación)
    const [recetaUrl, setRecetaUrl] = useState<string | null>(
        laborInicial?.metadata?.receta_url || null
    );

    // UI
    const [subiendo, setSubiendo] = useState(false);
    const [archivoAbierto, setArchivoAbierto] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    // =============================================
    // SUBIR ARCHIVO (Genérico - Opciones Avanzadas)
    // =============================================
    const handleArchivoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setSubiendo(true);
        const toastId = toast.loading(`Subiendo archivo...`);

        try {
            for (const file of files) {
                const url = await subirACloudinary(file);
                setAdjuntosUrls(prev => [...prev, url]);
            }
            toast.success(`Subido correctamente`, { id: toastId });
        } catch (err: any) {
            toast.error(`Error al subir`, { id: toastId });
        } finally {
            setSubiendo(false);
            if (archivoInputRef.current) archivoInputRef.current.value = '';
        }
    };

    // =============================================
    // SUBIR RECETA (Fumigación)
    // =============================================
    const handleRecetaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setSubiendo(true);
        const toastId = toast.loading(`Subiendo receta...`);

        try {
            const url = await subirACloudinary(file);
            setRecetaUrl(url);
            toast.success(`Receta subida`, { id: toastId });
        } catch (err: any) {
            toast.error(`Error al subir receta`, { id: toastId });
        } finally {
            setSubiendo(false);
            if (recetaInputRef.current) recetaInputRef.current.value = '';
        }
    };

    const eliminarAdjunto = (index: number) => {
        setAdjuntosUrls(prev => prev.filter((_, i) => i !== index));
    };

    // =============================================
    // VALIDAR CALIDAD
    // =============================================
    const esEnfardado = ['Rollo', 'Fardo', 'Megafardo'].includes(tipo);
    
    const validarCalidad = (): boolean => {
        if (!esEnfardado) return true;
        const total = parseInt(cantidadTotal) || 0;
        const suma = (parseInt(calidadExcelente) || 0) + (parseInt(calidadMedia) || 0); // Solo Excelente y Media
        if (suma > 0 && suma !== total) {
            toast.error(`La suma de calidades (${suma}) no coincide con el total (${total})`);
            return false;
        }
        return true;
    };

    // =============================================
    // SUBMIT
    // =============================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoria) return toast.error('Seleccioná una categoría');
        if (!tipo) return toast.error('Seleccioná un tipo de labor');
        if (!fecha) return toast.error('La fecha es obligatoria');

        if (cantidadTotal && parseInt(cantidadTotal) < 0) return toast.error('La cantidad no puede ser negativa');

        if (!validarCalidad()) return;

        setCargando(true);
        try {
            const metadataExtra: any = {};
            if (tipoMaquina) metadataExtra.tipo_maquina = tipoMaquina;
            if (clasificacionMaquina) metadataExtra.clasificacion = clasificacionMaquina;
            if (marcaModelo) metadataExtra.marca_modelo = marcaModelo;

            if (esEnfardado && cantidadTotal) {
                metadataExtra.cantidad_total = parseInt(cantidadTotal);
                
                const calidad: any = {};
                if (calidadExcelente) calidad.excelente = parseInt(calidadExcelente);
                if (calidadMedia) calidad.media = parseInt(calidadMedia);
                if (Object.keys(calidad).length > 0) metadataExtra.calidad = calidad;
            }

            const data: CrearLaborData = {
                lote_id: loteId,
                categoria,
                tipo,
                fecha,
                producto: producto || undefined,
                dosis: dosis ? parseFloat(dosis) : undefined,
                unidad: unidad || undefined,
                plaga: plaga || undefined,
                semilla: semilla || undefined,
                operador: operador || undefined,
                maquinaria: maquinaria || tipoMaquina || undefined,
                observaciones: observaciones || undefined,
                receta_url: recetaUrl,
                fotos: adjuntosUrls.length > 0 ? adjuntosUrls : undefined,
                metadata_extra: Object.keys(metadataExtra).length > 0 ? metadataExtra : undefined,
            };

            if (esEdicion && laborInicial) {
                await actualizarLabor(laborInicial.id, { ...data, lote_id: loteId }, token!);
                toast.success('Labor actualizada');
            } else {
                await crearLabor(data, token!);
                toast.success('Labor registrada');
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Error al guardar la labor');
        } finally {
            setCargando(false);
        }
    };

    const tiposDisponibles = categoria ? CATEGORIAS_TIPOS[categoria] || [] : [];
    const maquinasDisponibles = tipo ? MAQUINAS_POR_TIPO[tipo] || [] : [];
    const mostrarInsumo = categoria === 'Fumigación';
    const mostrarSemilla = categoria === 'Siembra';

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* BÁSICOS */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Categoría *</Label>
                            <select
                                value={categoria}
                                onChange={(e) => {
                                    setCategoria(e.target.value);
                                    setTipo('');
                                    setTipoMaquina('');
                                    setClasificacionMaquina('');
                                }}
                                className={`${selectClass} mt-1`}
                            >
                                <option value="">Seleccionar</option>
                                {Object.keys(CATEGORIAS_TIPOS).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Tipo *</Label>
                            <select
                                value={tipo}
                                onChange={(e) => {
                                    setTipo(e.target.value);
                                    setTipoMaquina('');
                                    setClasificacionMaquina('');
                                }}
                                disabled={!categoria}
                                className={`${selectClass} mt-1 disabled:bg-gray-100`}
                            >
                                <option value="">{categoria ? 'Seleccionar' : 'Elegí categoría'}</option>
                                {tiposDisponibles.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <Label>Fecha *</Label>
                        <Input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* MÁQUINA (Enfardado) */}
                {maquinasDisponibles.length > 0 && (
                    <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-semibold text-sm text-yellow-800">Máquina</p>
                        <div>
                            <Label>Tipo de máquina</Label>
                            <select
                                value={tipoMaquina}
                                onChange={(e) => setTipoMaquina(e.target.value)}
                                className={`${selectClass} mt-1`}
                            >
                                <option value="">Seleccionar</option>
                                {maquinasDisponibles.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {tipoMaquina && (
                            <div>
                                <Label>Clasificación</Label>
                                <select
                                    value={clasificacionMaquina}
                                    onChange={(e) => setClasificacionMaquina(e.target.value)}
                                    className={`${selectClass} mt-1`}
                                >
                                    <option value="">Seleccionar</option>
                                    {CLASIFICACIONES_CUTTER.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <Label>Marca / modelo (opcional)</Label>
                            <Input value={marcaModelo} onChange={(e) => setMarcaModelo(e.target.value)} placeholder="Ej: New Holland" className="mt-1" />
                        </div>
                    </div>
                )}

                {/* PRODUCCIÓN (Enfardado) */}
                {esEnfardado && (
                    <div className="space-y-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <p className="font-semibold text-sm text-amber-800">Producción</p>
                        
                        <div>
                            <Label>Cantidad total de rollos/fardos</Label>
                            <Input
                                type="number"
                                min="0"
                                value={cantidadTotal}
                                onChange={(e) => setCantidadTotal(e.target.value)}
                                placeholder="Ej: 45"
                                className="mt-1"
                            />
                        </div>

                        {cantidadTotal && (
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Detalle por calidad (opcional)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs">Excelente</Label>
                                        <Input type="number" min="0" value={calidadExcelente} onChange={(e) => setCalidadExcelente(e.target.value)} placeholder="0" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Media</Label>
                                        <Input type="number" min="0" value={calidadMedia} onChange={(e) => setCalidadMedia(e.target.value)} placeholder="0" className="mt-1" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Total: {parseInt(cantidadTotal) || 0} |
                                    Suma: {(parseInt(calidadExcelente) || 0) + (parseInt(calidadMedia) || 0)}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* INSUMO (Fumigación) + RECETA */}
                {mostrarInsumo && (
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <p className="font-semibold text-sm text-red-800">Insumo y receta</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Producto</Label>
                                <Input value={producto} onChange={(e) => setProducto(e.target.value)} placeholder="Ej: Glifosato 48%" className="mt-1" />
                            </div>
                            <div>
                                <Label>Dosis</Label>
                                <Input type="number" step="0.01" min="0" value={dosis} onChange={(e) => setDosis(e.target.value)} placeholder="Ej: 2.0" className="mt-1" />
                            </div>
                            <div>
                                <Label>Unidad</Label>
                                <select
                                    value={unidad}
                                    onChange={(e) => setUnidad(e.target.value)}
                                    className={`${selectClass} mt-1`}
                                >
                                    {UNIDADES_DOSIS.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Label>Plaga objetivo</Label>
                                <Input value={plaga} onChange={(e) => setPlaga(e.target.value)} placeholder="Ej: Pulgón, Arañuela" className="mt-1" />
                            </div>
                        </div>

                        {/* BOTÓN ESPECÍFICO PARA LA RECETA */}
                        <div className="pt-2 border-t border-red-200">
                            <Label className="mb-2 block">Receta de fumigación (Obligatoria)</Label>
                            <input
                                ref={recetaInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleRecetaChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-red-300 text-red-700 hover:bg-red-100"
                                onClick={() => recetaInputRef.current?.click()}
                                disabled={subiendo}
                            >
                                <Camera className="mr-2 h-4 w-4" /> {recetaUrl ? 'Cambiar receta' : 'Adjuntar receta'}
                            </Button>
                            {recetaUrl && (
                                <div className="mt-2 text-sm text-green-600 flex items-center justify-between bg-white p-2 rounded border">
                                    <span>Receta adjuntada</span>
                                    <button type="button" onClick={() => setArchivoAbierto(recetaUrl)} className="text-blue-600 underline">Ver</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SEMILLA (Siembra) */}
                {mostrarSemilla && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <p className="font-semibold text-sm text-green-800">Semilla</p>
                        <div>
                            <Label>Variedad</Label>
                            <Input value={semilla} onChange={(e) => setSemilla(e.target.value)} placeholder="Ej: WL 903, Alfalfa 55" className="mt-1" />
                        </div>
                    </div>
                )}

                {/* EJECUCIÓN */}
                <div className="space-y-4">
                    <p className="font-semibold text-sm text-gray-700">Ejecución</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Operador</Label>
                            <Input
                                value={operador}
                                onChange={(e) => setOperador(e.target.value)}
                                onBlur={(e) => setOperador(capitalizarPrimera(e.target.value))}
                                placeholder="Ej: Juan Pérez"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Maquinaria (opcional)</Label>
                            <Input
                                value={maquinaria}
                                onChange={(e) => setMaquinaria(e.target.value)}
                                onBlur={(e) => setMaquinaria(capitalizarPrimera(e.target.value))}
                                placeholder="Ej: Pulverizadora Jacto"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* OPCIONES AVANZADAS (Colapsable) */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setMostrarAvanzado(!mostrarAvanzado)}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 w-full text-left"
                    >
                        <Settings2 className="h-4 w-4" />
                        Opciones Avanzadas (Observaciones y Otros archivos)
                    </button>

                    {mostrarAvanzado && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                            <div>
                                <Label>Observaciones</Label>
                                <Textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    onBlur={(e) => setObservaciones(capitalizarPrimera(e.target.value))}
                                    placeholder="Ej: Viento leve del norte..."
                                    rows={2}
                                    className="mt-1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Otros archivos (opcional)</Label>
                                <input
                                    ref={archivoInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    multiple
                                    className="hidden"
                                    onChange={handleArchivoChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => archivoInputRef.current?.click()}
                                    disabled={subiendo}
                                >
                                    <FileText className="mr-2 h-4 w-4" /> Adjuntar archivo genérico
                                </Button>

                                {adjuntosUrls.length > 0 && (
                                    <div className="space-y-1">
                                        {adjuntosUrls.map((url, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <button type="button" onClick={() => setArchivoAbierto(url)} className="flex-1 truncate text-left text-blue-600 underline">Archivo {i + 1}</button>
                                                <button type="button" onClick={() => setArchivoAbierto(url)} className="text-gray-500 hover:text-gray-700"><Eye className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => eliminarAdjunto(i)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={cargando} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={cargando} className="flex-1 bg-green-600 hover:bg-green-700">
                        {cargando ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                        ) : esEdicion ? (
                            'Actualizar labor'
                        ) : (
                            'Guardar labor'
                        )}
                    </Button>
                </div>
            </form>

            {/* MODAL DE VISTA PREVIA DEL ARCHIVO */}
            <Dialog open={!!archivoAbierto} onOpenChange={() => setArchivoAbierto(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Vista previa</DialogTitle>
                    </DialogHeader>
                    {archivoAbierto && (
                        <div className="flex items-center justify-center">
                            {esPdf(archivoAbierto) ? (
                                <iframe src={archivoAbierto} className="w-full h-[70vh] rounded" title="PDF" />
                            ) : (
                                <img src={archivoAbierto} alt="Adjunto" className="max-w-full max-h-[70vh] object-contain rounded" />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LaborForm;