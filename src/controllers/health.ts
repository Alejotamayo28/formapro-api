import { Controller, Get, Route, Tags } from 'tsoa';

export interface HealthResponse {
  ok: boolean;
}

@Route('health')
@Tags('Health')
export class HealthController extends Controller {
  @Get('/')
  public async getHealth(): Promise<HealthResponse> {
    return { ok: true };
  }
}
