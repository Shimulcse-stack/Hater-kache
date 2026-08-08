/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  icon?: string;
}

export type BookmarkCategory = 'AI Tools' | 'E-commerce' | 'Social Media' | 'Utilities';

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPro?: boolean;
}

