import { AuthPayload } from "../middleware/auth";

declare global {
  namespace Express {
    interface User extends AuthPayload {}
  }
}