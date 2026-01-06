import { AnalysisResult } from '../types/analysis';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class AnalysisService {
  static async analyzeShopImage(imageFile: File, shopId?: string): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (shopId) {
      formData.append('shopId', shopId);
    }

    try {
      const response = await fetch(`${API_URL}/analysis/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Analysis failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during analysis');
    }
  }
}
