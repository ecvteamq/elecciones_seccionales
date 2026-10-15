import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { RecintoElectoralService } from './recinto_electoral.service';

describe('RecintoElectoralService', () => {
  let service: RecintoElectoralService;
  let http: HttpTestingController;
  const api = environment.API_URL + '/api/recinto-electoral';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(RecintoElectoralService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll consulta los recintos activos', () => {
    service.getAll().subscribe(recintos => expect(recintos.length).toBe(1));
    const req = http.expectOne(api + '/getAll');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nombre_recinto: 'R1' }]);
  });

  it('getByFilter envía los códigos de provincia, cantón y parroquia', () => {
    const filtro = { provincia: '10', canton: '1001', parroquia: '' };
    service.getByFilter(filtro).subscribe();
    const req = http.expectOne(api + '/getByFilter');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(filtro);
    req.flush([]);
  });

  it('getNroElectoresByCanton devuelve el total de electores', () => {
    service.getNroElectoresByCanton({ provincia: '10', canton: '1001' })
      .subscribe(r => expect(r.numero_electores).toBe(178634));
    const req = http.expectOne(api + '/getNroElectoresByCanton');
    expect(req.request.method).toBe('POST');
    req.flush({ numero_electores: 178634 });
  });
});
