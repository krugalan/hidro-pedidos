import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { estadoCosecha, fechasDisponibles, hoyIso, type EstadoCosecha } from "../../lib/disponibilidad";
import type { Cosecha, FechaEntrega, Producto, Zona } from "../../types/entities";
import {
  cargarCosechas, estadoFecha, fechaConAnio, fechaLarga, fechaTitulo, nombreCorto,
  ordenarFechas, plural, resumenPuntos, type EstadoFecha,
} from "./cosechaUtils";
import {
  BadgeCosecha, DialogoConfirmar, IconoAviso, IconoCamion, IconoCheck, IconoMas, IconoPin,
  IconoVolver, MenuAcciones, MiniCalendario,
} from "./CosechaUI";
import styles from "./Admin.module.css";

type Escritura = () => PromiseLike<{ error: { message: string } | null }>;
type EstadoGuardado = "inactivo" | "guardando" | "guardado" | "error";
type Confirmacion = { tipo: "cosecha" } | { tipo: "fecha"; fecha: FechaEntrega } | null;

// Todos los estados con pedidos reales. Borrar la fecha o la cosecha los dejaría sin ese dato.
const ESTADOS_CON_PEDIDO = ["pendiente", "confirmado", "pagado", "entregado"];

export function CosechaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hoy = hoyIso();

  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [pedidosPorFecha, setPedidosPorFecha] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [guardado, setGuardado] = useState<EstadoGuardado>("inactivo");
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);

  const cosecha = cosechas.find((c) => c.id === id);

  const cargar = useCallback(async () => {
    try {
      const [todas, prods, zons] = await Promise.all([
        cargarCosechas(),
        supabase.from("productos").select("*").eq("activo", true).order("nombre"),
        supabase.from("zonas").select("*").order("nombre"),
      ]);
      if (prods.error) throw prods.error;
      if (zons.error) throw zons.error;
      setCosechas(todas);
      setProductos((prods.data ?? []) as Producto[]);
      setZonas((zons.data ?? []) as Zona[]);

      const fechaIds = todas.find((c) => c.id === id)?.fechas?.map((f) => f.id) ?? [];
      if (fechaIds.length > 0) {
        const { data } = await supabase
          .from("pedidos")
          .select("fecha_entrega_id")
          .in("fecha_entrega_id", fechaIds)
          .in("estado", ["pendiente", "pagado"]);
        const conteo: Record<string, number> = {};
        (data ?? []).forEach((p) => {
          if (p.fecha_entrega_id) conteo[p.fecha_entrega_id] = (conteo[p.fecha_entrega_id] ?? 0) + 1;
        });
        setPedidosPorFecha(conteo);
      }
      setErrorCarga("");
    } catch {
      setErrorCarga("No pudimos cargar la cosecha. Revisá la conexión y recargá la página.");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  // Cada cambio se guarda al instante. Las escrituras van en fila para que dos toques
  // rápidos sobre el mismo chip lleguen en orden; si alguna falla, se recarga desde la base.
  const colaRef = useRef<Promise<void>>(Promise.resolve());
  const pendientesRef = useRef(0);
  const huboErrorRef = useRef(false);

  const guardar = (escribir: Escritura) => {
    if (pendientesRef.current === 0) huboErrorRef.current = false;
    pendientesRef.current += 1;
    setGuardado("guardando");
    colaRef.current = colaRef.current.then(async () => {
      try {
        const { error } = await escribir();
        if (error) huboErrorRef.current = true;
      } catch {
        huboErrorRef.current = true;
      }
      pendientesRef.current -= 1;
      if (pendientesRef.current > 0) return;
      if (huboErrorRef.current) {
        setGuardado("error");
        await cargar();
      } else {
        setGuardado("guardado");
      }
    });
  };

  useEffect(() => {
    if (guardado !== "guardado") return;
    const t = setTimeout(() => setGuardado("inactivo"), 2500);
    return () => clearTimeout(t);
  }, [guardado]);

  const actualizarCosecha = (fn: (c: Cosecha) => Cosecha) =>
    setCosechas((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

  const actualizarFecha = (fechaId: string, fn: (f: FechaEntrega) => FechaEntrega) =>
    actualizarCosecha((c) => ({ ...c, fechas: c.fechas?.map((f) => (f.id === fechaId ? fn(f) : f)) }));

  if (cargando) return <div className={styles.pagina}><p className={styles.estado}>Cargando cosecha…</p></div>;

  if (!cosecha) {
    return (
      <div className={styles.pagina}>
        <p className={errorCarga ? styles.errorMsg : styles.textoCuerpo} role={errorCarga ? "alert" : undefined}>
          {errorCarga || "No encontramos esta cosecha."}
        </p>
        <Link to="/admin/cosechas" className={styles.linkVolver}><IconoVolver />Todas las cosechas</Link>
      </div>
    );
  }

  const cosechaId = cosecha.id;

  // ── Acciones ────────────────────────────────────────────────

  const toggleActiva = () => {
    const activa = !cosecha.activa;
    actualizarCosecha((c) => ({ ...c, activa }));
    guardar(() => supabase.from("cosechas").update({ activa }).eq("id", cosechaId));
  };

  const toggleProducto = (producto: Producto) => {
    const tiene = cosecha.items?.some((i) => i.producto_id === producto.id);
    if (tiene) {
      actualizarCosecha((c) => ({ ...c, items: c.items?.filter((i) => i.producto_id !== producto.id) }));
      guardar(() => supabase.from("cosecha_items").delete().eq("cosecha_id", cosechaId).eq("producto_id", producto.id));
    } else {
      actualizarCosecha((c) => ({
        ...c,
        items: [...(c.items ?? []), { id: `tmp-${producto.id}`, cosecha_id: cosechaId, producto_id: producto.id, created_at: "", producto }],
      }));
      guardar(() => supabase.from("cosecha_items").insert({ cosecha_id: cosechaId, producto_id: producto.id }));
    }
  };

  const setFechaActiva = (fecha: FechaEntrega, activa: boolean) => {
    actualizarFecha(fecha.id, (f) => ({ ...f, activa }));
    guardar(() => supabase.from("fechas_entrega").update({ activa }).eq("id", fecha.id));
  };

  const setPuntos = (fecha: FechaEntrega, zonasACambiar: Zona[], elegir: boolean) => {
    const actuales = new Set(fecha.zonas?.map((z) => z.zona_id));
    const cambian = zonasACambiar.filter((z) => actuales.has(z.id) !== elegir);
    if (cambian.length === 0) return;
    const ids = cambian.map((z) => z.id);

    if (elegir) {
      actualizarFecha(fecha.id, (f) => ({
        ...f,
        zonas: [
          ...(f.zonas ?? []),
          ...cambian.map((zona) => ({ id: `tmp-${zona.id}`, fecha_entrega_id: fecha.id, zona_id: zona.id, created_at: "", zona })),
        ],
      }));
      guardar(() => supabase.from("fecha_entrega_zonas").insert(ids.map((zona_id) => ({ fecha_entrega_id: fecha.id, zona_id }))));
    } else {
      actualizarFecha(fecha.id, (f) => ({ ...f, zonas: f.zonas?.filter((z) => !ids.includes(z.zona_id)) }));
      guardar(() => supabase.from("fecha_entrega_zonas").delete().eq("fecha_entrega_id", fecha.id).in("zona_id", ids));
    }
  };

  const agregarFecha = async (nueva: string): Promise<string | null> => {
    if (cosecha.fechas?.some((f) => f.fecha === nueva)) return "Esa fecha de entrega ya existe en esta cosecha.";
    await colaRef.current;
    const { data, error } = await supabase
      .from("fechas_entrega")
      .insert({ cosecha_id: cosechaId, fecha: nueva, activa: true })
      .select("*")
      .single();
    if (error || !data) return "No se pudo agregar la fecha. Probá de nuevo.";
    actualizarCosecha((c) => ({ ...c, fechas: [...(c.fechas ?? []), { ...(data as FechaEntrega), zonas: [] }] }));
    setGuardado("guardado");
    return null;
  };

  const eliminarFecha = async (fecha: FechaEntrega): Promise<string | null> => {
    await colaRef.current;
    const { count, error: errorConteo } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("fecha_entrega_id", fecha.id)
      .in("estado", ESTADOS_CON_PEDIDO);
    if (errorConteo) return "No pudimos revisar los pedidos de esta fecha. Probá de nuevo.";
    if ((count ?? 0) > 0) {
      return `Esta fecha tiene ${plural(count ?? 0, "pedido", "pedidos")}. Movelos a otra fecha antes de eliminarla, o cerrala para que no reciba nuevos.`;
    }
    const { error } = await supabase.from("fechas_entrega").delete().eq("id", fecha.id);
    if (error) return "No se pudo eliminar la fecha. Probá de nuevo.";
    actualizarCosecha((c) => ({ ...c, fechas: c.fechas?.filter((f) => f.id !== fecha.id) }));
    return null;
  };

  const eliminarCosecha = async (): Promise<string | null> => {
    await colaRef.current;
    const { count, error: errorConteo } = await supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .eq("cosecha_id", cosechaId)
      .in("estado", ESTADOS_CON_PEDIDO);
    if (errorConteo) return "No pudimos revisar los pedidos de esta cosecha. Probá de nuevo.";
    if ((count ?? 0) > 0) return `Esta cosecha tiene ${plural(count ?? 0, "pedido", "pedidos")} y no puede eliminarse. Podés cerrarla.`;

    // Los pedidos cancelados se borran junto con la cosecha, como hasta ahora.
    const { error: errorCancelados } = await supabase.from("pedidos").delete().eq("cosecha_id", cosechaId).eq("estado", "cancelado");
    if (errorCancelados) return "No se pudo eliminar la cosecha. Probá de nuevo.";
    const { error } = await supabase.from("cosechas").delete().eq("id", cosechaId);
    if (error) return "No se pudo eliminar la cosecha. Probá de nuevo.";
    navigate("/admin/cosechas");
    return null;
  };

  // ── Datos derivados ─────────────────────────────────────────

  const fechas = ordenarFechas(cosecha.fechas);
  const abiertas = fechas.filter((f) => { const e = estadoFecha(f, hoy); return e === "recibe" || e === "falta"; }).length;
  const elegidos = new Set(cosecha.items?.map((i) => i.producto_id));
  const productosElegidos = productos.filter((p) => elegidos.has(p.id)).length;
  const estado = estadoCosecha(cosecha, cosechas, hoy);

  return (
    <div className={`${styles.pagina} ${styles.paginaAncha}`}>
      <Link to="/admin/cosechas" className={styles.linkVolver}><IconoVolver />Todas las cosechas</Link>

      {errorCarga && <p className={`${styles.errorMsg} ${styles.errorDetalle}`} role="alert">{errorCarga}</p>}

      <header className={styles.detalleHeader}>
        <div className={styles.detalleTitulos}>
          <div className={styles.detalleTituloFila}>
            <h1 className={styles.detalleTitulo}>{nombreCorto(cosecha.nombre)}</h1>
            <BadgeCosecha estado={estado} />
          </div>
          <p className={styles.textoSec}>
            Cosecha el {fechaConAnio(cosecha.fecha_cosecha)} · {plural(productosElegidos, "producto", "productos")} · {plural(fechas.length, "fecha de entrega", "fechas de entrega")} ({plural(abiertas, "abierta", "abiertas")})
          </p>
        </div>
        <div className={styles.detalleAcciones}>
          <button
            type="button"
            className={cosecha.activa ? `${styles.btnSecundario} ${styles.btnAlto}` : `${styles.btnPrimario} ${styles.btnAlto}`}
            onClick={toggleActiva}
          >
            {cosecha.activa ? "Cerrar cosecha" : "Abrir cosecha"}
          </button>
          <MenuAcciones
            etiqueta="Más acciones de la cosecha"
            items={[{ texto: "Eliminar", onSelect: () => setConfirmacion({ tipo: "cosecha" }) }]}
          />
        </div>
      </header>

      <div className={styles.detalleGrid}>
        <div className={styles.detalleMain}>
          <section className={styles.card} aria-labelledby="seccion-productos">
            <div className={styles.seccionCabecera}>
              <h2 id="seccion-productos" className={styles.seccionTitulo}>1. Qué se cosecha esta semana</h2>
              <span className={styles.contador}>{productosElegidos} de {plural(productos.length, "producto", "productos")}</span>
            </div>
            <p className={styles.textoSec}>Solo estos productos se ofrecen en la tienda para cualquier fecha de entrega de esta cosecha</p>
            {productos.length === 0 ? (
              <p className={styles.textoSec}>No hay productos activos. Crealos en <Link to="/admin/productos" className={styles.linkTexto}>Productos</Link>.</p>
            ) : (
              <div className={styles.chips}>
                {productos.map((p) => (
                  <Chip key={p.id} texto={p.nombre} activo={elegidos.has(p.id)} onClick={() => toggleProducto(p)} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="seccion-fechas">
            <h2 id="seccion-fechas" className={`${styles.seccionTitulo} ${styles.seccionTituloSuelto}`}>2. Cuándo y dónde se entrega</h2>
            {!cosecha.activa && (
              <p className={`${styles.avisoAmbar} ${styles.avisoSeccion}`}>
                <IconoAviso />
                <span>La cosecha está cerrada: ninguna de estas fechas se ofrece en la tienda hasta que la abras.</span>
              </p>
            )}
            <div className={styles.fechasCards}>
              {fechas.map((f) => (
                <FechaCard
                  key={f.id}
                  fecha={f}
                  estado={estadoFecha(f, hoy)}
                  zonas={zonas}
                  pendientes={pedidosPorFecha[f.id] ?? 0}
                  onSetActiva={(activa) => setFechaActiva(f, activa)}
                  onSetPuntos={(lista, elegir) => setPuntos(f, lista, elegir)}
                  onEliminar={() => setConfirmacion({ tipo: "fecha", fecha: f })}
                />
              ))}
              <AgregarFecha hoy={hoy} onAgregar={agregarFecha} />
            </div>
          </section>
        </div>

        <VistaPrevia cosecha={cosecha} estado={estado} hoy={hoy} />
      </div>

      <div className={`${styles.toastGuardado} ${guardado === "error" ? styles.toastError : ""}`} role="status">
        {guardado === "guardando" && "Guardando…"}
        {guardado === "guardado" && <><IconoCheck />Guardado</>}
        {guardado === "error" && <><IconoAviso />No se pudo guardar el último cambio. Volvimos a cargar los datos: probá de nuevo.</>}
      </div>

      {confirmacion?.tipo === "cosecha" && (
        <DialogoConfirmar
          titulo={`¿Eliminar ${nombreCorto(cosecha.nombre)}?`}
          mensaje="Se borran la cosecha, sus fechas de entrega y sus pedidos cancelados. No se puede deshacer."
          textoConfirmar="Sí, eliminar"
          onConfirmar={eliminarCosecha}
          onCerrar={() => setConfirmacion(null)}
        />
      )}
      {confirmacion?.tipo === "fecha" && (
        <DialogoConfirmar
          titulo="¿Eliminar esta fecha?"
          mensaje={`Se borra el ${fechaLarga(confirmacion.fecha.fecha)} con sus puntos de entrega. No se puede deshacer.`}
          textoConfirmar="Sí, eliminar"
          onConfirmar={() => eliminarFecha(confirmacion.fecha)}
          onCerrar={() => setConfirmacion(null)}
        />
      )}
    </div>
  );
}

function Chip({ texto, activo, etiqueta, onClick }: { texto: string; activo: boolean; etiqueta?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${activo ? styles.chipActivo : ""}`}
      aria-pressed={activo}
      aria-label={etiqueta}
      onClick={onClick}
    >
      {activo && <IconoCheck />}
      {texto}
    </button>
  );
}

const PILLS: Record<EstadoFecha, { texto: string; clase: string }> = {
  recibe: { texto: "Recibe pedidos", clase: styles.pillVerde },
  falta: { texto: "Falta configurar", clase: styles.pillAmbar },
  cerrada: { texto: "Cerrada", clase: styles.pillGris },
  pasada: { texto: "Ya pasó", clase: styles.pillGris },
};

function FechaCard({ fecha, estado, zonas, pendientes, onSetActiva, onSetPuntos, onEliminar }: {
  fecha: FechaEntrega;
  estado: EstadoFecha;
  zonas: Zona[];
  pendientes: number;
  onSetActiva: (activa: boolean) => void;
  onSetPuntos: (zonas: Zona[], elegir: boolean) => void;
  onEliminar: () => void;
}) {
  const titulo = fechaTitulo(fecha.fecha);
  const pill = PILLS[estado];
  const abierta = estado === "recibe" || estado === "falta";
  const elegidas = new Set(fecha.zonas?.map((z) => z.zona_id));

  return (
    <article className={styles.fechaCard} aria-label={titulo}>
      <div className={styles.fechaCardCabecera}>
        <MiniCalendario iso={fecha.fecha} />
        <div className={styles.fechaCardTitulos}>
          <h3 className={styles.fechaCardTitulo}>{titulo}</h3>
          <p className={styles.textoSec}>{resumenPuntos(fecha)}</p>
          {pendientes > 0 && (
            <span className={styles.pendientesBadge}>
              {plural(pendientes, "pedido pendiente", "pedidos pendientes")}
            </span>
          )}
        </div>
        <div className={styles.fechaCardControles}>
          <span className={`${styles.pill} ${pill.clase}`}>{pill.texto}</span>
          {estado !== "pasada" && (
            <button
              type="button"
              role="switch"
              aria-checked={fecha.activa}
              aria-label={`Recibe pedidos: ${fechaLarga(fecha.fecha)}`}
              className={styles.switch}
              onClick={() => onSetActiva(!fecha.activa)}
            >
              <span className={styles.switchTexto}>Recibe pedidos</span>
              <span className={styles.switchPista} aria-hidden="true"><span className={styles.switchBola} /></span>
            </button>
          )}
          <MenuAcciones
            etiqueta={`Más acciones de la fecha ${fechaLarga(fecha.fecha)}`}
            items={[{ texto: "Eliminar fecha", onSelect: onEliminar }]}
          />
        </div>
      </div>

      {abierta && (
        <div className={styles.fechaCardCuerpo}>
          {estado === "falta" && (
            <p className={styles.avisoAmbar}>
              <IconoAviso />
              <span>Elegí al menos una zona o punto de retiro. Hasta entonces esta fecha no aparece en la tienda.</span>
            </p>
          )}
          <GrupoPuntos
            id={`delivery-${fecha.id}`}
            icono={<IconoCamion />}
            titulo="Delivery a domicilio"
            detalle="llevás el pedido a estas zonas"
            vacio="No hay zonas de delivery cargadas."
            zonas={zonas.filter((z) => z.tipo === "delivery")}
            elegidas={elegidas}
            contexto={fechaLarga(fecha.fecha)}
            onSetPuntos={onSetPuntos}
          />
          <GrupoPuntos
            id={`retiro-${fecha.id}`}
            icono={<IconoPin />}
            titulo="Retiro"
            detalle="el cliente pasa a buscar"
            vacio="No hay puntos de retiro cargados."
            zonas={zonas.filter((z) => z.tipo === "retiro")}
            elegidas={elegidas}
            contexto={fechaLarga(fecha.fecha)}
            onSetPuntos={onSetPuntos}
          />
        </div>
      )}

      {estado === "cerrada" && (
        <div className={`${styles.fechaCardCuerpo} ${styles.fechaCerradaCuerpo}`}>
          <p className={styles.textoSec}>No aparece en la tienda y no acepta pedidos nuevos. Los pedidos ya tomados para esta fecha se mantienen.</p>
          <button type="button" className={`${styles.btnSecundario} ${styles.btnAlto}`} onClick={() => onSetActiva(true)}>
            Volver a abrir
          </button>
        </div>
      )}

      {estado === "pasada" && (
        <div className={styles.fechaCardCuerpo}>
          <p className={styles.textoSec}>Esta fecha ya pasó y no aparece en la tienda. Los pedidos ya tomados para esta fecha se mantienen.</p>
        </div>
      )}
    </article>
  );
}

function GrupoPuntos({ id, icono, titulo, detalle, vacio, zonas, elegidas, contexto, onSetPuntos }: {
  id: string;
  icono: React.ReactNode;
  titulo: string;
  detalle: string;
  vacio: string;
  zonas: Zona[];
  elegidas: Set<string>;
  contexto: string;
  onSetPuntos: (zonas: Zona[], elegir: boolean) => void;
}) {
  const todas = zonas.length > 0 && zonas.every((z) => elegidas.has(z.id));
  const textoBoton = todas ? "Quitar todas" : "Elegir todas";

  return (
    <div className={styles.grupoPuntos} role="group" aria-labelledby={id}>
      <div className={styles.grupoPuntosCabecera}>
        <p id={id} className={styles.grupoPuntosTitulo}>
          {icono}
          <span><strong>{titulo}</strong> · {detalle}</span>
        </p>
        {zonas.length > 0 && (
          <button
            type="button"
            className={styles.btnTexto}
            aria-label={`${textoBoton}: ${titulo}, ${contexto}`}
            onClick={() => onSetPuntos(zonas, !todas)}
          >
            {textoBoton}
          </button>
        )}
      </div>
      {zonas.length === 0 ? (
        <p className={styles.textoSec}>{vacio} Se cargan en <Link to="/admin/configuracion" className={styles.linkTexto}>Configuración</Link>.</p>
      ) : (
        <div className={styles.chips}>
          {zonas.map((z) => (
            <Chip
              key={z.id}
              texto={z.nombre}
              activo={elegidas.has(z.id)}
              onClick={() => onSetPuntos([z], !elegidas.has(z.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AgregarFecha({ hoy, onAgregar }: { hoy: string; onAgregar: (fecha: string) => Promise<string | null> }) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (!abierto) {
    return (
      <button type="button" className={styles.btnPunteado} onClick={() => setAbierto(true)}>
        <IconoMas />Agregar fecha de entrega
      </button>
    );
  }

  const cerrar = () => { setAbierto(false); setValor(""); setError(""); };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor) return;
    setGuardando(true);
    setError("");
    const problema = await onAgregar(valor);
    setGuardando(false);
    if (problema) setError(problema);
    else cerrar();
  };

  return (
    <form className={styles.agregarForm} onSubmit={enviar}>
      <div className={styles.campo}>
        <label className={styles.label} htmlFor="nueva-fecha">Nueva fecha de entrega</label>
        <input
          id="nueva-fecha"
          type="date"
          autoFocus
          required
          min={hoy}
          className={`${styles.input} ${styles.inputAlto}`}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </div>
      <div className={styles.agregarFormBotones}>
        <button type="button" className={`${styles.btnSecundario} ${styles.btnAlto}`} onClick={cerrar}>Cancelar</button>
        <button type="submit" className={`${styles.btnPrimario} ${styles.btnAlto}`} disabled={!valor || guardando}>
          {guardando ? "Agregando…" : "Agregar"}
        </button>
      </div>
      {error && <p className={`${styles.errorMsg} ${styles.agregarFormError}`} role="alert">{error}</p>}
    </form>
  );
}

function notaVistaPrevia(estado: EstadoCosecha, hayFechas: boolean): string {
  if (!hayFechas) return "";
  switch (estado.tipo) {
    case "cerrada":
      return "La cosecha está cerrada: el cliente va a ver esto cuando la abras.";
    case "en_espera":
      return `Hoy se vende ${nombreCorto(estado.antes.nombre)}: el cliente va a ver esto cuando termine.`;
    case "sin_productos":
      return "Sin productos elegidos, el cliente no ve esta cosecha aunque tenga fechas.";
    default:
      return "";
  }
}

function VistaPrevia({ cosecha, estado, hoy }: { cosecha: Cosecha; estado: EstadoCosecha; hoy: string }) {
  const disponibles = fechasDisponibles(cosecha.fechas, hoy);
  const nota = notaVistaPrevia(estado, disponibles.length > 0);

  return (
    <aside className={styles.vistaPrevia} aria-labelledby="vista-previa-titulo">
      <p id="vista-previa-titulo" className={styles.vistaPreviaEtiqueta}>Así lo ve el cliente</p>
      {nota && <p className={styles.textoSec}>{nota}</p>}
      <div className={styles.vistaPreviaCaja}>
        <p className={styles.vistaPreviaTitulo}>¿Cuándo y dónde lo recibís?</p>
        {disponibles.length === 0 ? (
          <p className={styles.textoSec}>No hay fechas recibiendo pedidos: el cliente no puede comprar esta cosecha</p>
        ) : (
          disponibles.map((f) => {
            const puntos = [...(f.zonas ?? [])].sort((a, b) =>
              (a.zona?.tipo ?? "").localeCompare(b.zona?.tipo ?? "") || (a.zona?.nombre ?? "").localeCompare(b.zona?.nombre ?? "")
            );
            return (
              <div key={f.id} className={styles.vistaPreviaFecha}>
                <p className={styles.vistaPreviaFechaTitulo}>{fechaTitulo(f.fecha)}</p>
                <ul className={styles.vistaPreviaLista}>
                  {puntos.map((p) => (
                    <li key={p.zona_id}>{p.zona?.tipo === "retiro" ? "Retiro" : "Delivery"} en {p.zona?.nombre}</li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
