import { useEffect, useRef, useState, type ReactNode } from "react";
import type { EstadoCosecha } from "../../lib/disponibilidad";
import { diaSemanaCorto, nombreCorto, numeroDia } from "./cosechaUtils";
import styles from "./Admin.module.css";

// ── Íconos ─────────────────────────────────────────────────────

function Icono({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconoCamion = () => (
  <Icono>
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="7.5" cy="18" r="1.75" />
    <circle cx="17.5" cy="18" r="1.75" />
  </Icono>
);

export const IconoPin = () => (
  <Icono>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icono>
);

export const IconoCheck = ({ size = 16 }: { size?: number }) => (
  <Icono size={size}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icono>
);

export const IconoMas = () => <Icono><path d="M12 5v14M5 12h14" /></Icono>;

export const IconoCerrar = () => <Icono><path d="M6 6l12 12M18 6L6 18" /></Icono>;

export const IconoVolver = () => <Icono><path d="M19 12H5M11 6l-6 6 6 6" /></Icono>;

export const IconoAviso = () => (
  <Icono>
    <path d="M12 4l9 16H3z" />
    <path d="M12 10v4M12 17.5v.01" />
  </Icono>
);

const IconoMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

// ── Mini-calendario ────────────────────────────────────────────

/** Decorativo: el título de al lado ya dice la fecha completa. */
export function MiniCalendario({ iso }: { iso: string }) {
  return (
    <span className={styles.miniCal} aria-hidden="true">
      <span className={styles.miniCalDia}>{diaSemanaCorto(iso)}</span>
      <span className={styles.miniCalNumero}>{numeroDia(iso)}</span>
    </span>
  );
}

// ── Badge de estado de la cosecha ──────────────────────────────

export function BadgeCosecha({ estado }: { estado: EstadoCosecha }) {
  switch (estado.tipo) {
    case "en_tienda":
      return <span className={`${styles.pill} ${styles.pillVerde}`}><IconoCheck size={14} />Abierta en la tienda</span>;
    case "en_espera":
      return <span className={`${styles.pill} ${styles.pillAmbar}`}>En espera · se publica cuando termine {nombreCorto(estado.antes.nombre)}</span>;
    case "sin_fechas":
      return <span className={`${styles.pill} ${styles.pillAmbar}`}>Abierta, sin fechas disponibles</span>;
    case "sin_productos":
      return <span className={`${styles.pill} ${styles.pillAmbar}`}>Abierta, sin productos</span>;
    case "cerrada":
      return <span className={`${styles.pill} ${styles.pillGris}`}>Cerrada</span>;
  }
}

// ── Menú "⋯" ───────────────────────────────────────────────────

export function MenuAcciones({ etiqueta, items }: {
  etiqueta: string;
  items: { texto: string; onSelect: () => void }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    menuRef.current?.querySelector("button")?.focus();
    const alClickear = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", alClickear);
    return () => document.removeEventListener("mousedown", alClickear);
  }, [abierto]);

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setAbierto(false);
      botonRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const botones = Array.from(menuRef.current?.querySelectorAll("button") ?? []);
      const actual = botones.indexOf(document.activeElement as HTMLButtonElement);
      const paso = e.key === "ArrowDown" ? 1 : -1;
      botones[(actual + paso + botones.length) % botones.length]?.focus();
    }
  };

  return (
    <div className={styles.menuWrap} ref={contenedorRef} onKeyDown={abierto ? alTeclear : undefined}>
      <button
        ref={botonRef}
        type="button"
        className={styles.btnIcono}
        aria-label={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
      >
        <IconoMenu />
      </button>
      {abierto && (
        <div ref={menuRef} className={styles.menu} role="menu" aria-label={etiqueta}>
          {items.map((item) => (
            <button
              key={item.texto}
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => { setAbierto(false); botonRef.current?.focus(); item.onSelect(); }}
            >
              {item.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Diálogo modal (mismo patrón <dialog> que Avisame y HojaCierre) ──

export function Dialogo({ titulo, onCerrar, bloqueado = false, children }: {
  titulo: string;
  onCerrar: () => void;
  /** Mientras está en true (guardando), no se puede cerrar. */
  bloqueado?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const focoPrevioRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener("close", onCerrar);
    return () => dialog.removeEventListener("close", onCerrar);
  }, [onCerrar]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    focoPrevioRef.current = document.activeElement as HTMLElement | null;
    dialog.showModal();
  }, []);

  // Al desmontarse (Cancelar, o después de guardar) el navegador no devuelve el foco solo.
  useEffect(() => () => { focoPrevioRef.current?.focus(); }, []);

  return (
    <dialog
      ref={ref}
      className={`${styles.exportDialog} ${styles.dialogoCosecha}`}
      aria-label={titulo}
      onCancel={(e) => { if (bloqueado) e.preventDefault(); }}
    >
      <div className={styles.exportContenido}>
        <div className={styles.exportHeader}>
          <h2 className={styles.exportTitulo}>{titulo}</h2>
          <button
            type="button"
            className={styles.btnIcono}
            aria-label="Cerrar"
            disabled={bloqueado}
            onClick={() => ref.current?.close()}
          >
            <IconoCerrar />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function DialogoConfirmar({ titulo, mensaje, textoConfirmar, onConfirmar, onCerrar }: {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  /** Devuelve un mensaje de error para mostrar, o null si salió bien. */
  onConfirmar: () => Promise<string | null>;
  onCerrar: () => void;
}) {
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");

  const confirmar = async () => {
    setTrabajando(true);
    setError("");
    const problema = await onConfirmar();
    setTrabajando(false);
    if (problema) setError(problema);
    else onCerrar();
  };

  return (
    <Dialogo titulo={titulo} onCerrar={onCerrar} bloqueado={trabajando}>
      <p className={styles.textoCuerpo}>{mensaje}</p>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.dialogoAcciones}>
        <button type="button" className={`${styles.btnSecundario} ${styles.btnAlto}`} disabled={trabajando} onClick={onCerrar}>
          Cancelar
        </button>
        <button type="button" className={styles.btnPeligro} disabled={trabajando} onClick={confirmar}>
          {trabajando ? "Eliminando…" : textoConfirmar}
        </button>
      </div>
    </Dialogo>
  );
}
