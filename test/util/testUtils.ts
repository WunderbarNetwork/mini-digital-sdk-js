export class NoErrorThrownError extends Error {}

/**
 * Wrapper to catch and return a particular type of Error, to aid Jest in detecting specific errors
 */
export const getError = async <TError>(call: () => unknown): Promise<TError> => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error: unknown) {
    return error as TError;
  }
};

/**
 * Outputs to the console what was received in the request (for testing purposes)
 */
export function describeRequest(request: Request, logOutcomes: boolean): void {
  if (!logOutcomes) return;

  console.log(`${request.method} ${request.url}`);
  if (request.url.includes("/events/jwt/")) {
    console.log(`JWT Authentication. Authorization: ${request.headers.get("Authorization") ?? "null"}`);
  } else if (request.url.includes("/events/key/")) {
    console.log(`API Key Authentication. API Key: ${request.headers.get("X-Api-Key") ?? "null"}`);
  } else {
    console.log("Unknown request type.");
  }
}
