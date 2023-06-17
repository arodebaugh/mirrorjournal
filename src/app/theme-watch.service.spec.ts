import { TestBed } from '@angular/core/testing';

import { ThemeWatchService } from './theme-watch.service';

describe('ThemeWatchService', () => {
  let service: ThemeWatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeWatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
