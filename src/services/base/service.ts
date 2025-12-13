// Base Service class untuk CRUD operations
import { AxiosInstance, AxiosResponse } from 'axios';
import { hrisApi } from '@/utils/api';
/**
 * Base API Service class
 * Semua service modules harus extend dari class ini
 */
export class BaseService {
  protected api: AxiosInstance;
  protected basePath: string;

  constructor(basePath: string, apiInstance: AxiosInstance = hrisApi) {
    this.basePath = basePath;
    this.api = apiInstance;
  }

  /**
   * GET request
   */
  protected async get<T = any>(
    endpoint: string = '',
    config?: any
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(
      `${this.basePath}${endpoint}`,
      config
    );
    return response.data;
  }

  /**
   * POST request
   */
  protected async post<T = any>(
    endpoint: string = '',
    data?: any,
    config?: any
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(
      `${this.basePath}${endpoint}`,
      data,
      config
    );
    return response.data;
  }

  /**
   * PUT request
   */
  protected async put<T = any>(
    endpoint: string = '',
    data?: any
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(
      `${this.basePath}${endpoint}`,
      data
    );
    return response.data;
  }

  /**
   * PATCH request
   */
  protected async patch<T = any>(
    endpoint: string = '',
    data?: any
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(
      `${this.basePath}${endpoint}`,
      data
    );
    return response.data;
  }

  /**
   * DELETE request
   */
  protected async delete<T = any>(
    endpoint: string = ''
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(
      `${this.basePath}${endpoint}`
    );
    return response.data;
  }



  /**
   * Upload file
   */
  protected async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download file
   */
  protected async downloadFile(
    endpoint: string,
    filename: string
  ): Promise<void> {
    const response = await this.api.get(`${this.basePath}${endpoint}`, {
      responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
