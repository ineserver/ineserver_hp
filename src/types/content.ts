import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category?: string;
}

export interface ContentPageConfig {
  title: string;
  description: string;
  apiEndpoint: string;
  basePath: string;
  icon: IconDefinition;
  color: string;
  bgColor: string;
  borderColor: string;
  loadingColor: string;
  emptyIcon: string;
  backButtonText: string;
}
