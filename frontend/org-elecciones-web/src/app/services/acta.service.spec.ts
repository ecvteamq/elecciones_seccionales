import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ActaService } from './acta.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

describe('ActaService', () => {
  let service: ActaService;
  let http: HttpTestingController;
  const body = { partido: 'PARTIDO X', votosPartido: 900 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: {} }]
    });
    service = TestBed.inject(ActaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calcularReparto llama al endpoint genérico (método activo)', () => {
    const respuesta = [{ nombre: 'A', voto: '900.00' }];
    service.calcularReparto(body).subscribe(data => expect(data).toEqual(respuesta));

    const req = http.expectOne(environment.API_URL + '/api/actaDetalle/metodoReparto');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(respuesta);
  });

  it('metodoWebster se conserva', () => {
    service.metodoWebster(body).subscribe();

    const req = http.expectOne(environment.API_URL + '/api/actaDetalle/metodoWebster');
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });
});
