export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { message: string; code: string } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export function isApiOk<T>(v: ApiResponse<T>): v is ApiOk<T> {
  return v.ok === true;
}

