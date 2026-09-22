export interface Zona {
  id: string;
  nombre: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  whatsapp?: string;
  email?: string;
  created_at: string;
}

export interface Direccion {
  id: string;
  cliente_id: string;
  zona_id: string;
  calle: string;
  detalle?: string;
  created_at: string;
  zona?: Zona;
}

export interface Cosecha {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  created_at: string;
  items?: CosechaItem[];
  fechas?: FechaEntrega[];
}

export interface CosechaItem {
  id: string;
  cosecha_id: string;
  producto_id: string;
  cantidad_estimada?: number;
  created_at: string;
}

export interface FechaEntrega {
  id: string;
  cosecha_id: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  activa: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  detalle?: string;
  precio: number;
  emoji?: string;
  max_por_producto: number;
  activo: boolean;
  created_at: string;
}

export interface Pedido {
  id: string;
  numero: number;
  cliente_id?: string;
  direccion_id?: string;
  cosecha_id?: string;
  fecha_entrega_id?: string;
  tipo_entrega: 'domicilio' | 'retiro';
  estado: 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';
  notas?: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  created_at: string;
  items?: PedidoItem[];
  cliente?: Cliente;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id?: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  created_at: string;
}
