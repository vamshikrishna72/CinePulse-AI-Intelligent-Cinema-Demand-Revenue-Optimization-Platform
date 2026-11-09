import {
  DashboardSummary,
  ShowPredictionInput,
  ShowPredictionOutput,
  SimulationResponse,
  RecommendationItem,
  ModelMetricsResponse,
  DemandAnalyticsResponse,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export const apiService = {
  // System Health
  async getHealth(): Promise<{ status: string; champion_model: string }> {
    return fetchJson(`${API_BASE_URL.replace('/api', '')}/health`);
  },

  // Dashboard Overview
  async getDashboardSummary(): Promise<DashboardSummary> {
    return fetchJson(`${API_BASE_URL}/dashboard/summary`);
  },

  // Single Show Forecast
  async predictShow(input: ShowPredictionInput): Promise<ShowPredictionOutput> {
    return fetchJson(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // What-If Simulation
  async simulateScenario(
    baseScenario: ShowPredictionInput,
    simulatedScenario: ShowPredictionInput
  ): Promise<SimulationResponse> {
    return fetchJson(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      body: JSON.stringify({
        base_scenario: baseScenario,
        simulated_scenario: simulatedScenario,
      }),
    });
  },

  // Model Intelligence & Metrics
  async getModelMetrics(): Promise<ModelMetricsResponse> {
    return fetchJson(`${API_BASE_URL}/models/metrics`);
  },

  // Global Feature Explainability
  async getModelExplainability(): Promise<{
    feature_names: string[];
    random_forest: Record<string, number>;
    xgboost: Record<string, number>;
  }> {
    return fetchJson(`${API_BASE_URL}/models/explain`);
  },

  // Demand Analytics Trends
  async getDemandAnalytics(): Promise<DemandAnalyticsResponse> {
    return fetchJson(`${API_BASE_URL}/analytics/demand`);
  },

  // Operational Recommendations
  async getRecommendations(): Promise<RecommendationItem[]> {
    return fetchJson(`${API_BASE_URL}/recommendations`);
  },

  // Cinema Metadata
  async getMetadata(): Promise<{
    movies: Array<{ id: string; title: string; genre: string; popularity: number; decay_rate: number }>;
    screens: Array<{ screen_id: string; screen_type: string; capacity: number; base_price: number }>;
    genres: string[];
    time_slots: string[];
    screen_types: string[];
  }> {
    return fetchJson(`${API_BASE_URL}/data/metadata`);
  },
};
