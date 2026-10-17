// Pasarela de pago SIMULADA (MVP). No cobra nada, no envía datos de tarjeta a ningún lado
// y no se comunica con ningún proveedor real: solo espera un momento y devuelve una operación aprobada.

export type MedioDePago = "tarjeta" | "transferencia" | "mercadopago";

export const MEDIOS_DE_PAGO: Record<MedioDePago, string> = {
  tarjeta: "Tarjeta de crédito o débito",
  transferencia: "Transferencia bancaria",
  mercadopago: "Mercado Pago",
};

export interface DatosDePago {
  loteId: string;
  comprador: string;
  email: string;
  medio: MedioDePago;
  monto: number;
}

export interface OperacionAprobada {
  operacion: string;
  monto: number;
  medio: MedioDePago;
}

// Demora que imita el procesamiento de un pago real.
const DEMORA_MS = 1200;

const codigoOperacion = (): string => `VR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export function simularPago(datos: DatosDePago): Promise<OperacionAprobada> {
  return new Promise((resolver) => {
    setTimeout(() => resolver({ operacion: codigoOperacion(), monto: datos.monto, medio: datos.medio }), DEMORA_MS);
  });
}
