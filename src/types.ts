export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
}

export interface MetricCard {
  value: string;
  label: string;
  category?: string;
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

export interface EngagementModel {
  title: string;
  price: string;
  description: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  projectDetails: string;
}
