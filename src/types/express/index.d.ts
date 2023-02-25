import { User } from '../custom.ts';

// export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
