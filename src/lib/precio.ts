const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatPeso = (n: number) => fmt.format(n);

export const formatPrecio = (n: number) => (n === 0 ? "A confirmar" : fmt.format(n));
