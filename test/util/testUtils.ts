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
