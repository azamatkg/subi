import { AxiosResponse } from 'axios';
import { apiClient } from './api.client';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface SearchParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  [key: string]: string | number | boolean | undefined;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export abstract class BaseService<
  T,
  CreateT = Partial<T>,
  UpdateT = Partial<T>,
> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Basic CRUD operations
  async getAll(params?: SearchParams): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.get(
      this.baseUrl,
      { params }
    );
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.get(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async create(data: CreateT): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.post(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async update(id: string | number, data: UpdateT): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.put(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async patch(id: string | number, data: Partial<UpdateT>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.patch(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Search operations
  async search(params: SearchParams): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.post(
      `${this.baseUrl}/search`,
      params
    );
    return response.data;
  }

  async searchAndFilter(params: SearchParams): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.post(
      `${this.baseUrl}/search-and-filter`,
      params
    );
    return response.data;
  }

  // Bulk operations
  async bulkCreate(data: CreateT[]): Promise<T[]> {
    const response: AxiosResponse<ApiResponse<T[]>> = await apiClient.post(
      `${this.baseUrl}/bulk`,
      data
    );
    return response.data.data;
  }

  async bulkUpdate(
    updates: Array<{ id: string | number; data: UpdateT }>
  ): Promise<T[]> {
    const response: AxiosResponse<ApiResponse<T[]>> = await apiClient.put(
      `${this.baseUrl}/bulk`,
      updates
    );
    return response.data.data;
  }

  async bulkDelete(ids: Array<string | number>): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
  }

  // Status operations (for entities with status)
  async updateStatus(
    id: string | number,
    status: string,
    comment?: string
  ): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.patch(
      `${this.baseUrl}/${id}/status`,
      { status, comment }
    );
    return response.data.data;
  }

  // File operations
  async uploadFile(
    id: string | number,
    file: File
  ): Promise<{ message: string; fileId: string }> {
    const response = await apiClient.uploadFile<{
      message: string;
      fileId: string;
    }>(`${this.baseUrl}/${id}/files`, file);
    return response.data;
  }

  async uploadFiles(
    id: string | number,
    files: File[]
  ): Promise<{ message: string; fileIds: string[] }> {
    const response = await apiClient.uploadFiles<{
      message: string;
      fileIds: string[];
    }>(`${this.baseUrl}/${id}/files`, files);
    return response.data;
  }

  async downloadFile(
    id: string | number,
    fileId: string | number,
    filename?: string
  ): Promise<void> {
    await apiClient.downloadFile(
      `${this.baseUrl}/${id}/files/${fileId}`,
      filename
    );
  }

  // Statistics operations
  async getStatistics(
    params?: Record<string, string | number>
  ): Promise<Record<string, number>> {
    const response: AxiosResponse<ApiResponse<Record<string, number>>> =
      await apiClient.get(`${this.baseUrl}/statistics`, { params });
    return response.data.data;
  }

  // Export operations
  async exportData(
    params?: Record<string, string | number>,
    format: 'excel' | 'pdf' | 'csv' = 'excel'
  ): Promise<void> {
    await apiClient.downloadFile(
      `${this.baseUrl}/export?format=${format}`,
      `export.${format}`
    );
  }

  // Custom endpoint helper
  protected async customGet<R = unknown>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<R> {
    const response: AxiosResponse<ApiResponse<R>> = await apiClient.get(
      `${this.baseUrl}/${endpoint}`,
      { params }
    );
    return response.data.data;
  }

  protected async customPost<R = unknown>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<R> {
    const response: AxiosResponse<ApiResponse<R>> = await apiClient.post(
      `${this.baseUrl}/${endpoint}`,
      data
    );
    return response.data.data;
  }

  protected async customPut<R = unknown>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<R> {
    const response: AxiosResponse<ApiResponse<R>> = await apiClient.put(
      `${this.baseUrl}/${endpoint}`,
      data
    );
    return response.data.data;
  }

  protected async customPatch<R = unknown>(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<R> {
    const response: AxiosResponse<ApiResponse<R>> = await apiClient.patch(
      `${this.baseUrl}/${endpoint}`,
      data
    );
    return response.data.data;
  }

  protected async customDelete(endpoint: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${endpoint}`);
  }
}
