export type PaymentStatus = 'completed' | 'refunded';

export class Payment {
  public static loadPayment(
    idPago: string,
    email: string,
    nombre: string | null,
    curso: string,
    importe: number,
    moneda: string,
    estado: PaymentStatus,
    fecha: Date,
    refundedAt: Date | null = null
  ): Payment {
    return new Payment(idPago, email, nombre, curso, importe, moneda, estado, fecha, refundedAt);
  }

  public constructor(
    public readonly id_pago: string,
    public readonly email: string,
    public readonly nombre: string | null,
    public readonly curso: string,
    public readonly importe: number,
    public readonly moneda: string,
    public readonly estado: PaymentStatus,
    public readonly fecha: Date,
    public readonly refunded_at: Date | null = null
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

  public getMoneda(): string {
    return this.moneda;
  }

  public getEstado(): PaymentStatus {
    return this.estado;
  }

  public getFecha(): Date {
    return this.fecha;
  }

  public getRefundedAt(): Date | null {
    return this.refunded_at;
  }
}
