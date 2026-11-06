import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Cosecha, FechaEntrega } from "../../types/entities";
import {
  diferenciaDias, fechaConAnio, fechaLarga, fechaTitulo, nombreCorto, ordenarFechas,
  plural, semanaAnio, sumarDias,
} from "./cosechaUtils";
import { Dialogo, IconoCerrar, IconoMas, MiniCalendario } from "./CosechaUI";
import styles from "./Admin.module.css";

interface Fila {
  fecha: string;
  origen?: FechaEntrega;
}

const SEMANA = 7;

function textoDesplazamiento(dias: number): string {
  if (dias === SEMANA) return "una semana después";
  if (dias > 0 && dias % SEMANA === 0) return `${dias / SEMANA} semanas después`;
  return dias > 0 ? plural(dias, "día después", "días después") : "en las fechas equivalentes";
}

export function NuevaCosechaDialog({ cosechas, onCerrar }: { cosechas: Cosecha[]; onCerrar: () => void }) {
  const navigate = useNavigate();

  const anterior = useMemo(
    () => [...cosechas].sort((a, b) => b.fecha_cosecha.localeCompare(a.fecha_cosecha))[0],
    [cosechas],
  );

  const [fechaCosecha, setFechaCosecha] = useState(anterior ? sumarDias(anterior.fecha_cosecha, SEMANA) : "");
  const [copiar, setCopiar] = useState(Boolean(anterior));
  const [quitadas, setQuitadas] = useState<Set<string>>(new Set());
  const [manuales, setManuales] = useState<string[]>([]);
  const [agregando, setAgregando] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const desplazamiento = anterior && fechaCosecha ? diferenciaDias(anterior.fecha_cosecha, fechaCosecha) : SEMANA;

  const filas: Fila[] = useMemo(() => {
    const copiadas: Fila[] = copiar && anterior
      ? ordenarFechas(anterior.fechas)
          .filter((f) => !quitadas.has(f.id))
          .map((f) => ({ fecha: sumarDias(f.fecha, desplazamiento), origen: f }))
      : [];
    const yaEstan = new Set(copiadas.map((f) => f.fecha));
    const propias = manuales.filter((f) => !yaEstan.has(f)).map((fecha) => ({ fecha }));
    return [...copiadas, ...propias].sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [copiar, anterior, quitadas, manuales, desplazamiento]);

  const quitarFila = (fila: Fila) => {
    if (fila.origen) setQuitadas((prev) => new Set(prev).add(fila.origen!.id));
    else setManuales((prev) => prev.filter((f) => f !== fila.fecha));
  };

  const agregarFecha = () => {
    if (!nuevaFecha) return;
    if (filas.some((f) => f.fecha === nuevaFecha)) {
      setError("Esa fecha de entrega ya está en la lista.");
      return;
    }
    setError("");
    setManuales((prev) => [...prev, nuevaFecha]);
    setNuevaFecha("");
    setAgregando(false);
  };

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaCosecha || guardando) return;
    setGuardando(true);
    setError("");

    const { count, error: errorConteo } = await supabase
      .from("cosechas")
      .select("id", { count: "exact", head: true })
      .eq("fecha_cosecha", fechaCosecha);

    if (errorConteo) {
      setError("No pudimos crear la cosecha. Revisá la conexión y probá de nuevo.");
      setGuardando(false);
      return;
    }
    if ((count ?? 0) > 0) {
      setError(`Ya existe una cosecha para el ${fechaConAnio(fechaCosecha)}.`);
      setGuardando(false);
      return;
    }

    // Arranca cerrada: nada se publica hasta que la revises y la abras.
    const { data: creada, error: errorCosecha } = await supabase
      .from("cosechas")
      .insert({ nombre: semanaAnio(fechaCosecha), fecha_cosecha: fechaCosecha, activa: false })
      .select("id")
      .single();

    if (errorCosecha || !creada) {
      setError("No pudimos crear la cosecha. Revisá la conexión y probá de nuevo.");
      setGuardando(false);
      return;
    }

    try {
      await copiarContenido(creada.id);
      navigate(`/admin/cosechas/${creada.id}`);
    } catch {
      // Sin transacción desde el cliente: deshacemos a mano (borra items, fechas y puntos en cascada).
      await supabase.from("cosechas").delete().eq("id", creada.id);
      setError("No pudimos crear la cosecha y deshicimos los cambios. Probá de nuevo.");
      setGuardando(false);
    }
  };

  const copiarContenido = async (cosechaId: string) => {
    if (copiar && anterior) {
      const productos = (anterior.items ?? []).filter((i) => i.producto?.activo && i.producto_id);
      if (productos.length > 0) {
        const { error: err } = await supabase
          .from("cosecha_items")
          .insert(productos.map((i) => ({ cosecha_id: cosechaId, producto_id: i.producto_id })));
        if (err) throw err;
      }
    }

    if (filas.length === 0) return;

    const { data: fechasCreadas, error: errFechas } = await supabase
      .from("fechas_entrega")
      .insert(filas.map((f) => ({ cosecha_id: cosechaId, fecha: f.fecha, activa: true })))
      .select("id, fecha");
    if (errFechas) throw errFechas;

    const puntos = filas.flatMap((fila) => {
      const fechaId = fechasCreadas?.find((c) => c.fecha === fila.fecha)?.id;
      return (fila.origen?.zonas ?? []).map((z) => ({ fecha_entrega_id: fechaId, zona_id: z.zona_id }));
    });
    if (puntos.length > 0) {
      const { error: errPuntos } = await supabase.from("fecha_entrega_zonas").insert(puntos);
      if (errPuntos) throw errPuntos;
    }
  };

  return (
    <Dialogo titulo="Nueva cosecha" onCerrar={onCerrar} bloqueado={guardando}>
      <form className={styles.form} onSubmit={crear}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="fecha-cosecha">¿Cuándo cosechás?</label>
          <input
            id="fecha-cosecha"
            type="date"
            required
            aria-describedby="fecha-cosecha-ayuda"
            className={`${styles.input} ${styles.inputAlto}`}
            value={fechaCosecha}
            onChange={(e) => setFechaCosecha(e.target.value)}
          />
          <p id="fecha-cosecha-ayuda" className={styles.textoSec}>
            {fechaCosecha ? `Se va a llamar ${nombreCorto(semanaAnio(fechaCosecha))}` : "Elegí la fecha para ver el nombre de la cosecha"}
          </p>
        </div>

        <div className={styles.campo}>
          <p className={styles.label}>Fechas de entrega</p>
          {filas.length === 0 ? (
            <p className={styles.textoSec}>Todavía no hay fechas. Podés agregarlas ahora o después.</p>
          ) : (
            <ul className={styles.filasFecha}>
              {filas.map((fila) => (
                <li key={fila.fecha} className={styles.filaFecha}>
                  <MiniCalendario iso={fila.fecha} />
                  <div className={styles.filaFechaTexto}>
                    <strong className={styles.filaFechaTitulo}>{fechaTitulo(fila.fecha)}</strong>
                    <span className={styles.textoSec}>{textoOrigen(fila)}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.btnIcono}
                    aria-label={`Quitar ${fechaLarga(fila.fecha)}`}
                    onClick={() => quitarFila(fila)}
                  >
                    <IconoCerrar />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {agregando ? (
            <div className={styles.agregarForm}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="dialogo-nueva-fecha">Nueva fecha de entrega</label>
                <input
                  id="dialogo-nueva-fecha"
                  type="date"
                  autoFocus
                  className={`${styles.input} ${styles.inputAlto}`}
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarFecha(); } }}
                />
              </div>
              <div className={styles.agregarFormBotones}>
                <button type="button" className={`${styles.btnSecundario} ${styles.btnAlto}`} onClick={() => { setAgregando(false); setNuevaFecha(""); }}>Cancelar</button>
                <button type="button" className={`${styles.btnPrimario} ${styles.btnAlto}`} disabled={!nuevaFecha} onClick={agregarFecha}>Agregar</button>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.btnPunteado} onClick={() => setAgregando(true)}>
              <IconoMas />Agregar fecha
            </button>
          )}
        </div>

        {anterior && (
          <label className={styles.checkFila}>
            <input
              type="checkbox"
              checked={copiar}
              onChange={(e) => setCopiar(e.target.checked)}
            />
            <span>
              Copiar de la {nombreCorto(anterior.nombre)}: mismos productos y los mismos días con sus puntos de entrega, {textoDesplazamiento(desplazamiento)}
            </span>
          </label>
        )}

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        <div className={styles.dialogoAcciones}>
          <button
            type="button"
            className={`${styles.btnSecundario} ${styles.btnAlto}`}
            disabled={guardando}
            onClick={onCerrar}
          >
            Cancelar
          </button>
          <button type="submit" className={`${styles.btnPrimario} ${styles.btnAlto}`} disabled={guardando || !fechaCosecha}>
            {guardando ? "Creando…" : "Crear y revisar"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}

function textoOrigen(fila: Fila): string {
  if (!fila.origen) return "Fecha nueva, sin puntos de entrega";
  const puntos = fila.origen.zonas?.length ?? 0;
  const desde = fechaLarga(fila.origen.fecha);
  return puntos > 0
    ? `Copia ${plural(puntos, "punto", "puntos")} del ${desde}`
    : `Copia del ${desde}, que no tiene puntos`;
}
