import { useState, useCallback } from "react";
import type { ItemCarrito, ProductoUI } from "../types";

export function useCarrito(productos: ProductoUI[]) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregar = useCallback((id: string) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    setItems((prev) => {
      const existente = prev.find((i) => i.id === id);
      if (existente) {
        if (existente.cantidad >= producto.maxPorProducto) return prev;
        return prev.map((i) =>
          i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          emoji: producto.emoji,
          cantidad: 1,
        },
      ];
    });
  }, [productos]);

  const quitar = useCallback((id: string) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === id);
      if (!existente) return prev;
      if (existente.cantidad === 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) =>
        i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  }, []);

  const getCantidad = useCallback(
    (id: string) => items.find((i) => i.id === id)?.cantidad ?? 0,
    [items]
  );

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0);

  const limpiar = useCallback(() => setItems([]), []);

  return { items, agregar, quitar, getCantidad, subtotal, totalUnidades, limpiar };
}
