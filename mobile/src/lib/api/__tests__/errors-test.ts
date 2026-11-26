import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';

import { api } from '../client';
import { ApiError, ERROR_MESSAGES, toApiError } from '../errors';

const config = { headers: {} } as InternalAxiosRequestConfig;

function axiosErrorWithResponse(status: number, data: unknown) {
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  });
}

describe('toApiError', () => {
  it('maps "no response" (server down / offline) to a network error', () => {
    const error = toApiError(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBeNull();
    expect(error.isNetworkError).toBe(true);
    expect(error.isServerError).toBe(false);
    expect(error.message).toBe(ERROR_MESSAGES.network);
  });

  it('maps a timeout to a network error with a timeout message', () => {
    const error = toApiError(new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED', config));

    expect(error.isNetworkError).toBe(true);
    expect(error.message).toBe(ERROR_MESSAGES.timeout);
  });

  it('maps 5xx to a server error and hides the response body', () => {
    const error = toApiError(axiosErrorWithResponse(503, '<html>Bad gateway</html>'));

    expect(error.status).toBe(503);
    expect(error.isServerError).toBe(true);
    expect(error.isNetworkError).toBe(false);
    expect(error.message).toBe(ERROR_MESSAGES.server);
  });

  it("keeps the server's message for 4xx", () => {
    const error = toApiError(axiosErrorWithResponse(409, { message: 'You already submitted this day.' }));

    expect(error.isClientError).toBe(true);
    expect(error.message).toBe('You already submitted this day.');
  });
});

describe('api client when the server is down', () => {
  const serverDown: AxiosAdapter = (requestConfig) =>
    Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, requestConfig));

  // What axios's own adapter does with a 500: reject with the response attached.
  const serverFailing: AxiosAdapter = (requestConfig) =>
    Promise.reject(
      new AxiosError('Request failed with status code 500', 'ERR_BAD_RESPONSE', requestConfig, null, {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: requestConfig,
        data: 'boom',
      })
    );

  it('rejects with a network ApiError when nothing answers', async () => {
    const request = api.get('/days', { adapter: serverDown });

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      status: null,
      isNetworkError: true,
      message: ERROR_MESSAGES.network,
    });
  });

  it('rejects with a server ApiError on 500', async () => {
    await expect(api.get('/days', { adapter: serverFailing })).rejects.toMatchObject({
      status: 500,
      isServerError: true,
      message: ERROR_MESSAGES.server,
    });
  });

  it('prefixes every endpoint with /api', async () => {
    let url: string | undefined;
    await api
      .get('/days', {
        adapter: (requestConfig) => {
          url = `${requestConfig.baseURL}${requestConfig.url}`;
          return Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, requestConfig));
        },
      })
      .catch(() => {});

    expect(url).toBe('http://api.test/api/days');
  });
});
