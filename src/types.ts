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
}
