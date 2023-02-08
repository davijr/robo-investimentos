import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EditionService } from './edition.service';

describe('EditionService', () => {
  let service: EditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
