export interface Producto {
  id: string;
  nombre: string;
  detalle: string;
  precio: number;
  emoji: string;
  maxPorProducto?: number;
}

interface Config {
  negocio: string;
  whatsapp: string;
  diaEntrega: number;
  envioCosto: number;
  maxPorProducto: number;
  retiroLugar: string;
  productos: Producto[];
}

const config: Config = {
  negocio: "Hidro Pinamar",
  // Formato: 549 + característica sin 0 + número sin 15
  whatsapp: "5491138860680",
  // 0=dom, 1=lun, 2=mar, 3=mié, 4=jue, 5=vie, 6=sáb
  diaEntrega: 4,
  envioCosto: 2500,
  maxPorProducto: 10,
  retiroLugar: "Paseo del Ágora",
  productos: [
    {
      id: "lechuga-mantecosa",
      nombre: "Lechuga mantecosa",
      detalle: "planta con raíz",
      precio: 1500,
      emoji: "🥬",
    },
    {
      id: "lechuga-morada",
      nombre: "Lechuga morada",
      detalle: "planta con raíz",
      precio: 1500,
      emoji: "🥬",
    },
    {
      id: "rucula",
      nombre: "Rúcula",
      detalle: "atado",
      precio: 1200,
      emoji: "🌿",
    },
    {
      id: "albahaca",
      nombre: "Albahaca",
      detalle: "planta con raíz",
      precio: 1300,
      emoji: "🌱",
    },
    {
      id: "espinaca",
      nombre: "Espinaca",
      detalle: "atado",
      precio: 1400,
      emoji: "🍃",
    },
    { id: "kale", nombre: "Kale", detalle: "atado", precio: 1600, emoji: "🥗" },
    {
      id: "cebolla-de-verdeo",
      nombre: "Cebolla de verdeo",
      detalle: "atado",
      precio: 900,
      emoji: "🧅",
    },
    {
      id: "perejil",
      nombre: "Perejil",
      detalle: "atado",
      precio: 800,
      emoji: "🌿",
    },
  ],
};

export default config;
