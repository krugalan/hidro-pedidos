import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { getCliente, saveCliente } from "../lib/cliente";
import styles from "./Avisame.module.css";

interface Props {
  onCerrar: () => void;
}

export function Avisame({ onCerrar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const clienteGuardado = getCliente();

  const [nombre, setNombre] = useState(clienteGuardado?.nombre ?? "");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState(clienteGuardado?.email ?? "");
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const handleClose = () => onCerrar();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCerrar]);

  const cerrar = () => dialogRef.current?.close();
  const handleBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) cerrar();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    // Guardar en localStorage para pre-completar futuros pedidos
    saveCliente({ nombre: nombre.trim(), direccion: "", entrega: null, email: email.trim() || undefined });

    // Insertar en Supabase
    const { error: err } = await supabase.from("clientes").insert({
      nombre: nombre.trim(),
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
    });

    if (err && !err.message.includes("duplicate")) {
      setError("Hubo un error al guardarte. Intentá de nuevo.");
      setGuardando(false);
      return;
    }

    setListo(true);
    setGuardando(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleBackdrop}
      aria-labelledby="avisame-titulo"
    >
      <div className={styles.hoja}>
        <div className={styles.cabecera}>
          <h2 id="avisame-titulo" className={styles.titulo}>Avisame cuando esté lista</h2>
          <button className={styles.btnCerrar} onClick={cerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.cuerpo}>
          {listo ? (
            <div className={styles.exito}>
              <span className={styles.exitoEmoji}>🌱</span>
              <p className={styles.exitoTitulo}>¡Te anotamos!</p>
              <p className={styles.exitoDesc}>
                Te avisamos cuando abramos los pedidos de la próxima cosecha.
              </p>
              <button className={styles.btnPrimario} onClick={cerrar}>Listo</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.desc}>
                Dejá tus datos y te contactamos cuando habilitemos los pedidos de la próxima cosecha.
              </p>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="av-nombre">Tu nombre</label>
                <input
                  id="av-nombre"
                  type="text"
                  className={styles.input}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Ej: Laura Gómez"
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="av-whatsapp">
                  WhatsApp <span className={styles.opcional}>(opcional)</span>
                </label>
                <input
                  id="av-whatsapp"
                  type="tel"
                  className={styles.input}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 2254 123456"
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="av-email">
                  Email <span className={styles.opcional}>(opcional)</span>
                </label>
                <input
                  id="av-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="tu@email.com"
                />
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button type="submit" className={styles.btnPrimario} disabled={guardando}>
                {guardando ? "Guardando…" : "Avisame"}
              </button>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
