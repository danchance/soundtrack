import { User } from '../custom.js';

// export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
