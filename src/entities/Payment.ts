export type PaymentStatus = 'completed' | 'failed' | 'refunded';
export type PaymentCurrency = 'cop' | 'usd';

export class Payment {
  public static loadPayment(
    idPago: string,
    email: string,
    nombre: string | null,
    curso: string,
    importe: number,
    moneda: PaymentCurrency,
    estado: PaymentStatus,
    fecha: string,
    refundedAt: string | null = null
  ): Payment {
    return new Payment(idPago, email, nombre, curso, importe, moneda, estado, fecha, refundedAt);
  }

  public constructor(
    public readonly id_pago: string,
    public readonly email: string,
    public readonly nombre: string | null,
    public readonly curso: string,
    public readonly importe: number,
    public readonly moneda: PaymentCurrency,
    public readonly estado: PaymentStatus,
    public readonly fecha: string,
    public readonly refunded_at: string | null = null
  ) { }

  public getIdPago(): string {
    return this.id_pago;
  }

  public getEmail(): string {
    return this.email;
  }

  public getNombre(): string | null {
    return this.nombre;
  }

  public getCurso(): string {
    return this.curso;
  }

  public getImporte(): number {
    return this.importe;
  }

  public getMoneda(): PaymentCurrency {
    return this.moneda;
  }

  public getEstado(): PaymentStatus {
    return this.estado;
  }

  public getFecha(): string {
    return this.fecha;
  }

  public getRefundedAt(): string | null {
    return this.refunded_at;
  }
}
