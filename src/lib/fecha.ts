import config from "../config";

export function proximaEntrega(): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasHasta = (config.diaEntrega - hoy.getDay() + 7) % 7;
  // Si hoy ES el día de entrega, mostramos la siguiente semana
  const diasSumar = diasHasta === 0 ? 7 : diasHasta;

  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() + diasSumar);

  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
