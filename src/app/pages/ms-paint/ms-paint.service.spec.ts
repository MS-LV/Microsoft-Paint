import { TestBed } from '@angular/core/testing';

import { MsPaintService } from './ms-paint.service';

describe('MsPaintService', () => {
  let service: MsPaintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsPaintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
