import { useEffect, useRef, useState } from "react";
import config from "../config";
import { getCliente, saveCliente } from "../lib/cliente";
import { armarMensaje } from "../lib/whatsapp";
import { supabase } from "../lib/supabase";
import type { ItemCarrito, TipoEntrega, PedidoResumen } from "../types";
import type { Zona, FechaEntrega } from "../types/entities";
import styles from "./HojaCierre.module.css";

interface Props {
  items: ItemCarrito[];
  subtotal: number;
  zonas: Zona[];
  fechas: FechaEntrega[];
  cosechaId?: string;
  onCerrar: () => void;
  onEnviado: (resumen: PedidoResumen) => void;
}

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

export function HojaCierre({ items, subtotal, zonas, fechas, cosechaId, onCerrar, onEnviado }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [enviando, setEnviando] = useState(false);

  const clienteGuardado = getCliente();

  const [nombre, setNombre] = useState(clienteGuardado?.nombre ?? "");
  const [email, setEmail] = useState(clienteGuardado?.email ?? "");
  const [direccion, setDireccion] = useState(clienteGuardado?.direccion ?? "");
  const [entrega, setEntrega] = useState<TipoEntrega>(clienteGuardado?.entrega ?? null);
  const [zonaId, setZonaId] = useState(clienteGuardado?.zona_id ?? "");
  const [notas, setNotas] = useState("");

  const hoy = new Date().toISOString().split("T")[0];
  const fechasActivas = fechas
    .filter((f) => f.activa && f.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const [fechaId, setFechaId] = useState(fechasActivas[0]?.id ?? "");
  const [eligiendoFecha, setEligiendoFecha] = useState(false);

  const fechaSeleccionada = fechasActivas.find((f) => f.id === fechaId);

  const zonasDelivery = zonas.filter((z) => z.tipo === "delivery");
  const zonasRetiro = zonas.filter((z) => z.tipo === "retiro");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const handleClose = () => onCerrar();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCerrar]);

  useEffect(() => { setZonaId(""); }, [entrega]);

  const cerrar = () => dialogRef.current?.close();

  const zonaSeleccionada = zonas.find((z) => z.id === zonaId);
  const nombreValido = nombre.trim().length >= 2;
  const direccionValida = direccion.trim().length >= 5;
  const necesitaDireccion = entrega === "domicilio";
  // La zona es siempre obligatoria una vez elegido el tipo de entrega
  const zonaValida = entrega === null || zonaId !== "";
  const fechaValida = fechasActivas.length === 0 || fechaId !== "";

  const pedidoCompleto =
    items.length > 0 &&
    fechaValida &&
    entrega !== null &&
    nombreValido &&
    zonaValida &&
    (necesitaDireccion ? direccionValida : true);

  const total = entrega === "domicilio" ? subtotal + config.envioCosto : subtotal;

  let mensajeFaltante = "";
  if (items.length === 0) mensajeFaltante = "Agregá al menos un producto.";
  else if (!fechaValida) mensajeFaltante = "Elegí una fecha de entrega.";
  else if (entrega === null) mensajeFaltante = "Elegí envío o retiro.";
  else if (!nombreValido) mensajeFaltante = "Completá tu nombre.";
  else if (necesitaDireccion && !direccionValida) mensajeFaltante = "Completá la dirección de entrega.";
  else if (!zonaValida) mensajeFaltante = "Seleccioná una zona.";

  const handleEnviar = async () => {
    if (!pedidoCompleto || enviando || entrega === null) return;
    setEnviando(true);

    // Abrir la ventana SINCRÓNICAMENTE antes de cualquier await.
    // Safari bloquea window.open() si se llama después de un await (pierde el contexto de user gesture).
    const waWindow = window.open("", "_blank");

    saveCliente({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      entrega,
      email: email.trim() || undefined,
      zona_id: zonaId || undefined,
      zona_nombre: zonaSeleccionada?.nombre,
    });

    let clienteId: string | undefined;
    let numero = 0;

    try {
      if (email.trim()) {
        const { data } = await supabase
          .from("clientes")
          .upsert({ nombre: nombre.trim(), email: email.trim() }, { onConflict: "email" })
          .select("id")
          .maybeSingle();
        clienteId = data?.id ?? undefined;
      } else {
        const { data } = await supabase
          .from("clientes")
          .insert({ nombre: nombre.trim() })
          .select("id")
          .maybeSingle();
        clienteId = data?.id ?? undefined;
      }

      const costoEnvio = entrega === "domicilio" ? config.envioCosto : 0;
      const { data: pedidoData } = await supabase
        .from("pedidos")
        .insert({
          cliente_id: clienteId ?? null,
          cosecha_id: cosechaId ?? null,
          fecha_entrega_id: fechaId || null,
          zona_id: zonaId || null,
          direccion_texto: entrega === "domicilio" ? direccion.trim() : null,
          tipo_entrega: entrega,
          estado: "pendiente",
          subtotal,
          costo_envio: costoEnvio,
          total,
          notas: notas.trim() || null,
        })
        .select("id, numero")
        .maybeSingle();

      numero = pedidoData?.numero ?? 0;

      if (pedidoData?.id) {
        await supabase.from("pedido_items").insert(
          items.map((item) => ({
            pedido_id: pedidoData.id,
            producto_id: item.id,
            nombre: item.nombre,
            precio_unitario: item.precio,
            cantidad: item.cantidad,
            subtotal: item.precio * item.cantidad,
          }))
        );
      }
    } catch {
      numero = 0;
    }

    const mensaje = armarMensaje(
      items, nombre.trim(), entrega, direccion.trim(), notas,
      numero, zonaSeleccionada?.nombre, fechaSeleccionada?.fecha,
    );
    const waUrl = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensaje)}`;

    // Asignar la URL final a la ventana ya abierta
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      // Fallback: si el bloqueador cerró la ventana, navegar en el mismo tab
      window.location.href = waUrl;
    }

    onEnviado({
      numero,
      nombre: nombre.trim(),
      items,
      subtotal,
      total,
      entrega,
      fechaIso: fechaSeleccionada?.fecha,
      zonaSeleccionada: zonaSeleccionada?.nombre,
    });

    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="hoja-titulo">
      <div className={styles.hoja}>
        <div className={styles.cabecera}>
          <h2 id="hoja-titulo" className={styles.titulo}>Tu pedido</h2>
          <button className={styles.btnCerrar} onClick={cerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.cuerpo}>
          <ul className={styles.listaItems}>
            {items.map((item) => (
              <li key={item.id} className={styles.lineaItem}>
                <span>{item.emoji} {item.cantidad} × {item.nombre}</span>
                <span className={styles.itemSubtotal}>{formatPeso(item.precio * item.cantidad)}</span>
              </li>
            ))}
          </ul>

          {/* Fecha de entrega */}
          <div className={styles.seccionFecha}>
            <p className={styles.seccionFechaLabel}>📅 Fecha de entrega</p>

            {fechasActivas.length === 0 ? (
              <p className={styles.sinFecha}>Pronto confirmamos la fecha de entrega.</p>
            ) : eligiendoFecha ? (
              <div className={styles.fechaOpciones}>
                {fechasActivas.map((f) => (
                  <button
                    key={f.id}
                    className={`${styles.fechaOpcion} ${f.id === fechaId ? styles.fechaOpcionActiva : ""}`}
                    onClick={() => { setFechaId(f.id); setEligiendoFecha(false); }}
                    type="button"
                  >
                    {fechaLarga(f.fecha)}
                    {f.hora_inicio && f.hora_fin && (
                      <span className={styles.fechaHora}>{f.hora_inicio.slice(0, 5)}–{f.hora_fin.slice(0, 5)}</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.fechaSeleccionadaFila}>
                <span className={styles.fechaSeleccionadaTexto}>
                  {fechaSeleccionada ? fechaLarga(fechaSeleccionada.fecha) : "Sin fecha"}
                  {fechaSeleccionada?.hora_inicio && fechaSeleccionada?.hora_fin && (
                    <span className={styles.fechaHora}> · {fechaSeleccionada.hora_inicio.slice(0, 5)}–{fechaSeleccionada.hora_fin.slice(0, 5)}</span>
                  )}
                </span>
                {fechasActivas.length > 1 && (
                  <button
                    className={styles.btnCambiarFecha}
                    onClick={() => setEligiendoFecha(true)}
                    type="button"
                  >
                    Elegir otra fecha
                  </button>
                )}
              </div>
            )}
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>¿Cómo lo recibís?</legend>
            <div className={styles.tarjetas}>
              <label className={`${styles.tarjeta} ${entrega === "domicilio" ? styles.tarjetaActiva : ""}`}>
                <input type="radio" name="entrega" value="domicilio" checked={entrega === "domicilio"} onChange={() => setEntrega("domicilio")} className={styles.radioOculto} />
                <span className={styles.tarjetaTitulo}>Envío a domicilio</span>
                <span className={styles.tarjetaSub}>Solo dentro de Pinamar</span>
                <span className={styles.tarjetaCosto}>+ {formatPeso(config.envioCosto)}</span>
              </label>

              <label className={`${styles.tarjeta} ${entrega === "retiro" ? styles.tarjetaActiva : ""}`}>
                <input type="radio" name="entrega" value="retiro" checked={entrega === "retiro"} onChange={() => setEntrega("retiro")} className={styles.radioOculto} />
                <span className={styles.tarjetaTitulo}>Retiro</span>
                <span className={styles.tarjetaSub}>Pasá a buscar tu pedido</span>
                <span className={styles.tarjetaCosto}>Sin cargo</span>
              </label>
            </div>

            {entrega === "retiro" && zonasRetiro.length > 0 && (
              <div className={styles.campo} style={{ marginTop: "0.75rem" }}>
                <label className={styles.label} htmlFor="zona-retiro">Punto de retiro</label>
                <select id="zona-retiro" className={styles.input} value={zonaId} onChange={(e) => setZonaId(e.target.value)}>
                  <option value="">Seleccioná un punto…</option>
                  {zonasRetiro.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {entrega === "domicilio" && zonasDelivery.length > 0 && (
              <div className={styles.campo} style={{ marginTop: "0.75rem" }}>
                <label className={styles.label} htmlFor="zona-delivery">Zona</label>
                <select id="zona-delivery" className={styles.input} value={zonaId} onChange={(e) => setZonaId(e.target.value)}>
                  <option value="">Seleccioná tu zona…</option>
                  {zonasDelivery.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>

          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nombre">Tu nombre</label>
              <input id="nombre" type="text" className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} minLength={2} required autoComplete="name" placeholder="Ej: Laura Gómez" />
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="email">
                Email <span className={styles.opcional}>(opcional)</span>
              </label>
              <input id="email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="para recibir novedades de la cosecha" />
            </div>

            {necesitaDireccion && (
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="direccion">Dirección en Pinamar</label>
                <input id="direccion" type="text" className={styles.input} value={direccion} onChange={(e) => setDireccion(e.target.value)} minLength={5} required autoComplete="street-address" placeholder="Ej: Av. Bunge 1200" />
                <p className={styles.ayuda}>Si hay timbre, depto o una referencia, sumala en notas.</p>
              </div>
            )}

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="notas">
                Notas <span className={styles.opcional}>(opcional)</span>
              </label>
              <textarea id="notas" className={`${styles.input} ${styles.textarea}`} value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Timbre, piso, referencia…" />
            </div>
          </div>

          <div className={styles.disclaimer}>
            Tené en cuenta que algunos productos pueden no estar disponibles al momento del retiro,
            y que los precios vigentes en ese momento son los que aplican.
          </div>

        </div>

        <div className={styles.pie}>
          <div className={styles.totalFila}>
            <span className={styles.totalLabel}>{entrega === "domicilio" ? "Total con envío" : "Total"}</span>
            <span className={styles.totalMonto}>{formatPeso(total)}</span>
          </div>

          {pedidoCompleto ? (
            <button
              className={styles.btnWhatsApp}
              onClick={handleEnviar}
              disabled={enviando}
              type="button"
            >
              {enviando ? "Enviando…" : "Enviar pedido por WhatsApp"}
            </button>
          ) : (
            <p className={styles.faltante} aria-live="polite" role="status">
              {mensajeFaltante}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
