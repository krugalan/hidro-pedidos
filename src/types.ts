export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  emoji: string;
  cantidad: number;
}

export type TipoEntrega = "domicilio" | "retiro" | null;

export interface DatosCliente {
  nombre: string;
  direccion: string;
  entrega: TipoEntrega;
  email?: string;
  zona_id?: string;
  zona_nombre?: string;
}

export interface ProductoUI {
  id: string;
  nombre: string;
  detalle: string;
  precio: number;
  emoji: string;
  maxPorProducto: number;
}
