// src/utils/exportarLaboresPDF.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// =============================================
// TIPOS
// =============================================
interface Labor {
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
        hectareas?: number;
        horas?: number;
        unidad?: string;
        costo?: number;
        cantidad_total?: number;
        calidad?: {
            excelente?: number;
            buena?: number;
            media?: number;
        };
        receta_url?: string;
        fotos?: string[];
    };
}

interface Lote {
    id: number;
    nombre: string;
    hectareas?: number;
    campo_nombre?: string;
}

interface Usuario {
    nombre?: string;
    email?: string;
    dni?: string;
}

interface ExportarPDFParams {
    labores: Labor[];
    lote: Lote;
    usuario: Usuario | null;
    desde?: string;
    hasta?: string;
}

// =============================================
// CONFIG Y COLORES
// =============================================
const LOGO_URL = 'https://res.cloudinary.com/dgajevrs8/image/upload/v5wqkmef3qryv8e8dpzi.png';

const VERDE_OSCURO = [6, 78, 59] as [number, number, number];
const VERDE_MEDIO = [16, 122, 80] as [number, number, number];
const GRIS_CLARO = [245, 245, 245] as [number, number, number];
const GRIS_TEXTO = [107, 114, 128] as [number, number, number];

// =============================================
// HELPER: formatear fecha
// =============================================
function fmtFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR');
}

// =============================================
// EXPORTAR PDF
// =============================================
export async function exportarLaboresPDF({
    labores,
    lote,
    usuario,
    desde,
    hasta,
}: ExportarPDFParams) {

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginX = 15;

    // =============================================
    // ENCABEZADO CON LOGO
    // =============================================
    let y = 20;

    // Insertamos el logo
    try {
        doc.addImage(LOGO_URL, 'PNG', marginX, y - 7, 16, 16);
    } catch (error) {
        console.error('No se pudo cargar el logo en el PDF', error);
    }

    const textX = marginX + 20; 

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...VERDE_OSCURO);
    doc.text('AlfaTrace', textX, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Trazabilidad digital', textX, y);

    y += 5;
    doc.setDrawColor(...VERDE_MEDIO);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);

    // =============================================
    // DATOS DEL LOTE
    // =============================================
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...VERDE_OSCURO);
    doc.text('DATOS DEL LOTE', marginX, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const datosLote: [string, string][] = [
        ['Lote:', lote.nombre || '—'],
        ['Campo:', lote.campo_nombre || '—'],
        ['Hectáreas:', lote.hectareas ? `${lote.hectareas} ha` : '—'],
        ['Período:', desde || hasta ? `${desde || 'inicio'} al ${hasta || 'hoy'}` : 'Todo el historial'],
        ['Total labores:', String(labores.length)],
    ];

    datosLote.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, marginX, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), marginX + 35, y);
        y += 6;
    });

    // =============================================
    // TABLA DE LABORES
    // =============================================
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...VERDE_OSCURO);
    doc.text('HISTORIAL DE LABORES', marginX, y);

    y += 3;

    const filas = labores.map((l) => [
        fmtFecha(l.fecha),
        l.categoria || '—',
        l.tipo || '—',
        l.producto || '—',
        l.dosis ? `${l.dosis} ${l.metadata?.unidad || ''}` : '—',
        l.metadata?.operador || '—',
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Fecha', 'Categoría', 'Tipo', 'Producto', 'Dosis', 'Operador']],
        body: filas,
        margin: { left: marginX, right: marginX },
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: VERDE_OSCURO,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: GRIS_CLARO,
        },
    });

    // =============================================
    // DETALLE DE APLICACIONES
    // =============================================
    const aplicaciones = labores.filter(
        (l) => l.categoria === 'Fumigación' || l.producto
    );

    if (aplicaciones.length > 0) {
        y = (doc as any).lastAutoTable.finalY + 10;

        if (y > pageHeight - 60) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...VERDE_OSCURO);
        doc.text('DETALLE DE APLICACIONES', marginX, y);

        y += 7;

        aplicaciones.forEach((l) => {
            if (y > pageHeight - 40) {
                doc.addPage();
                y = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`${fmtFecha(l.fecha)} - ${l.tipo}`, marginX, y);
            y += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);

            if (l.producto) {
                doc.text(`Producto: ${l.producto}`, marginX + 5, y);
                y += 4;
            }
            if (l.dosis) {
                doc.text(`Dosis: ${l.dosis} ${l.metadata?.unidad || ''}`, marginX + 5, y);
                y += 4;
            }
            if (l.plaga) {
                doc.text(`Plaga: ${l.plaga}`, marginX + 5, y);
                y += 4;
            }
            if (l.metadata?.operador) {
                doc.text(`Operador: ${l.metadata.operador}`, marginX + 5, y);
                y += 4;
            }
            if (l.metadata?.maquinaria || l.metadata?.tipo_maquina) {
                doc.text(`Máquina: ${l.metadata.tipo_maquina || l.metadata.maquinaria}`, marginX + 5, y);
                y += 4;
            }
            if (l.metadata?.hectareas) {
                doc.text(`Superficie: ${l.metadata.hectareas} ha`, marginX + 5, y);
                y += 4;
            }

            if (l.metadata?.receta_url) {
                doc.setTextColor(0, 102, 204);
                doc.textWithLink('Receta: Ver documento', marginX + 5, y, {
                    url: l.metadata.receta_url,
                });
                doc.setTextColor(60, 60, 60);
                y += 4;
            }

            y += 3;
        });
    }

    // =============================================
    // FIRMA Y RESPONSABLE
    // =============================================
    if (y > pageHeight - 70) {
        doc.addPage();
        y = 20;
    }

    y += 10;
    doc.setDrawColor(...VERDE_MEDIO);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...VERDE_OSCURO);
    doc.text('RESPONSABLE', marginX, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${usuario?.nombre || '—'}`, marginX, y);

    if (usuario?.dni) {
        y += 5;
        doc.text(`DNI: ${usuario.dni}`, marginX, y);
    }

    y += 5;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, marginX, y);

    y += 20;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, marginX + 70, y);
    doc.line(marginX + 90, y, marginX + 160, y);

    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_TEXTO);
    doc.text('Firma', marginX, y);
    doc.text('Aclaración', marginX + 90, y);

    // =============================================
    // MARCA DE AGUA (Sutil, diagonal y centrada)
    // =============================================
    try {
        // 1. Bajamos la opacidad al 5% (casi invisible, no molesta al leer)
        doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
        
        const totalPaginas = doc.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
            doc.setPage(i);
            
            // 2. Achicamos un poco y rotamos 30 grados
            doc.addImage(
                LOGO_URL, 
                'PNG', 
                pageWidth / 2 - 40,  // X (lo centramos calculando el ancho)
                pageHeight / 2 - 40, // Y (lo centramos calculando el alto)
                80,                  // Ancho (más chico)
                80,                  // Alto
                undefined, 
                'FAST',
                30                   // Rotación diagonal
            );
        }
    } catch (error) {
        console.error('No se pudo poner la marca de agua', error);
    }

    // =============================================
    // PIE DE PÁGINA
    // =============================================
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...GRIS_TEXTO);
        doc.text(
            `Generado por AlfaTrace · ${new Date().toLocaleString('es-AR')}`,
            marginX,
            pageHeight - 8
        );
        doc.text(
            `Página ${i} de ${totalPaginas}`,
            pageWidth - marginX,
            pageHeight - 8,
            { align: 'right' }
        );
    }

    // =============================================
    // GUARDAR
    // =============================================
    const nombreArchivo = `AlfaTrace_${lote.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
}