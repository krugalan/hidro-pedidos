import { useEffect, useRef, useState } from "react";
import config from "../config";
import { getCliente, saveCliente } from "../lib/cliente";
import { siguienteNumeroPedido } from "../lib/numeroPedido";
import { armarLinkWhatsApp } from "../lib/whatsapp";
import type { ItemCarrito, TipoEntrega } from "../types";
import type { Zona } from "../types/entities";
import styles from "./HojaCierre.module.css";

interface Props {
  items: ItemCarrito[];
  subtotal: number;
  zonas: Zona[];
  onCerrar: () => void;
}

const formatPeso = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);

export function HojaCierre({ items, subtotal, zonas, onCerrar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmacion, setConfirmacion] = useState(false);
  const [numeroPedido] = useState(() => siguienteNumeroPedido());

  const clienteGuardado = getCliente();

  const [nombre, setNombre] = useState(clienteGuardado?.nombre ?? "");
  const [email, setEmail] = useState(clienteGuardado?.email ?? "");
  const [direccion, setDireccion] = useState(clienteGuardado?.direccion ?? "");
  const [entrega, setEntrega] = useState<TipoEntrega>(clienteGuardado?.entrega ?? null);
  const [zonaId, setZonaId] = useState(clienteGuardado?.zona_id ?? "");
  const [notas, setNotas] = useState("");

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

  // Reset zona when switching delivery type
  useEffect(() => { setZonaId(""); }, [entrega]);

  const cerrar = () => dialogRef.current?.close();
  const handleBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) cerrar();
  };

  const zonaSeleccionada = zonas.find((z) => z.id === zonaId);
  const nombreValido = nombre.trim().length >= 2;
  const direccionValida = direccion.trim().length >= 5;
  const necesitaDireccion = entrega === "domicilio";
  const necesitaZona = entrega !== null && (
    (entrega === "domicilio" && zonasDelivery.length > 0) ||
    (entrega === "retiro" && zonasRetiro.length > 0)
  );
  const zonaValida = !necesitaZona || zonaId !== "";

  const pedidoCompleto =
    items.length > 0 &&
    entrega !== null &&
    nombreValido &&
    zonaValida &&
    (necesitaDireccion ? direccionValida : true);

  const total = entrega === "domicilio" ? subtotal + config.envioCosto : subtotal;

  let mensajeFaltante = "";
  if (items.length === 0) mensajeFaltante = "Agregá al menos un producto.";
  else if (entrega === null) mensajeFaltante = "Elegí envío o retiro.";
  else if (!nombreValido) mensajeFaltante = "Completá tu nombre.";
  else if (necesitaDireccion && !direccionValida) mensajeFaltante = "Completá la dirección de entrega.";
  else if (!zonaValida) mensajeFaltante = "Seleccioná una zona.";

  const link = pedidoCompleto
    ? armarLinkWhatsApp(items, nombre.trim(), entrega, direccion.trim(), notas, numeroPedido, zonaSeleccionada?.nombre)
    : "#";

  const handleEnviar = (e: React.MouseEvent) => {
    if (!pedidoCompleto) { e.preventDefault(); return; }
    saveCliente({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      entrega,
      email: email.trim() || undefined,
      zona_id: zonaId || undefined,
      zona_nombre: zonaSeleccionada?.nombre,
    });
    setConfirmacion(true);
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClick={handleBackdrop} aria-labelledby="hoja-titulo">
      <div className={styles.hoja}>
        <div className={styles.cabecera}>
          <div>
            <h2 id="hoja-titulo" className={styles.titulo}>Tu pedido</h2>
            <span className={styles.numeroPedido}>#{numeroPedido}</span>
          </div>
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

            {/* Zona de retiro */}
            {entrega === "retiro" && zonasRetiro.length > 0 && (
              <div className={styles.campo} style={{ marginTop: "0.75rem" }}>
                <label className={styles.label} htmlFor="zona-retiro">Punto de retiro</label>
                <select id="zona-retiro" className={styles.input} value={zonaId} onChange={(e) => setZonaId(e.target.value)} required>
                  <option value="">Seleccioná un punto…</option>
                  {zonasRetiro.map((z) => (
                    <option key={z.id} value={z.id}>{z.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Zona de delivery */}
            {entrega === "domicilio" && zonasDelivery.length > 0 && (
              <div className={styles.campo} style={{ marginTop: "0.75rem" }}>
                <label className={styles.label} htmlFor="zona-delivery">Zona</label>
                <select id="zona-delivery" className={styles.input} value={zonaId} onChange={(e) => setZonaId(e.target.value)} required>
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

          {confirmacion && (
            <div className={styles.confirmacion} role="status">
              Se abrió WhatsApp con tu pedido. Tocá enviar en el chat para confirmarlo.
            </div>
          )}
        </div>

        <div className={styles.pie}>
          <div className={styles.totalFila}>
            <span className={styles.totalLabel}>{entrega === "domicilio" ? "Total con envío" : "Total"}</span>
            <span className={styles.totalMonto}>{formatPeso(total)}</span>
          </div>

          <a
            href={pedidoCompleto ? link : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btnWhatsApp} ${!pedidoCompleto ? styles.btnDeshabilitado : ""}`}
            aria-disabled={!pedidoCompleto}
            onClick={handleEnviar}
            role="button"
          >
            Enviar pedido por WhatsApp
          </a>

          {mensajeFaltante && (
            <p className={styles.faltante} aria-live="polite" role="status">{mensajeFaltante}</p>
          )}
        </div>
      </div>
    </dialog>
  );
}
