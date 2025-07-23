import React from 'react';
import { IconName } from '@/components/Icons';

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
  icon: IconName;
  color: string;
  bgColor: string;
  borderColor: string;
  loadingColor: string;
  emptyIcon: string;
  backButtonText: string;
}
