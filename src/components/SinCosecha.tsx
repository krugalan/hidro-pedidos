import { useEffect, useState } from "react";
import type { Cosecha } from "../types/entities";
import styles from "./SinCosecha.module.css";

interface Countdown { dias: number; horas: number; minutos: number; segundos: number }

function useCountdown(fecha: string | null): Countdown | null {
  const [left, setLeft] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!fecha) return;

    const calcular = () => {
      const ahora = Date.now();
      const objetivo = new Date(fecha + "T00:00:00").getTime();
      const diff = objetivo - ahora;
      if (diff <= 0) { setLeft(null); return; }
      setLeft({
        dias:     Math.floor(diff / 86400000),
        horas:    Math.floor((diff % 86400000) / 3600000),
        minutos:  Math.floor((diff % 3600000) / 60000),
        segundos: Math.floor((diff % 60000) / 1000),
      });
    };

    calcular();
    const id = setInterval(calcular, 1000);
    return () => clearInterval(id);
  }, [fecha]);

  return left;
}

const pad = (n: number) => String(n).padStart(2, "0");

const fechaLarga = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

interface Props {
  proximaCosecha: Cosecha | null;
  onAvisame: () => void;
}

export function SinCosecha({ proximaCosecha, onAvisame }: Props) {
  const countdown = useCountdown(proximaCosecha?.fecha_cosecha ?? null);

  return (
    <div className={styles.contenedor}>
      <div className={styles.icono}>🌱</div>

      {proximaCosecha ? (
        <>
          <h2 className={styles.titulo}>Estamos preparando<br />la próxima cosecha</h2>
          <p className={styles.subtitulo}>
            La cosecha está estimada para el <strong>{fechaLarga(proximaCosecha.fecha_cosecha)}</strong>
          </p>

          {countdown && (
            <div className={styles.countdown}>
              <div className={styles.bloque}>
                <span className={styles.numero}>{countdown.dias}</span>
                <span className={styles.unidad}>días</span>
              </div>
              <span className={styles.sep}>:</span>
              <div className={styles.bloque}>
                <span className={styles.numero}>{pad(countdown.horas)}</span>
                <span className={styles.unidad}>horas</span>
              </div>
              <span className={styles.sep}>:</span>
              <div className={styles.bloque}>
                <span className={styles.numero}>{pad(countdown.minutos)}</span>
                <span className={styles.unidad}>min</span>
              </div>
              <span className={styles.sep}>:</span>
              <div className={styles.bloque}>
                <span className={styles.numero}>{pad(countdown.segundos)}</span>
                <span className={styles.unidad}>seg</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className={styles.titulo}>Estamos preparando<br />las próximas cosechas</h2>
          <p className={styles.subtitulo}>
            Pronto habilitamos los pedidos de la próxima entrega.
          </p>
        </>
      )}

      <button className={styles.btnAvisame} onClick={onAvisame}>
        🔔 Avisame cuando esté lista
      </button>
    </div>
  );
}
