/**
 * Response from the Mini Digital API Server
 */
export interface ServiceResponse {
  message: string;
  statusCode: number;
  authorizationToken?: string;
}
