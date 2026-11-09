export interface ConfidenceInterval {
  lower_tickets: number;
  upper_tickets: number;
  lower_occupancy_pct: number;
  upper_occupancy_pct: number;
  uncertainty_level: string;
  residual_std: number;
}

export interface ShapContribution {
  feature: string;
  shap_value: number;
  direction: 'positive' | 'negative';
}

export interface ExplanationPayload {
  base_expected_value: number;
  top_contributions: ShapContribution[];
  top_positive: ShapContribution[];
  top_negative: ShapContribution[];
  executive_explanation: string;
}

export interface ShowPredictionInput {
  movie_title: string;
  genre: string;
  poster_url?: string;
  release_date?: string;
  show_date: string;
  show_time: string;
  screen_id?: string;
  screen_type?: string;
  screen_capacity: number;
  ticket_price: number;
  movie_popularity: number;
  days_since_release?: number;
  day_of_week?: number;
  is_weekend?: number;
  is_holiday?: number;
  historical_movie_demand?: number;
  historical_genre_demand?: number;
  previous_show_occupancy?: number;
  historical_shows_count?: number;
  is_cold_start?: boolean;
}

export interface ShowPredictionOutput {
  movie_title: string;
  genre: string;
  poster_url?: string;
  show_date: string;
  show_time: string;
  screen_id: string;
  screen_type: string;
  screen_capacity: number;
  ticket_price: number;
  is_cold_start: boolean;
  predicted_tickets_sold: number;
  raw_model_prediction: number;
  baseline_predicted_tickets: number;
  predicted_occupancy_rate: number;
  predicted_occupancy_percentage: number;
  estimated_empty_seats: number;
  estimated_ticket_revenue: number;
  demand_category: 'Low Demand' | 'Moderate Demand' | 'High Demand';
  confidence_interval_90: ConfidenceInterval;
  explanation?: ExplanationPayload;
}

export interface SimulationDelta {
  delta_tickets: number;
  delta_revenue: number;
  delta_occupancy_pct: number;
  percentage_change_tickets: number;
  percentage_change_revenue: number;
}

export interface SimulationResponse {
  base_result: ShowPredictionOutput;
  simulated_result: ShowPredictionOutput;
  differences: SimulationDelta;
  causal_disclaimer: string;
  operational_takeaway: string;
}

export interface ScreenUtilizationItem {
  screen_id: string;
  screen_type: string;
  capacity: number;
  total_shows: number;
  avg_occupancy_pct: number;
  total_revenue: number;
}

export interface DashboardSummary {
  total_shows: number;
  total_predicted_tickets: number;
  average_occupancy_pct: number;
  total_projected_revenue: number;
  high_demand_shows_count: number;
  moderate_demand_shows_count: number;
  low_demand_shows_count: number;
  screen_utilization: ScreenUtilizationItem[];
  recent_shows: Record<string, any>[];
  date_range: {
    start: string;
    end: string;
  };
}

export interface RecommendationItem {
  id: string;
  type: 'screen_reallocation' | 'staffing' | 'pricing_promo' | 'cold_start_watch';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggested_action: string;
  affected_show_id?: string;
  movie_title?: string;
  poster_url?: string;
  screen_id?: string;
  show_time?: string;
  predicted_occupancy_pct?: number;
  expected_revenue_impact?: string;
}

export interface ModelMetricsResponse {
  validation: {
    baseline: Record<string, number>;
    random_forest: Record<string, number>;
    xgboost: Record<string, number>;
  };
  test: {
    baseline: Record<string, number>;
    random_forest: Record<string, number>;
    xgboost: Record<string, number>;
  };
  test_segmented_analysis: Record<string, Record<string, number>>;
  champion_model: string;
}

export interface DailyTrendItem {
  show_date: string;
  actual_tickets: number;
  predicted_tickets: number;
  shows_count: number;
  avg_occupancy: number;
  total_revenue: number;
}

export interface GenrePerformanceItem {
  genre: string;
  shows_count: number;
  avg_occupancy: number;
  total_tickets: number;
  predicted_tickets: number;
  avg_price: number;
}

export interface TimeOfDayPatternItem {
  period: string;
  weekday_occupancy: number;
  weekend_occupancy: number;
  weekday_avg_tickets: number;
  weekend_avg_tickets: number;
}

export interface DemandAnalyticsResponse {
  daily_trends: DailyTrendItem[];
  genre_performance: GenrePerformanceItem[];
  time_of_day_patterns: TimeOfDayPatternItem[];
  demand_distribution: Record<string, number>;
}

