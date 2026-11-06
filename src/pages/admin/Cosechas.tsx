import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { estadoCosecha, hoyIso } from "../../lib/disponibilidad";
import type { Cosecha } from "../../types/entities";
import { cargarCosechas, estadoFecha, fechaConAnio, nombreCorto, plural } from "./cosechaUtils";
import { BadgeCosecha, IconoMas } from "./CosechaUI";
import { NuevaCosechaDialog } from "./NuevaCosechaDialog";
import styles from "./Admin.module.css";

export function Cosechas() {
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);
  const hoy = hoyIso();

  useEffect(() => {
    cargarCosechas()
      .then(setCosechas)
      .catch(() => setError("No pudimos cargar las cosechas. Revisá la conexión y recargá la página."))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className={styles.pagina}><p className={styles.estado}>Cargando cosechas…</p></div>;

  return (
    <div className={styles.pagina}>
      <div className={styles.listaCabecera}>
        <h1 className={styles.detalleTitulo}>Cosechas</h1>
        <button type="button" className={`${styles.btnPrimario} ${styles.btnAlto} ${styles.btnConIcono}`} onClick={() => setCreando(true)}>
          <IconoMas />Nueva cosecha
        </button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {!error && cosechas.length === 0 && <p className={styles.textoSec}>Todavía no hay cosechas. Creá la primera con "Nueva cosecha".</p>}

      <ul className={styles.listaCosechas}>
        {cosechas.map((c) => {
          const productos = c.items?.filter((i) => i.producto?.activo).length ?? 0;
          const fechas = c.fechas ?? [];
          const abiertas = fechas.filter((f) => { const e = estadoFecha(f, hoy); return e === "recibe" || e === "falta"; }).length;
          return (
            <li key={c.id}>
              <Link to={`/admin/cosechas/${c.id}`} className={styles.filaCosecha}>
                <span className={styles.filaCosechaTitulos}>
                  <span className={styles.filaCosechaNombre}>{nombreCorto(c.nombre)}</span>
                  <span className={styles.textoSec}>Cosecha el {fechaConAnio(c.fecha_cosecha)}</span>
                  <span className={styles.textoSec}>
                    {plural(productos, "producto", "productos")} · {plural(fechas.length, "fecha de entrega", "fechas de entrega")} ({plural(abiertas, "abierta", "abiertas")})
                  </span>
                </span>
                <BadgeCosecha estado={estadoCosecha(c, cosechas, hoy)} />
              </Link>
            </li>
          );
        })}
      </ul>

      {creando && <NuevaCosechaDialog cosechas={cosechas} onCerrar={() => setCreando(false)} />}
    </div>
  );
}
