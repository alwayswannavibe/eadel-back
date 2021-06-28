import { Repository } from 'typeorm';

export type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;
