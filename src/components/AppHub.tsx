import React, { useState, useEffect, useRef } from 'react';
import bloodflowLogo from '../assets/images/bloodflow_logo_1786896183551.jpg';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  ShoppingBag, 
  PhoneCall,
  Siren,
  Share2, 
  Wrench, 
  X, 
  Link, 
  Camera, 
  Calculator, 
  MessageSquare, 
  Printer, 
  FileText, 
  Image as ImageIcon, 
  UserCheck, 
  FileSpreadsheet, 
  Grid, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Monitor,
  Search,
  CheckCircle2,
  FolderOpen,
  Upload,
  Edit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Palette,
  Film,
  Plane,
  Landmark,
  Newspaper
} from 'lucide-react';
import { Bookmark } from '../types';
import { dispatchAppNotification } from '../utils/notificationSystem';
import { useLanguage } from '../LanguageContext';
import { 
  subscribeUserBookmarks, 
  saveUserBookmarkToFirestore, 
  deleteUserBookmarkFromFirestore,
  subscribeGlobalBookmarks,
  saveGlobalBookmarkToFirestore,
  deleteGlobalBookmarkFromFirestore
} from '../lib/firebase';

export interface ServiceApp {
  id: string;
  titleBn: string;
  titleEn: string;
  category: string;
  subcategory?: string;
  iconType: 'photo' | 'calc' | 'convert' | 'whatsapp' | 'ad' | 'studio' | 'autofill' | 'nid' | 'print' | 'joint' | 'image' | string;
  iconUrl?: string;
  url?: string;
  badge?: string;
  description?: string;
  bgColor: string;
  accentColor: string;
}

export const PRESET_SERVICES: ServiceApp[] = [
  // --- Text & Conversational AI ---
  {
    id: 'ai_chatgpt',
    titleBn: 'ChatGPT',
    titleEn: 'ChatGPT',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128',
    url: 'https://chatgpt.com',
    description: 'Conversational AI model by OpenAI for writing, coding, and research.',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'ai_gemini',
    titleBn: 'Google Gemini',
    titleEn: 'Google Gemini',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128',
    url: 'https://gemini.google.com',
    description: "Google's multimodal AI model integrated with Workspace and Search.",
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ai_claude',
    titleBn: 'Claude AI',
    titleEn: 'Claude AI',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=128',
    url: 'https://claude.ai',
    description: 'Advanced AI assistant by Anthropic, excellent for long docs and coding.',
    bgColor: 'from-amber-500/20 to-orange-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'ai_grok',
    titleBn: 'Grok AI',
    titleEn: 'Grok AI',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=x.ai&sz=128',
    url: 'https://x.ai',
    description: 'Real-time AI assistant built by xAI with X (Twitter) integration.',
    bgColor: 'from-slate-500/20 to-zinc-600/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'ai_perplexity',
    titleBn: 'Perplexity AI',
    titleEn: 'Perplexity AI',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=128',
    url: 'https://www.perplexity.ai',
    description: 'AI-powered search engine with real-time web citations and sources.',
    bgColor: 'from-cyan-500/20 to-teal-600/20',
    accentColor: 'text-cyan-400'
  },
  {
    id: 'ai_deepseek',
    titleBn: 'DeepSeek',
    titleEn: 'DeepSeek',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=128',
    url: 'https://chat.deepseek.com',
    description: 'Advanced open-weight LLM for reasoning, coding, and problem-solving.',
    bgColor: 'from-blue-600/20 to-cyan-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ai_copilot',
    titleBn: 'Microsoft Copilot',
    titleEn: 'Microsoft Copilot',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=128',
    url: 'https://copilot.microsoft.com',
    description: 'AI companion integrated into Microsoft 365 and web browsing.',
    bgColor: 'from-sky-500/20 to-blue-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'ai_poe',
    titleBn: 'Poe',
    titleEn: 'Poe',
    category: 'AI Tools',
    subcategory: 'Text & Conversational AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=poe.com&sz=128',
    url: 'https://poe.com',
    description: 'Ecosystem by Quora to access multiple AI chatbots in one place.',
    bgColor: 'from-purple-500/20 to-indigo-600/20',
    accentColor: 'text-purple-400'
  },

  // --- Coding & Developer AI ---
  {
    id: 'ai_github_copilot',
    titleBn: 'GitHub Copilot',
    titleEn: 'GitHub Copilot',
    category: 'AI Tools',
    subcategory: 'Coding & Developer AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    url: 'https://github.com/features/copilot',
    description: 'AI pair programmer for code completion and chat assistance.',
    bgColor: 'from-purple-600/20 to-slate-800/20',
    accentColor: 'text-purple-400'
  },
  {
    id: 'ai_cursor',
    titleBn: 'Cursor',
    titleEn: 'Cursor',
    category: 'AI Tools',
    subcategory: 'Coding & Developer AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cursor.com&sz=128',
    url: 'https://www.cursor.com',
    description: 'AI-first code editor designed for rapid software development.',
    bgColor: 'from-blue-500/20 to-slate-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ai_v0',
    titleBn: 'v0 by Vercel',
    titleEn: 'v0 by Vercel',
    category: 'AI Tools',
    subcategory: 'Coding & Developer AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=v0.dev&sz=128',
    url: 'https://v0.dev',
    description: 'Generative UI system to build web components using prompts.',
    bgColor: 'from-zinc-500/20 to-slate-900/20',
    accentColor: 'text-zinc-300'
  },
  {
    id: 'ai_replit',
    titleBn: 'Replit Agent',
    titleEn: 'Replit Agent',
    category: 'AI Tools',
    subcategory: 'Coding & Developer AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=replit.com&sz=128',
    url: 'https://replit.com',
    description: 'AI assistant to build and deploy full-stack web applications.',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'ai_bolt',
    titleBn: 'Bolt.new',
    titleEn: 'Bolt.new',
    category: 'AI Tools',
    subcategory: 'Coding & Developer AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=bolt.new&sz=128',
    url: 'https://bolt.new',
    description: 'In-browser AI web development environment and app creator.',
    bgColor: 'from-amber-500/20 to-yellow-600/20',
    accentColor: 'text-amber-400'
  },

  // --- Image & Design AI ---
  {
    id: 'ai_midjourney',
    titleBn: 'Midjourney',
    titleEn: 'Midjourney',
    category: 'AI Tools',
    subcategory: 'Image & Design AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=128',
    url: 'https://www.midjourney.com',
    description: 'Generates high-quality photorealistic images from text prompts.',
    bgColor: 'from-blue-600/20 to-indigo-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ai_flux',
    titleBn: 'FLUX AI',
    titleEn: 'FLUX AI',
    category: 'AI Tools',
    subcategory: 'Image & Design AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=flux.ai&sz=128',
    url: 'https://flux.ai',
    description: 'State-of-the-art open image generation model by Black Forest Labs.',
    bgColor: 'from-emerald-500/20 to-teal-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'ai_leonardo',
    titleBn: 'Leonardo.Ai',
    titleEn: 'Leonardo.Ai',
    category: 'AI Tools',
    subcategory: 'Image & Design AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=leonardo.ai&sz=128',
    url: 'https://leonardo.ai',
    description: 'AI image generator, asset creation tool, and canvas editor.',
    bgColor: 'from-purple-500/20 to-pink-600/20',
    accentColor: 'text-purple-400'
  },
  {
    id: 'ai_canva',
    titleBn: 'Canva Magic Studio',
    titleEn: 'Canva Magic Studio',
    category: 'AI Tools',
    subcategory: 'Image & Design AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128',
    url: 'https://www.canva.com/magic',
    description: 'All-in-one suite of AI tools for graphics, editing, and design.',
    bgColor: 'from-cyan-500/20 to-blue-500/20',
    accentColor: 'text-cyan-400'
  },
  {
    id: 'ai_recraft',
    titleBn: 'Recraft.ai',
    titleEn: 'Recraft.ai',
    category: 'AI Tools',
    subcategory: 'Image & Design AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=recraft.ai&sz=128',
    url: 'https://www.recraft.ai',
    description: 'AI vector graphics and 3D icon generator for designers.',
    bgColor: 'from-rose-500/20 to-pink-600/20',
    accentColor: 'text-rose-400'
  },

  // --- Video & Audio AI ---
  {
    id: 'ai_runway',
    titleBn: 'Runway',
    titleEn: 'Runway',
    category: 'AI Tools',
    subcategory: 'Video & Audio AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
    url: 'https://runwayml.com',
    description: 'Generative AI video generation, visual effects, and editing.',
    bgColor: 'from-purple-600/20 to-fuchsia-600/20',
    accentColor: 'text-fuchsia-400'
  },
  {
    id: 'ai_luma',
    titleBn: 'Luma Dream Machine',
    titleEn: 'Luma Dream Machine',
    category: 'AI Tools',
    subcategory: 'Video & Audio AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128',
    url: 'https://lumalabs.ai/dream-machine',
    description: 'Creates realistic video clips from text prompts and images.',
    bgColor: 'from-sky-500/20 to-indigo-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'ai_elevenlabs',
    titleBn: 'ElevenLabs',
    titleEn: 'ElevenLabs',
    category: 'AI Tools',
    subcategory: 'Video & Audio AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128',
    url: 'https://elevenlabs.io',
    description: 'Ultra-realistic text-to-speech and AI voice cloning tool.',
    bgColor: 'from-emerald-500/20 to-teal-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'ai_suno',
    titleBn: 'Suno AI',
    titleEn: 'Suno AI',
    category: 'AI Tools',
    subcategory: 'Video & Audio AI',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=suno.com&sz=128',
    url: 'https://suno.com',
    description: 'Generates complete songs with lyrics and vocals from text.',
    bgColor: 'from-orange-500/20 to-red-600/20',
    accentColor: 'text-orange-400'
  },

  // --- E-Commerce Platform: Global Tech & Retail Giants ---
  {
    id: 'ecom_alibaba',
    titleBn: 'Alibaba',
    titleEn: 'Alibaba',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.alibaba.com&sz=128',
    url: 'https://www.alibaba.com',
    description: 'Leading global B2B wholesale trade platform.',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'ecom_walmart',
    titleBn: 'Walmart',
    titleEn: 'Walmart',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.walmart.com&sz=128',
    url: 'https://www.walmart.com',
    description: 'Major international retail corporation and online marketplace.',
    bgColor: 'from-blue-500/20 to-sky-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ecom_etsy',
    titleBn: 'Etsy',
    titleEn: 'Etsy',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.etsy.com&sz=128',
    url: 'https://www.etsy.com',
    description: 'Marketplace for handmade, vintage, and unique creative goods.',
    bgColor: 'from-orange-600/20 to-red-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'ecom_taobao',
    titleBn: 'Taobao',
    titleEn: 'Taobao',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.taobao.com&sz=128',
    url: 'https://www.taobao.com',
    description: 'Chinese online shopping platform operated by Alibaba Group.',
    bgColor: 'from-amber-500/20 to-orange-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'ecom_shopee',
    titleBn: 'Shopee',
    titleEn: 'Shopee',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=shopee.com&sz=128',
    url: 'https://shopee.com',
    description: 'Leading e-commerce platform in Southeast Asia and Taiwan.',
    bgColor: 'from-orange-500/20 to-rose-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'ecom_lazada',
    titleBn: 'Lazada',
    titleEn: 'Lazada',
    category: 'E-Commerce Platform',
    subcategory: 'Global Tech & Retail Giants',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.lazada.com&sz=128',
    url: 'https://www.lazada.com',
    description: 'Major Southeast Asian e-commerce platform.',
    bgColor: 'from-blue-600/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },

  // --- E-Commerce Platform: Bangladesh Popular Stores ---
  {
    id: 'ecom_startech',
    titleBn: 'Star Tech',
    titleEn: 'Star Tech',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.startech.com.bd&sz=128',
    url: 'https://www.startech.com.bd',
    description: 'Leading tech, computer, and component retailer in Bangladesh.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'ecom_ryans',
    titleBn: 'Ryans Computers',
    titleEn: 'Ryans Computers',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.ryans.com&sz=128',
    url: 'https://www.ryans.com',
    description: 'Major computer shop and IT equipment e-commerce site.',
    bgColor: 'from-yellow-500/20 to-amber-600/20',
    accentColor: 'text-yellow-400'
  },
  {
    id: 'ecom_techland',
    titleBn: 'Techland BD',
    titleEn: 'Techland BD',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.techlandbd.com&sz=128',
    url: 'https://www.techlandbd.com',
    description: 'Popular online laptop, PC hardware, and electronics store.',
    bgColor: 'from-emerald-500/20 to-teal-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'ecom_othoba',
    titleBn: 'Othoba',
    titleEn: 'Othoba',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.othoba.com&sz=128',
    url: 'https://www.othoba.com',
    description: "PRAN-RFL Group's online shopping marketplace in Bangladesh.",
    bgColor: 'from-blue-500/20 to-sky-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ecom_shajgoj',
    titleBn: 'Shajgoj',
    titleEn: 'Shajgoj',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.shajgoj.com&sz=128',
    url: 'https://www.shajgoj.com',
    description: 'Leading beauty, skincare, and cosmetics store in Bangladesh.',
    bgColor: 'from-pink-500/20 to-rose-600/20',
    accentColor: 'text-pink-400'
  },
  {
    id: 'ecom_foodpanda',
    titleBn: 'PandaMart (Foodpanda)',
    titleEn: 'PandaMart (Foodpanda)',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.foodpanda.com.bd&sz=128',
    url: 'https://www.foodpanda.com.bd',
    description: 'On-demand grocery and daily essentials delivery platform.',
    bgColor: 'from-pink-600/20 to-fuchsia-600/20',
    accentColor: 'text-pink-400'
  },
  {
    id: 'ecom_kbdbazaar',
    titleBn: 'Kbd Bazaar',
    titleEn: 'Kbd Bazaar',
    category: 'E-Commerce Platform',
    subcategory: 'Bangladesh Popular Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.kbdbazaar.com&sz=128',
    url: 'https://www.kbdbazaar.com',
    description: 'Online agro products, grocery, and daily needs store.',
    bgColor: 'from-green-500/20 to-emerald-600/20',
    accentColor: 'text-green-400'
  },

  // --- E-Commerce Platform: Fashion & Specialty Platforms ---
  {
    id: 'ecom_asos',
    titleBn: 'ASOS',
    titleEn: 'ASOS',
    category: 'E-Commerce Platform',
    subcategory: 'Fashion & Specialty Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.asos.com&sz=128',
    url: 'https://www.asos.com',
    description: 'Global online fashion and cosmetic retailer.',
    bgColor: 'from-slate-600/20 to-zinc-800/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'ecom_shein',
    titleBn: 'SHEIN',
    titleEn: 'SHEIN',
    category: 'E-Commerce Platform',
    subcategory: 'Fashion & Specialty Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.shein.com&sz=128',
    url: 'https://www.shein.com',
    description: 'Global fast-fashion e-commerce retailer.',
    bgColor: 'from-zinc-500/20 to-slate-900/20',
    accentColor: 'text-zinc-200'
  },
  {
    id: 'ecom_magento',
    titleBn: 'Magento (Adobe Commerce)',
    titleEn: 'Magento (Adobe Commerce)',
    category: 'E-Commerce Platform',
    subcategory: 'Fashion & Specialty Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=business.adobe.com&sz=128',
    url: 'https://business.adobe.com/products/magento/magento-commerce.html',
    description: 'Enterprise-level open-source e-commerce platform.',
    bgColor: 'from-orange-600/20 to-red-600/20',
    accentColor: 'text-orange-400'
  },

  // --- E-Commerce Platform: Global & Bangladesh Online Stores ---
  {
    id: 'ecom_amazon',
    titleBn: 'Amazon',
    titleEn: 'Amazon',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.amazon.com&sz=128',
    url: 'https://www.amazon.com',
    description: 'Global multi-category retail marketplace.',
    bgColor: 'from-amber-500/20 to-yellow-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'ecom_daraz',
    titleBn: 'Daraz Bangladesh',
    titleEn: 'Daraz Bangladesh',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.daraz.com.bd&sz=128',
    url: 'https://www.daraz.com.bd',
    description: 'Leading online shopping marketplace in Bangladesh.',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'ecom_aliexpress',
    titleBn: 'AliExpress',
    titleEn: 'AliExpress',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.aliexpress.com&sz=128',
    url: 'https://www.aliexpress.com',
    description: 'Global wholesale and retail online shopping platform.',
    bgColor: 'from-red-500/20 to-orange-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'ecom_ebay',
    titleBn: 'eBay',
    titleEn: 'eBay',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.ebay.com&sz=128',
    url: 'https://www.ebay.com',
    description: 'Global e-commerce website for consumer-to-consumer & business-to-consumer sales.',
    bgColor: 'from-blue-500/20 to-red-500/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'ecom_pickaboo',
    titleBn: 'Pickaboo',
    titleEn: 'Pickaboo',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.pickaboo.com&sz=128',
    url: 'https://www.pickaboo.com',
    description: 'Popular Bangladeshi online store for electronics and mobile devices.',
    bgColor: 'from-cyan-500/20 to-blue-600/20',
    accentColor: 'text-cyan-400'
  },
  {
    id: 'ecom_chaldal',
    titleBn: 'Chaldal',
    titleEn: 'Chaldal',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=chaldal.com&sz=128',
    url: 'https://chaldal.com',
    description: 'Online grocery delivery platform in Bangladesh.',
    bgColor: 'from-green-500/20 to-emerald-600/20',
    accentColor: 'text-green-400'
  },
  {
    id: 'ecom_aarong',
    titleBn: 'Aarong',
    titleEn: 'Aarong',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.aarong.com&sz=128',
    url: 'https://www.aarong.com',
    description: 'Lifestyle and fashion e-commerce brand in Bangladesh.',
    bgColor: 'from-amber-600/20 to-yellow-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'ecom_rokomari',
    titleBn: 'Rokomari',
    titleEn: 'Rokomari',
    category: 'E-Commerce Platform',
    subcategory: 'Global & Bangladesh Online Stores',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.rokomari.com&sz=128',
    url: 'https://www.rokomari.com',
    description: 'Largest online bookstore and gift shop in Bangladesh.',
    bgColor: 'from-emerald-600/20 to-teal-600/20',
    accentColor: 'text-emerald-400'
  },

  // --- E-Commerce Platform: E-Commerce Builders & Tools ---
  {
    id: 'ecom_shopify',
    titleBn: 'Shopify',
    titleEn: 'Shopify',
    category: 'E-Commerce Platform',
    subcategory: 'E-Commerce Builders & Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.shopify.com&sz=128',
    url: 'https://www.shopify.com',
    description: 'Leading platform to build and manage online e-commerce stores.',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'ecom_woocommerce',
    titleBn: 'WooCommerce',
    titleEn: 'WooCommerce',
    category: 'E-Commerce Platform',
    subcategory: 'E-Commerce Builders & Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=woocommerce.com&sz=128',
    url: 'https://woocommerce.com',
    description: 'Open-source customizable e-commerce plugin for WordPress.',
    bgColor: 'from-purple-500/20 to-indigo-600/20',
    accentColor: 'text-purple-400'
  },
  {
    id: 'ecom_bigcommerce',
    titleBn: 'BigCommerce',
    titleEn: 'BigCommerce',
    category: 'E-Commerce Platform',
    subcategory: 'E-Commerce Builders & Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.bigcommerce.com&sz=128',
    url: 'https://www.bigcommerce.com',
    description: 'Scalable enterprise e-commerce platform for online stores.',
    bgColor: 'from-blue-600/20 to-cyan-600/20',
    accentColor: 'text-blue-400'
  },

  // --- Emergency Services: National Helplines (Bangladesh) ---
  {
    id: 'emer_999',
    titleBn: 'National Emergency Service (999)',
    titleEn: 'National Emergency Service (999)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=nhd.gov.bd&sz=128',
    url: 'https://nhd.gov.bd',
    description: 'National emergency response for Police, Fire, and Ambulance.',
    bgColor: 'from-red-600/20 to-rose-700/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'emer_333',
    titleBn: 'Government Information & Services (333)',
    titleEn: 'Government Information & Services (333)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=333.gov.bd&sz=128',
    url: 'https://333.gov.bd',
    description: 'Call center for government information, social assistance, and services.',
    bgColor: 'from-emerald-600/20 to-green-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'emer_1098',
    titleBn: 'Child Helpline (1098)',
    titleEn: 'Child Helpline (1098)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mowca.gov.bd&sz=128',
    url: 'https://mowca.gov.bd',
    description: 'Toll-free helpline for child protection and assistance.',
    bgColor: 'from-sky-500/20 to-blue-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'emer_109',
    titleBn: 'Women & Children Abuse Help (109)',
    titleEn: 'Women & Children Abuse Help (109)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.mspvaw.gov.bd&sz=128',
    url: 'http://www.mspvaw.gov.bd',
    description: 'Helpline for preventing violence against women and children.',
    bgColor: 'from-pink-500/20 to-rose-600/20',
    accentColor: 'text-pink-400'
  },
  {
    id: 'emer_1090',
    titleBn: 'Disaster Early Warning (1090)',
    titleEn: 'Disaster Early Warning (1090)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=modmr.gov.bd&sz=128',
    url: 'http://modmr.gov.bd',
    description: 'Weather, cyclone, and flood disaster early warning system.',
    bgColor: 'from-amber-500/20 to-orange-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'emer_16430',
    titleBn: 'National Legal Aid (16430)',
    titleEn: 'National Legal Aid (16430)',
    category: 'Emergency Services',
    subcategory: 'National Helplines (Bangladesh)',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.legalaid.gov.bd&sz=128',
    url: 'http://www.legalaid.gov.bd',
    description: 'Free legal advice and assistance service by the government.',
    bgColor: 'from-purple-500/20 to-indigo-600/20',
    accentColor: 'text-purple-400'
  },

  // --- Emergency Services: Health & Medical ---
  {
    id: 'emer_16263',
    titleBn: 'Health Portal (16263)',
    titleEn: 'Health Portal (16263)',
    category: 'Emergency Services',
    subcategory: 'Health & Medical',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=dghs.gov.bd&sz=128',
    url: 'https://dghs.gov.bd',
    description: '24/7 tele-medicine and health info helpline by DGHS.',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'emer_blooddonorsbd',
    titleBn: 'Blood Donors BD',
    titleEn: 'Blood Donors BD',
    category: 'Emergency Services',
    subcategory: 'Health & Medical',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.blooddonorsbd.com&sz=128',
    url: 'https://www.blooddonorsbd.com',
    description: 'Emergency voluntary blood donor finder platform.',
    bgColor: 'from-red-600/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'emer_quantumblood',
    titleBn: 'Quantum Foundation Blood Bank',
    titleEn: 'Quantum Foundation Blood Bank',
    category: 'Emergency Services',
    subcategory: 'Health & Medical',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=blood.quantummethod.org.bd&sz=128',
    url: 'https://blood.quantummethod.org.bd',
    description: '24-hour emergency lab and blood bank service.',
    bgColor: 'from-red-500/20 to-amber-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'emer_bdrcs',
    titleBn: 'Red Crescent Bangladesh',
    titleEn: 'Red Crescent Bangladesh',
    category: 'Emergency Services',
    subcategory: 'Health & Medical',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=bdrcs.org&sz=128',
    url: 'https://bdrcs.org',
    description: 'Humanitarian relief, disaster response, and ambulance support.',
    bgColor: 'from-rose-600/20 to-red-600/20',
    accentColor: 'text-rose-400'
  },
  {
    id: 'emer_bloodflow',
    titleBn: 'BloodFlow',
    titleEn: 'BloodFlow',
    category: 'Emergency Services',
    subcategory: 'Health & Medical',
    iconType: 'image',
    iconUrl: bloodflowLogo,
    url: 'https://bloodflow-kappa.vercel.app/',
    description: 'Emergency blood donation and donor management platform.',
    bgColor: 'from-red-600/20 to-rose-700/20',
    accentColor: 'text-red-400'
  },

  // --- Emergency Services: Cyber & Public Safety ---
  {
    id: 'emer_cpc',
    titleBn: 'Cyber Police Centre (CPC)',
    titleEn: 'Cyber Police Centre (CPC)',
    category: 'Emergency Services',
    subcategory: 'Cyber & Public Safety',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cpc.police.gov.bd&sz=128',
    url: 'https://cpc.police.gov.bd',
    description: 'Cyber crime reporting and online harassment support.',
    bgColor: 'from-blue-600/20 to-indigo-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'emer_pcsw',
    titleBn: 'Police Cyber Support for Women',
    titleEn: 'Police Cyber Support for Women',
    category: 'Emergency Services',
    subcategory: 'Cyber & Public Safety',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128',
    url: 'https://www.facebook.com/pcswofficial',
    description: 'Dedicated cyber safety support network for women.',
    bgColor: 'from-fuchsia-600/20 to-purple-600/20',
    accentColor: 'text-fuchsia-400'
  },
  {
    id: 'emer_fireservice',
    titleBn: 'Fire Service & Civil Defence',
    titleEn: 'Fire Service & Civil Defence',
    category: 'Emergency Services',
    subcategory: 'Cyber & Public Safety',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=fireservice.gov.bd&sz=128',
    url: 'https://fireservice.gov.bd',
    description: 'Official fire control, rescue, and ambulance dispatch service.',
    bgColor: 'from-orange-600/20 to-red-700/20',
    accentColor: 'text-orange-400'
  },

  // --- Job & Application: Government Jobs & Exam Portals ---
  {
    id: 'job_teletalk_alljobs',
    titleBn: 'Teletalk All Jobs',
    titleEn: 'Teletalk All Jobs',
    category: 'Job & Application',
    subcategory: 'Government Jobs & Exam Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=alljobs.teletalk.com.bd&sz=128',
    url: 'https://alljobs.teletalk.com.bd',
    description: 'Central portal for all Teletalk government job application forms.',
    bgColor: 'from-emerald-600/20 to-teal-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'job_bpsc',
    titleBn: 'BPSC',
    titleEn: 'BPSC',
    category: 'Job & Application',
    subcategory: 'Government Jobs & Exam Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.bpsc.gov.bd&sz=128',
    url: 'http://www.bpsc.gov.bd',
    description: 'Bangladesh Public Service Commission for BCS and Non-Cadre exams.',
    bgColor: 'from-green-600/20 to-emerald-700/20',
    accentColor: 'text-green-400'
  },
  {
    id: 'job_bdgovt',
    titleBn: 'BD Govt Job Portal',
    titleEn: 'BD Govt Job Portal',
    category: 'Job & Application',
    subcategory: 'Government Jobs & Exam Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=jobs.gov.bd&sz=128',
    url: 'https://jobs.gov.bd',
    description: 'Official portal for Bangladesh government employment notifications.',
    bgColor: 'from-teal-600/20 to-cyan-700/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'job_ntrca',
    titleBn: 'NTRCA',
    titleEn: 'NTRCA',
    category: 'Job & Application',
    subcategory: 'Government Jobs & Exam Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=ngca.teletalk.com.bd&sz=128',
    url: 'http://ngca.teletalk.com.bd',
    description: 'Non-Government Teachers Registration and Certification Authority.',
    bgColor: 'from-blue-600/20 to-indigo-700/20',
    accentColor: 'text-blue-400'
  },

  // --- Job & Application: Private & International Job Sites ---
  {
    id: 'job_bdjobs',
    titleBn: 'Bdjobs',
    titleEn: 'Bdjobs',
    category: 'Job & Application',
    subcategory: 'Private & International Job Sites',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.bdjobs.com&sz=128',
    url: 'https://www.bdjobs.com',
    description: 'Largest job site in Bangladesh for corporate and private career opportunities.',
    bgColor: 'from-blue-600/20 to-sky-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'job_linkedin',
    titleBn: 'LinkedIn',
    titleEn: 'LinkedIn',
    category: 'Job & Application',
    subcategory: 'Private & International Job Sites',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.linkedin.com&sz=128',
    url: 'https://www.linkedin.com',
    description: 'Professional networking and global job search platform.',
    bgColor: 'from-sky-600/20 to-blue-700/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'job_glassdoor',
    titleBn: 'Glassdoor',
    titleEn: 'Glassdoor',
    category: 'Job & Application',
    subcategory: 'Private & International Job Sites',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.glassdoor.com&sz=128',
    url: 'https://www.glassdoor.com',
    description: 'Search jobs, salary insights, and company reviews globally.',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'job_indeed',
    titleBn: 'Indeed',
    titleEn: 'Indeed',
    category: 'Job & Application',
    subcategory: 'Private & International Job Sites',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.indeed.com&sz=128',
    url: 'https://www.indeed.com',
    description: 'Global employment search engine for corporate and remote roles.',
    bgColor: 'from-indigo-600/20 to-blue-700/20',
    accentColor: 'text-indigo-400'
  },

  // --- Job & Application: Tech & Remote Work Platforms ---
  {
    id: 'job_upwork',
    titleBn: 'Upwork',
    titleEn: 'Upwork',
    category: 'Job & Application',
    subcategory: 'Tech & Remote Work Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.upwork.com&sz=128',
    url: 'https://www.upwork.com',
    description: 'Freelance marketplace for developers, designers, and professionals.',
    bgColor: 'from-green-500/20 to-emerald-600/20',
    accentColor: 'text-green-400'
  },
  {
    id: 'job_fiverr',
    titleBn: 'Fiverr',
    titleEn: 'Fiverr',
    category: 'Job & Application',
    subcategory: 'Tech & Remote Work Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.fiverr.com&sz=128',
    url: 'https://www.fiverr.com',
    description: 'Freelance services marketplace for digital projects and gigs.',
    bgColor: 'from-emerald-600/20 to-green-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'job_wellfound',
    titleBn: 'Wellfound (AngelList)',
    titleEn: 'Wellfound (AngelList)',
    category: 'Job & Application',
    subcategory: 'Tech & Remote Work Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=wellfound.com&sz=128',
    url: 'https://wellfound.com',
    description: 'Job portal for remote startup jobs and tech talents.',
    bgColor: 'from-rose-500/20 to-pink-600/20',
    accentColor: 'text-rose-400'
  },
  {
    id: 'job_remoteok',
    titleBn: 'Remote OK',
    titleEn: 'Remote OK',
    category: 'Job & Application',
    subcategory: 'Tech & Remote Work Platforms',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=remoteok.com&sz=128',
    url: 'https://remoteok.com',
    description: 'Popular job board for remote software development and design jobs.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },

  // --- Photo & Studio: Online Editors & Design ---
  {
    id: 'photo_canva',
    titleBn: 'Canva',
    titleEn: 'Canva',
    category: 'Photo & Studio',
    subcategory: 'Online Editors & Design',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.canva.com&sz=128',
    url: 'https://www.canva.com',
    description: 'All-in-one graphic design, photo editing, and presentation tool.',
    bgColor: 'from-cyan-500/20 to-blue-600/20',
    accentColor: 'text-cyan-400'
  },
  {
    id: 'photo_photopea',
    titleBn: 'Photopea',
    titleEn: 'Photopea',
    category: 'Photo & Studio',
    subcategory: 'Online Editors & Design',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.photopea.com&sz=128',
    url: 'https://www.photopea.com',
    description: 'Free web-based Photoshop alternative for editing PSD, AI, and Sketch files.',
    bgColor: 'from-sky-600/20 to-emerald-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'photo_pixlr',
    titleBn: 'Pixlr',
    titleEn: 'Pixlr',
    category: 'Photo & Studio',
    subcategory: 'Online Editors & Design',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=pixlr.com&sz=128',
    url: 'https://pixlr.com',
    description: 'AI-powered online photo editor and design studio.',
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'photo_figma',
    titleBn: 'Figma',
    titleEn: 'Figma',
    category: 'Photo & Studio',
    subcategory: 'Online Editors & Design',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.figma.com&sz=128',
    url: 'https://www.figma.com',
    description: 'Collaborative interface design and vector graphics editor.',
    bgColor: 'from-purple-500/20 to-pink-600/20',
    accentColor: 'text-purple-400'
  },

  // --- Photo & Studio: Background & Upscaling Tools ---
  {
    id: 'photo_removebg',
    titleBn: 'remove.bg',
    titleEn: 'remove.bg',
    category: 'Photo & Studio',
    subcategory: 'Background & Upscaling Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.remove.bg&sz=128',
    url: 'https://www.remove.bg',
    description: 'Instantly remove image background automatically in 5 seconds.',
    bgColor: 'from-yellow-500/20 to-amber-600/20',
    accentColor: 'text-yellow-400'
  },
  {
    id: 'photo_cutoutpro',
    titleBn: 'Cutout.pro',
    titleEn: 'Cutout.pro',
    category: 'Photo & Studio',
    subcategory: 'Background & Upscaling Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.cutout.pro&sz=128',
    url: 'https://www.cutout.pro',
    description: 'AI photo cutout, passport photo maker, and background remover.',
    bgColor: 'from-emerald-500/20 to-teal-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'photo_vanceai',
    titleBn: 'VanceAI / Upscayl',
    titleEn: 'VanceAI / Upscayl',
    category: 'Photo & Studio',
    subcategory: 'Background & Upscaling Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=vanceai.com&sz=128',
    url: 'https://vanceai.com',
    description: 'AI image upscaler and photo enhancer for low-res images.',
    bgColor: 'from-violet-500/20 to-purple-600/20',
    accentColor: 'text-violet-400'
  },
  {
    id: 'photo_cleanup',
    titleBn: 'Cleanup.pictures',
    titleEn: 'Cleanup.pictures',
    category: 'Photo & Studio',
    subcategory: 'Background & Upscaling Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cleanup.pictures&sz=128',
    url: 'https://cleanup.pictures',
    description: 'Remove unwanted objects, people, or text from photos quickly.',
    bgColor: 'from-indigo-500/20 to-blue-600/20',
    accentColor: 'text-indigo-400'
  },

  // --- Photo & Studio: Stock Photos & Assets ---
  {
    id: 'photo_unsplash',
    titleBn: 'Unsplash',
    titleEn: 'Unsplash',
    category: 'Photo & Studio',
    subcategory: 'Stock Photos & Assets',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=unsplash.com&sz=128',
    url: 'https://unsplash.com',
    description: 'High-resolution freely-usable royalty-free images.',
    bgColor: 'from-slate-600/20 to-zinc-700/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'photo_pexels',
    titleBn: 'Pexels',
    titleEn: 'Pexels',
    category: 'Photo & Studio',
    subcategory: 'Stock Photos & Assets',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.pexels.com&sz=128',
    url: 'https://www.pexels.com',
    description: 'Free stock photos & videos shared by talented creators.',
    bgColor: 'from-emerald-600/20 to-teal-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'photo_freepik',
    titleBn: 'Freepik',
    titleEn: 'Freepik',
    category: 'Photo & Studio',
    subcategory: 'Stock Photos & Assets',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.freepik.com&sz=128',
    url: 'https://www.freepik.com',
    description: 'Vectors, stock photos, PSD, and icons for graphic projects.',
    bgColor: 'from-blue-600/20 to-cyan-700/20',
    accentColor: 'text-blue-400'
  },

  // --- IT & Calculations: Developer & IT Tools ---
  {
    id: 'it_github',
    titleBn: 'GitHub',
    titleEn: 'GitHub',
    category: 'IT & Calculations',
    subcategory: 'Developer & IT Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    url: 'https://github.com',
    description: 'Code hosting platform for version control and collaboration.',
    bgColor: 'from-slate-700/20 to-zinc-800/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'it_stackoverflow',
    titleBn: 'Stack Overflow',
    titleEn: 'Stack Overflow',
    category: 'IT & Calculations',
    subcategory: 'Developer & IT Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=128',
    url: 'https://stackoverflow.com',
    description: 'Question and answer site for professional and enthusiast programmers.',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'it_codepen',
    titleBn: 'Codepen',
    titleEn: 'Codepen',
    category: 'IT & Calculations',
    subcategory: 'Developer & IT Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=codepen.io&sz=128',
    url: 'https://codepen.io',
    description: 'Online code editor and front-end web development environment.',
    bgColor: 'from-slate-600/20 to-neutral-700/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'it_cloudflare',
    titleBn: 'Cloudflare',
    titleEn: 'Cloudflare',
    category: 'IT & Calculations',
    subcategory: 'Developer & IT Tools',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.cloudflare.com&sz=128',
    url: 'https://www.cloudflare.com',
    description: 'DNS, web security, and performance acceleration platform.',
    bgColor: 'from-amber-600/20 to-orange-600/20',
    accentColor: 'text-amber-400'
  },

  // --- IT & Calculations: Online Calculators & Utilities ---
  {
    id: 'it_calculator_net',
    titleBn: 'Calculator.net',
    titleEn: 'Calculator.net',
    category: 'IT & Calculations',
    subcategory: 'Online Calculators & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.calculator.net&sz=128',
    url: 'https://www.calculator.net',
    description: 'Free online calculators for financial, fitness, math, and general use.',
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'it_omni_calculator',
    titleBn: 'Omni Calculator',
    titleEn: 'Omni Calculator',
    category: 'IT & Calculations',
    subcategory: 'Online Calculators & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.omnicalculator.com&sz=128',
    url: 'https://www.omnicalculator.com',
    description: 'Custom calculators for physics, business, health, and everyday math.',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'it_convertio',
    titleBn: 'Convertio',
    titleEn: 'Convertio',
    category: 'IT & Calculations',
    subcategory: 'Online Calculators & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=convertio.co&sz=128',
    url: 'https://convertio.co',
    description: 'Advanced online file converter for documents, images, and audio.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'it_speedtest',
    titleBn: 'Speedtest by Ookla',
    titleEn: 'Speedtest by Ookla',
    category: 'IT & Calculations',
    subcategory: 'Online Calculators & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.speedtest.net&sz=128',
    url: 'https://www.speedtest.net',
    description: 'Test internet speed, latency, and network connection quality.',
    bgColor: 'from-sky-500/20 to-blue-600/20',
    accentColor: 'text-sky-400'
  },

  // --- Messaging & Social: Direct Messaging & Chat Apps ---
  {
    id: 'social_whatsapp',
    titleBn: 'WhatsApp Web',
    titleEn: 'WhatsApp Web',
    category: 'Messaging & Social',
    subcategory: 'Direct Messaging & Chat Apps',
    iconType: 'image',
    iconUrl: '/src/assets/images/whatsapp_logo_1786897308077.jpg',
    url: 'https://web.whatsapp.com',
    description: 'Messaging app for browser-based text, voice, and media sharing.',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'social_telegram',
    titleBn: 'Telegram Web',
    titleEn: 'Telegram Web',
    category: 'Messaging & Social',
    subcategory: 'Direct Messaging & Chat Apps',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=web.telegram.org&sz=128',
    url: 'https://web.telegram.org',
    description: 'Cloud-based instant messaging service with focus on speed and security.',
    bgColor: 'from-sky-500/20 to-cyan-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'social_messenger',
    titleBn: 'Messenger',
    titleEn: 'Messenger',
    category: 'Messaging & Social',
    subcategory: 'Direct Messaging & Chat Apps',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.messenger.com&sz=128',
    url: 'https://www.messenger.com',
    description: 'Instant messaging app by Meta for Facebook friends and contacts.',
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'social_slack',
    titleBn: 'Slack',
    titleEn: 'Slack',
    category: 'Messaging & Social',
    subcategory: 'Direct Messaging & Chat Apps',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=slack.com&sz=128',
    url: 'https://slack.com',
    description: 'Workplace communication platform for team messaging and channels.',
    bgColor: 'from-purple-500/20 to-violet-600/20',
    accentColor: 'text-purple-400'
  },

  // --- Messaging & Social: Social Networks & Community ---
  {
    id: 'social_facebook',
    titleBn: 'Facebook',
    titleEn: 'Facebook',
    category: 'Messaging & Social',
    subcategory: 'Social Networks & Community',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.facebook.com&sz=128',
    url: 'https://www.facebook.com',
    description: 'Global social networking platform to connect with friends and family.',
    bgColor: 'from-blue-600/20 to-sky-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'social_x',
    titleBn: 'X (Twitter)',
    titleEn: 'X (Twitter)',
    category: 'Messaging & Social',
    subcategory: 'Social Networks & Community',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=x.com&sz=128',
    url: 'https://x.com',
    description: 'Social networking service for real-time news, updates, and microblogging.',
    bgColor: 'from-zinc-700/20 to-slate-800/20',
    accentColor: 'text-zinc-300'
  },
  {
    id: 'social_reddit',
    titleBn: 'Reddit',
    titleEn: 'Reddit',
    category: 'Messaging & Social',
    subcategory: 'Social Networks & Community',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.reddit.com&sz=128',
    url: 'https://www.reddit.com',
    description: 'Network of communities where people dive into their interests and topics.',
    bgColor: 'from-orange-600/20 to-red-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'social_youtube',
    titleBn: 'YouTube',
    titleEn: 'YouTube',
    category: 'Messaging & Social',
    subcategory: 'Social Networks & Community',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.youtube.com&sz=128',
    url: 'https://www.youtube.com',
    description: 'Global video sharing and social media platform.',
    bgColor: 'from-red-600/20 to-rose-700/20',
    accentColor: 'text-red-400'
  },

  // --- Print & Documents: Document Editors & Utilities ---
  {
    id: 'doc_google_docs',
    titleBn: 'Google Docs',
    titleEn: 'Google Docs',
    category: 'Print & Documents',
    subcategory: 'Document Editors & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=docs.google.com&sz=128',
    url: 'https://docs.google.com',
    description: 'Online document editor for creating, editing, and sharing word files.',
    bgColor: 'from-blue-500/20 to-indigo-600/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'doc_ilovepdf',
    titleBn: 'iLovePDF',
    titleEn: 'iLovePDF',
    category: 'Print & Documents',
    subcategory: 'Document Editors & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.ilovepdf.com&sz=128',
    url: 'https://www.ilovepdf.com',
    description: 'Online PDF converter, merge, split, compress, and editing tools.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'doc_smallpdf',
    titleBn: 'Smallpdf',
    titleEn: 'Smallpdf',
    category: 'Print & Documents',
    subcategory: 'Document Editors & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=smallpdf.com&sz=128',
    url: 'https://smallpdf.com',
    description: 'All-in-one easy-to-use PDF conversion and compression suite.',
    bgColor: 'from-amber-500/20 to-orange-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'doc_overleaf',
    titleBn: 'Overleaf (LaTeX)',
    titleEn: 'Overleaf (LaTeX)',
    category: 'Print & Documents',
    subcategory: 'Document Editors & Utilities',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.overleaf.com&sz=128',
    url: 'https://www.overleaf.com',
    description: 'Collaborative online LaTeX editor for academic papers and documents.',
    bgColor: 'from-emerald-600/20 to-teal-700/20',
    accentColor: 'text-emerald-400'
  },

  // --- Marketing & Ads: Digital Marketing & Analytics ---
  {
    id: 'mkt_meta_ads',
    titleBn: 'Meta Ads Manager',
    titleEn: 'Meta Ads Manager',
    category: 'Marketing & Ads',
    subcategory: 'Digital Marketing & Analytics',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=adsmanager.facebook.com&sz=128',
    url: 'https://adsmanager.facebook.com',
    description: 'Create, manage, and track ad campaigns across Facebook and Instagram.',
    bgColor: 'from-blue-600/20 to-sky-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'mkt_google_ads',
    titleBn: 'Google Ads',
    titleEn: 'Google Ads',
    category: 'Marketing & Ads',
    subcategory: 'Digital Marketing & Analytics',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=ads.google.com&sz=128',
    url: 'https://ads.google.com?subid=xs-ip-gemini-adlc',
    description: 'Online advertising platform to promote business on Google Search and YouTube.',
    bgColor: 'from-amber-500/20 to-yellow-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'mkt_google_analytics',
    titleBn: 'Google Analytics',
    titleEn: 'Google Analytics',
    category: 'Marketing & Ads',
    subcategory: 'Digital Marketing & Analytics',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=analytics.google.com&sz=128',
    url: 'https://analytics.google.com',
    description: 'Web analytics platform to track website traffic, users, and performance.',
    bgColor: 'from-orange-500/20 to-amber-600/20',
    accentColor: 'text-orange-400'
  },
  {
    id: 'mkt_mailchimp',
    titleBn: 'Mailchimp',
    titleEn: 'Mailchimp',
    category: 'Marketing & Ads',
    subcategory: 'Digital Marketing & Analytics',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mailchimp.com&sz=128',
    url: 'https://mailchimp.com',
    description: 'Email marketing, automation, and audience management suite.',
    bgColor: 'from-yellow-500/20 to-amber-500/20',
    accentColor: 'text-yellow-400'
  },
  {
    id: 'mkt_semrush',
    titleBn: 'SEMrush',
    titleEn: 'SEMrush',
    category: 'Marketing & Ads',
    subcategory: 'Digital Marketing & Analytics',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.semrush.com&sz=128',
    url: 'https://www.semrush.com',
    description: 'SEO tool for keyword research, competitor analysis, and site audit.',
    bgColor: 'from-orange-600/20 to-red-600/20',
    accentColor: 'text-orange-400'
  },

  // --- Education & Career: Online Learning & Skill Development ---
  {
    id: 'edu_coursera',
    titleBn: 'Coursera',
    titleEn: 'Coursera',
    category: 'Education & Career',
    subcategory: 'Online Learning & Skill Development',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.coursera.org&sz=128',
    url: 'https://www.coursera.org',
    description: 'Online courses and degrees from top universities and tech companies.',
    bgColor: 'from-blue-600/20 to-indigo-700/20',
    accentColor: 'text-blue-400'
  },
  {
    id: 'edu_udemy',
    titleBn: 'Udemy',
    titleEn: 'Udemy',
    category: 'Education & Career',
    subcategory: 'Online Learning & Skill Development',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.udemy.com&sz=128',
    url: 'https://www.udemy.com',
    description: 'Global marketplace for learning development, design, and business skills.',
    bgColor: 'from-purple-600/20 to-fuchsia-700/20',
    accentColor: 'text-purple-400'
  },
  {
    id: 'edu_ten_min_school',
    titleBn: '10 Minute School',
    titleEn: '10 Minute School',
    category: 'Education & Career',
    subcategory: 'Online Learning & Skill Development',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=10minuteschool.com&sz=128',
    url: 'https://10minuteschool.com',
    description: 'Largest online educational platform in Bangladesh for academic and skills.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'edu_khan_academy',
    titleBn: 'Khan Academy',
    titleEn: 'Khan Academy',
    category: 'Education & Career',
    subcategory: 'Online Learning & Skill Development',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.khanacademy.org&sz=128',
    url: 'https://www.khanacademy.org',
    description: 'Free online courses, lessons, and practice in math and science.',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'edu_w3schools',
    titleBn: 'w3schools',
    titleEn: 'w3schools',
    category: 'Education & Career',
    subcategory: 'Online Learning & Skill Development',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.w3schools.com&sz=128',
    url: 'https://www.w3schools.com',
    description: 'Free web development tutorials and code references.',
    bgColor: 'from-emerald-600/20 to-green-700/20',
    accentColor: 'text-emerald-400'
  },

  // --- Personal Bookmarks: Productivity & Management ---
  {
    id: 'bm_google_drive',
    titleBn: 'Google Drive',
    titleEn: 'Google Drive',
    category: 'Personal Bookmarks',
    subcategory: 'Productivity & Management',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=128',
    url: 'https://drive.google.com',
    description: 'Cloud storage and file backup service by Google.',
    bgColor: 'from-amber-500/20 to-emerald-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'bm_trello',
    titleBn: 'Trello',
    titleEn: 'Trello',
    category: 'Personal Bookmarks',
    subcategory: 'Productivity & Management',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=trello.com&sz=128',
    url: 'https://trello.com',
    description: 'Kanban-style project management and task tracking board.',
    bgColor: 'from-sky-500/20 to-blue-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'bm_notion',
    titleBn: 'Notion',
    titleEn: 'Notion',
    category: 'Personal Bookmarks',
    subcategory: 'Productivity & Management',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.notion.so&sz=128',
    url: 'https://www.notion.so',
    description: 'All-in-one workspace for notes, docs, task lists, and databases.',
    bgColor: 'from-zinc-600/20 to-slate-800/20',
    accentColor: 'text-zinc-300'
  },
  {
    id: 'bm_google_keep',
    titleBn: 'Google Keep',
    titleEn: 'Google Keep',
    category: 'Personal Bookmarks',
    subcategory: 'Productivity & Management',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=keep.google.com&sz=128',
    url: 'https://keep.google.com',
    description: 'Quick note-taking, checklists, and voice memo service.',
    bgColor: 'from-yellow-500/20 to-amber-600/20',
    accentColor: 'text-yellow-400'
  },

  // --- Entertainment & Streaming ---
  {
    id: 'ent_netflix',
    titleBn: 'Netflix',
    titleEn: 'Netflix',
    category: 'Entertainment & Streaming',
    subcategory: 'Movies, Music & Live TV',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.netflix.com&sz=128',
    url: 'https://www.netflix.com',
    description: 'Stream movies, TV shows, and original series online.',
    bgColor: 'from-red-600/20 to-rose-700/20',
    accentColor: 'text-red-500'
  },
  {
    id: 'ent_spotify',
    titleBn: 'Spotify',
    titleEn: 'Spotify',
    category: 'Entertainment & Streaming',
    subcategory: 'Movies, Music & Live TV',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=open.spotify.com&sz=128',
    url: 'https://open.spotify.com',
    description: 'Digital music, podcast, and audio streaming service.',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'ent_chorki',
    titleBn: 'Chorki',
    titleEn: 'Chorki',
    category: 'Entertainment & Streaming',
    subcategory: 'Movies, Music & Live TV',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.chorki.com&sz=128',
    url: 'https://www.chorki.com',
    description: 'Bangla OTT platform for movies, series, and original content.',
    bgColor: 'from-amber-500/20 to-yellow-600/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'ent_toffee',
    titleBn: 'Toffee',
    titleEn: 'Toffee',
    category: 'Entertainment & Streaming',
    subcategory: 'Movies, Music & Live TV',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=toffeelive.com&sz=128',
    url: 'https://toffeelive.com',
    description: 'Live TV channels, sports streaming, and entertainment portal in BD.',
    bgColor: 'from-red-500/20 to-orange-600/20',
    accentColor: 'text-red-400'
  },

  // --- Travel & Ticketing ---
  {
    id: 'trv_bd_railway',
    titleBn: 'Bangladesh Railway E-Ticketing',
    titleEn: 'Bangladesh Railway E-Ticketing',
    category: 'Travel & Ticketing',
    subcategory: 'Train, Flight & Hotel Booking',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=eticket.railway.gov.bd&sz=128',
    url: 'https://eticket.railway.gov.bd',
    description: 'Official online train ticket booking portal.',
    bgColor: 'from-emerald-600/20 to-teal-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'trv_shohoz',
    titleBn: 'Shohoz',
    titleEn: 'Shohoz',
    category: 'Travel & Ticketing',
    subcategory: 'Train, Flight & Hotel Booking',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.shohoz.com&sz=128',
    url: 'https://www.shohoz.com',
    description: 'Online bus, launch, and event ticket booking service.',
    bgColor: 'from-red-500/20 to-rose-600/20',
    accentColor: 'text-red-400'
  },
  {
    id: 'trv_sharetrip',
    titleBn: 'ShareTrip',
    titleEn: 'ShareTrip',
    category: 'Travel & Ticketing',
    subcategory: 'Train, Flight & Hotel Booking',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=sharetrip.net&sz=128',
    url: 'https://sharetrip.net',
    description: 'Flight booking, hotel reservation, and travel package platform.',
    bgColor: 'from-sky-500/20 to-blue-600/20',
    accentColor: 'text-sky-400'
  },
  {
    id: 'trv_booking',
    titleBn: 'Booking.com',
    titleEn: 'Booking.com',
    category: 'Travel & Ticketing',
    subcategory: 'Train, Flight & Hotel Booking',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.booking.com&sz=128',
    url: 'https://www.booking.com',
    description: 'Global hotel booking and accommodation marketplace.',
    bgColor: 'from-blue-600/20 to-indigo-700/20',
    accentColor: 'text-blue-400'
  },

  // --- Utilities & Govt Services ---
  {
    id: 'gov_nid',
    titleBn: 'NID Application System',
    titleEn: 'NID Application System',
    category: 'Utilities & Govt Services',
    subcategory: 'E-Services & Citizen Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=services.nidw.gov.bd&sz=128',
    url: 'https://services.nidw.gov.bd',
    description: 'Official Bangladesh National ID card correction, download, and registration portal.',
    bgColor: 'from-emerald-600/20 to-green-700/20',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'gov_epassport',
    titleBn: 'e-Passport Portal',
    titleEn: 'e-Passport Portal',
    category: 'Utilities & Govt Services',
    subcategory: 'E-Services & Citizen Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.epassport.gov.bd&sz=128',
    url: 'https://www.epassport.gov.bd',
    description: 'Online application system for Bangladesh e-Passport.',
    bgColor: 'from-teal-600/20 to-cyan-700/20',
    accentColor: 'text-teal-400'
  },
  {
    id: 'gov_etin',
    titleBn: 'e-TIN (NBR)',
    titleEn: 'e-TIN (NBR)',
    category: 'Utilities & Govt Services',
    subcategory: 'E-Services & Citizen Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=secure.incometax.gov.bd&sz=128',
    url: 'https://secure.incometax.gov.bd',
    description: 'National Board of Revenue online TIN registration and return filing portal.',
    bgColor: 'from-amber-600/20 to-orange-700/20',
    accentColor: 'text-amber-400'
  },
  {
    id: 'gov_dpdc',
    titleBn: 'DPDC Online Payment',
    titleEn: 'DPDC Online Payment',
    category: 'Utilities & Govt Services',
    subcategory: 'E-Services & Citizen Portals',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=dpdc.gov.bd&sz=128',
    url: 'https://dpdc.gov.bd',
    description: 'Electricity bill payment and customer service portal.',
    bgColor: 'from-blue-500/20 to-sky-600/20',
    accentColor: 'text-blue-400'
  },

  // --- News & Media ---
  {
    id: 'news_prothomalo',
    titleBn: 'Prothom Alo',
    titleEn: 'Prothom Alo',
    category: 'News & Media',
    subcategory: 'National & International Press',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.prothomalo.com&sz=128',
    url: 'https://www.prothomalo.com',
    description: 'Leading daily newspaper portal in Bangladesh.',
    bgColor: 'from-rose-500/20 to-red-600/20',
    accentColor: 'text-rose-400'
  },
  {
    id: 'news_dailystar',
    titleBn: 'The Daily Star',
    titleEn: 'The Daily Star',
    category: 'News & Media',
    subcategory: 'National & International Press',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.thedailystar.net&sz=128',
    url: 'https://www.thedailystar.net',
    description: 'Popular English daily newspaper in Bangladesh.',
    bgColor: 'from-slate-600/20 to-zinc-700/20',
    accentColor: 'text-slate-300'
  },
  {
    id: 'news_bbc',
    titleBn: 'BBC News',
    titleEn: 'BBC News',
    category: 'News & Media',
    subcategory: 'National & International Press',
    iconType: 'image',
    iconUrl: 'https://www.google.com/s2/favicons?domain=www.bbc.com&sz=128',
    url: 'https://www.bbc.com/news',
    description: 'Global news coverage, analysis, and reporting.',
    bgColor: 'from-red-600/20 to-rose-700/20',
    accentColor: 'text-red-400'
  },

  // --- Existing Preset Services ---
  {
    id: 's1',
    titleBn: 'ফাইন্ড ফটো',
    titleEn: 'Find Photo',
    category: 'Photo & Studio',
    iconType: 'photo',
    url: 'https://images.google.com',
    bgColor: 'from-emerald-500/20 to-teal-500/20',
    accentColor: 'text-emerald-400',
    description: 'সহজে আপনার যেকোনো ছবি খুঁজুন ও প্রস্তুত করুন'
  },
  {
    id: 's2',
    titleBn: 'আইটি হিসাব',
    titleEn: 'IT Calculator',
    category: 'হিসাব-নিকাশ',
    iconType: 'calc',
    url: '#converters',
    bgColor: 'from-rose-500/20 to-pink-500/20',
    accentColor: 'text-rose-400',
    description: 'ব্যবসায়িক ও ব্যাক্তিগত দ্রুত আইটি ও বাজেট হিসাব'
  },
  {
    id: 's3',
    titleBn: 'ইমো ফটো কনভার্ট',
    titleEn: 'IMO Photo Convert',
    category: 'ছবি ও স্টুডিও',
    iconType: 'convert',
    url: 'https://tinypng.com',
    bgColor: 'from-sky-500/20 to-blue-500/20',
    accentColor: 'text-sky-400',
    description: 'লো-রেজোলিউশনের ছবিকে HD কোয়ালিটিতে কনভার্ট করুন'
  },
  {
    id: 's4',
    titleBn: 'হোয়াটস্ অ্যাপ',
    titleEn: 'WhatsApp Direct',
    category: 'যোগাযোগ',
    iconType: 'whatsapp',
    url: 'https://web.whatsapp.com',
    bgColor: 'from-emerald-600/20 to-green-500/20',
    accentColor: 'text-emerald-400',
    description: 'নম্বর সেভ না করেই সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন'
  },
  {
    id: 's5',
    titleBn: 'আমার বিজ্ঞাপন',
    titleEn: 'My Ads',
    category: 'মার্কেটিং',
    iconType: 'ad',
    url: 'https://facebook.com/adsmanager',
    bgColor: 'from-amber-500/20 to-orange-500/20',
    accentColor: 'text-amber-400',
    description: 'সোশ্যাল মিডিয়া ও গুগল এডভার্টাইজিং ব্যানার'
  },
  {
    id: 's6',
    titleBn: 'ফটো স্টুডিও Pro',
    titleEn: 'Photo Studio',
    category: 'ছবি ও স্টুডিও',
    iconType: 'studio',
    url: 'https://pixlr.com',
    bgColor: 'from-cyan-500/20 to-blue-600/20',
    accentColor: 'text-cyan-400',
    description: 'ব্যাকগ্রাউন্ড রিমুভ ও ছবি অটো এডিটিং টুল'
  },
  {
    id: 's7',
    titleBn: 'টেলিটক জবস্ অটো ফিল',
    titleEn: 'Teletalk Jobs Auto Fill',
    category: 'চাকরি ও আবেদন',
    iconType: 'autofill',
    url: 'http://alljobs.teletalk.com.bd',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400',
    description: 'সরকারি চাকরির ফরম এক ক্লিকে অটোমেটিক ফিল-আপ'
  },
  {
    id: 's8',
    titleBn: 'NID প্রিন্ট রেডি',
    titleEn: 'NID Print Ready',
    category: 'প্রিন্ট ও ডকুমেন্ট',
    iconType: 'nid',
    url: 'https://services.nidw.gov.bd',
    bgColor: 'from-indigo-500/20 to-purple-500/20',
    accentColor: 'text-indigo-400',
    description: 'এনআইডি কার্ড লেমিনেটিং সাইজে অটো ফিট প্রিন্টিং'
  },
  {
    id: 's9',
    titleBn: 'A4 প্রিন্ট রেডি',
    titleEn: 'A4 Print Layout',
    category: 'প্রিন্ট ও ডকুমেন্ট',
    iconType: 'print',
    url: 'https://docs.google.com',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400',
    description: 'ডকুমেন্ট ও সার্টিফিকেট A4 পেপারে নিখুঁত সাজানো'
  },
  {
    id: 's10',
    titleBn: 'যৌথ ছবি মেকার',
    titleEn: 'Joint Photo Maker',
    category: 'ছবি ও স্টুডিও',
    iconType: 'joint',
    url: 'https://canva.com',
    bgColor: 'from-purple-500/20 to-pink-500/20',
    accentColor: 'text-purple-400',
    description: 'দুই বা ততোধিক ছবি একসাথে যুক্ত করার সহজ টুল'
  }
];

export const BASE_CATEGORY_TABS = [
  { id: 'all', labelBn: 'সব সেবা ও টুলস', labelEn: 'All Services & Tools' },
  { id: 'AI Tools', labelBn: '🤖 এআই টুলস (AI Tools)', labelEn: '🤖 AI Tools' },
  { id: 'Emergency Services', labelBn: '🚨 জরুরি সেবা (Emergency)', labelEn: '🚨 Emergency Services' },
  { id: 'E-Commerce Platform', labelBn: '🛒 ই-কমার্স (E-Commerce)', labelEn: '🛒 E-Commerce Platform' },
  { id: 'Job & Application', labelBn: '💼 চাকরি ও আবেদন (Jobs)', labelEn: '💼 Job & Application' },
  { id: 'Photo & Studio', labelBn: '🎨 ছবি ও ফটো স্টুডিও', labelEn: '🎨 Photo & Studio' },
  { id: 'Print & Documents', labelBn: '🖨️ প্রিন্ট ও ডকুমেন্ট', labelEn: '🖨️ Print & Documents' },
  { id: 'IT & Calculations', labelBn: '💻 আইটি ও হিসাব-নিকাশ', labelEn: '💻 IT & Calculations' },
  { id: 'Messaging & Social', labelBn: '💬 মেসেজিং ও সোশ্যাল', labelEn: '💬 Messaging & Social' },
  { id: 'Marketing & Ads', labelBn: '📢 মার্কেটিং ও বিজ্ঞাপন', labelEn: '📢 Marketing & Ads' },
  { id: 'Education & Career', labelBn: '🎓 শিক্ষা ও ক্যারিয়ার', labelEn: '🎓 Education & Career' },
  { id: 'Personal Bookmarks', labelBn: '📌 ব্যক্তিগত বুকমার্কস', labelEn: '📌 Personal Bookmarks' },
  { id: 'Entertainment & Streaming', labelBn: '🎬 বিনোদন ও স্ট্রিম', labelEn: '🎬 Entertainment & Streaming' },
  { id: 'Travel & Ticketing', labelBn: '✈️ ভ্রমণ ও টিকিট', labelEn: '✈️ Travel & Ticketing' },
  { id: 'Utilities & Govt Services', labelBn: '🏛️ সরকারি ও ই-সেবা', labelEn: '🏛️ Utilities & Govt Services' },
  { id: 'News & Media', labelBn: '📰 সংবাদ ও মিডিয়া', labelEn: '📰 News & Media' },
];

export const getHubStats = () => {
  try {
    const saved = localStorage.getItem('hk_bookmarks');
    const custom: Bookmark[] = saved ? JSON.parse(saved) : [];
    const baseCatIds = BASE_CATEGORY_TABS.filter(t => t.id !== 'all').map(t => t.id);
    const customCats = custom.map(c => c.category).filter(Boolean);
    const uniqueCategories = new Set([...baseCatIds, ...customCats]);
    return {
      servicesCount: PRESET_SERVICES.length + custom.length,
      categoriesCount: uniqueCategories.size
    };
  } catch {
    return {
      servicesCount: PRESET_SERVICES.length,
      categoriesCount: BASE_CATEGORY_TABS.length - 1
    };
  }
};

interface AppHubProps {
  externalSearchQuery?: string;
  userId?: string;
  userName?: string;
}

export default function AppHub({ externalSearchQuery, userId, userName }: AppHubProps = {}) {
  const { t, isBn } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchTerm(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    const handleCategorySelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedCategory(customEvent.detail);
        const el = document.getElementById('app-hub-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hk_select_category', handleCategorySelect);
    return () => window.removeEventListener('hk_select_category', handleCategorySelect);
  }, []);
  
  const storageKey = userId ? `hk_bookmarks_${userId}` : 'hk_bookmarks';

  const [customBookmarks, setCustomBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('hk_bookmarks') || localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Error parsing bookmarks from storage", e);
    }
    return [];
  });

  // Real-time Firestore sync for ALL shared public bookmarks
  useEffect(() => {
    const unsubscribe = subscribeGlobalBookmarks((remoteBookmarks) => {
      if (remoteBookmarks && Array.isArray(remoteBookmarks)) {
        setCustomBookmarks(remoteBookmarks);
        try {
          localStorage.setItem('hk_bookmarks', JSON.stringify(remoteBookmarks));
          localStorage.setItem(storageKey, JSON.stringify(remoteBookmarks));
          window.dispatchEvent(new CustomEvent('hk_bookmarks_updated'));
        } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, [storageKey]);

  // Also sync user subcollection if signed in
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeUserBookmarks(userId, (remoteBookmarks) => {
      if (remoteBookmarks && remoteBookmarks.length > 0) {
        setCustomBookmarks((prev) => {
          const mergedMap = new Map<string, Bookmark>();
          prev.forEach(b => mergedMap.set(b.id, b));
          remoteBookmarks.forEach(b => mergedMap.set(b.id, b));
          return Array.from(mergedMap.values());
        });
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newCategory, setNewCategory] = useState('চাকরি ও আবেদন');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [iconFitMode, setIconFitMode] = useState<'cover' | 'contain'>('cover');
  const [isWrapCategories, setIsWrapCategories] = useState(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoryContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Persist custom bookmarks and notify other components (e.g., StartNavbar)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(customBookmarks));
      window.dispatchEvent(new CustomEvent('hk_bookmarks_updated'));
    } catch (e) {
      console.error(e);
    }
  }, [customBookmarks, storageKey]);

  // Sync with changes from other browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCustomBookmarks((prev) =>
            JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
          );
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey]);

  const getNormalizedUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('#') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewIcon(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBookmarkId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setNewCategory('চাকরি ও আবেদন');
    setCustomCategoryInput('');
    setIconFitMode('cover');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Bookmark) => {
    setEditingBookmarkId(book.id);
    setNewTitle(book.title);
    setNewUrl(book.url);
    setNewIcon(book.icon || '');
    if (['চাকরি ও আবেদন', 'ছবি ও স্টুডিও', 'প্রিন্ট ও ডকুমেন্ট', 'হিসাব-নিকাশ', 'যোগাযোগ', 'মার্কেটিং', 'শিক্ষা', 'ব্যক্তিগত'].includes(book.category)) {
      setNewCategory(book.category);
      setCustomCategoryInput('');
    } else {
      setNewCategory('custom');
      setCustomCategoryInput(book.category);
    }
    setIsModalOpen(true);
  };

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const finalCategory = newCategory === 'custom' ? (customCategoryInput.trim() || 'অন্যান্য') : newCategory;
    const authorName = userName || (userId ? 'ইউজার' : 'পাবলিক ইউজার');

    if (editingBookmarkId) {
      const updatedBookmark: Bookmark = {
        id: editingBookmarkId,
        title: newTitle.trim(),
        url: formattedUrl,
        category: finalCategory,
        icon: newIcon.trim() || undefined,
        addedBy: authorName,
        userId: userId || 'anonymous'
      };

      setCustomBookmarks((prev) =>
        prev.map((b) => (b.id === editingBookmarkId ? updatedBookmark : b))
      );

      // Save to global shared bookmarks collection in Firestore
      saveGlobalBookmarkToFirestore(updatedBookmark, authorName, userId);
      if (userId) {
        saveUserBookmarkToFirestore(userId, updatedBookmark);
      }

      dispatchAppNotification({
        titleBn: '✏️ অ্যাপ লিংক আপডেট হয়েছে',
        titleEn: '✏️ App Link Updated',
        messageBn: `লিংক: "${newTitle.trim()}" (সকলের জন্য আপডেট হয়েছে)`,
        messageEn: `Link: "${newTitle.trim()}" (Updated for all users)`,
        type: 'info'
      });
    } else {
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: newTitle.trim(),
        url: formattedUrl,
        category: finalCategory,
        icon: newIcon.trim() || undefined,
        addedBy: authorName,
        userId: userId || 'anonymous'
      };

      setCustomBookmarks((prev) => [...prev, newBookmark]);

      // Save to global shared bookmarks collection in Firestore
      saveGlobalBookmarkToFirestore(newBookmark, authorName, userId);
      if (userId) {
        saveUserBookmarkToFirestore(userId, newBookmark);
      }

      dispatchAppNotification({
        titleBn: '🌐 নতুন পাবলিক অ্যাপ লিংক যুক্ত হয়েছে',
        titleEn: '🌐 New Public App Link Added',
        messageBn: `লিংক: "${newTitle.trim()}" (সকল ব্যবহারকারী দেখতে পাবেন)`,
        messageEn: `Link: "${newTitle.trim()}" (Visible to all users)`,
        type: 'info'
      });
    }

    setEditingBookmarkId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setNewCategory('চাকরি ও আবেদন');
    setCustomCategoryInput('');
    setIsModalOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    const target = customBookmarks.find((b) => b.id === id);
    if (target) {
      deleteGlobalBookmarkFromFirestore(id);
      if (userId) {
        deleteUserBookmarkFromFirestore(userId, id);
      }
      dispatchAppNotification({
        titleBn: '🗑️ বুকমার্ক লিংক মুছে ফেলা হয়েছে',
        titleEn: '🗑️ Bookmark Link Removed',
        messageBn: `লিংক: "${target.title}"`,
        messageEn: `Link: "${target.title}"`,
        type: 'info'
      });
    }
    setCustomBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  useEffect(() => {
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  const aiSubcategories = [
    { id: 'all', labelBn: 'সব এআই টুলস', labelEn: 'All AI Tools' },
    { id: 'Text & Conversational AI', labelBn: '💬 টেক্সট ও চ্যাট এআই', labelEn: 'Text & Chat' },
    { id: 'Coding & Developer AI', labelBn: '💻 কোডিং ও ডেভেলপার', labelEn: 'Coding & Dev' },
    { id: 'Image & Design AI', labelBn: '🎨 ছবি ও ডিজাইন এআই', labelEn: 'Image & Design' },
    { id: 'Video & Audio AI', labelBn: '🎬 ভিডিও ও অডিও এআই', labelEn: 'Video & Audio' },
  ];

  const eCommerceSubcategories = [
    { id: 'all', labelBn: 'সব ই-কমার্স', labelEn: 'All E-Commerce' },
    { id: 'Global & Bangladesh Online Stores', labelBn: '🛍️ পপুলার স্টোরস', labelEn: 'Popular Stores' },
    { id: 'Global Tech & Retail Giants', labelBn: '🌍 রিটেইল জায়ান্ট', labelEn: 'Global Retail' },
    { id: 'Bangladesh Popular Stores', labelBn: '🇧🇩 বিডি স্টোরস', labelEn: 'BD Stores' },
    { id: 'Fashion & Specialty Platforms', labelBn: '👗 ফ্যাশন ও বিউটি', labelEn: 'Fashion & Beauty' },
    { id: 'E-Commerce Builders & Tools', labelBn: '🛠️ প্ল্যাটফর্ম বিল্ডারস', labelEn: 'Builders & Tools' },
  ];

  const emergencySubcategories = [
    { id: 'all', labelBn: 'সব জরুরি সেবা', labelEn: 'All Emergency' },
    { id: 'National Helplines (Bangladesh)', labelBn: '📞 জাতীয় হেল্পলাইন', labelEn: 'National Helplines' },
    { id: 'Health & Medical', labelBn: '🏥 স্বাস্থ্য ও রক্ত ব্যাংক', labelEn: 'Health & Medical' },
    { id: 'Cyber & Public Safety', labelBn: '🛡️ সাইবার ও নিরাপত্তা', labelEn: 'Cyber & Safety' },
  ];

  const jobSubcategories = [
    { id: 'all', labelBn: 'সব চাকরি ও জব সাইট', labelEn: 'All Jobs' },
    { id: 'Government Jobs & Exam Portals', labelBn: '🏛️ সরকারি চাকরি ও পোর্টাল', labelEn: 'Government Jobs' },
    { id: 'Private & International Job Sites', labelBn: '🏢 প্রাতিষ্ঠানিক ও প্রাইভেট জব', labelEn: 'Private Jobs' },
    { id: 'Tech & Remote Work Platforms', labelBn: '💻 রিমোট ও ফ্রিল্যান্সিং', labelEn: 'Tech & Remote' },
  ];

  const photoSubcategories = [
    { id: 'all', labelBn: 'সব ডিজাইন ও ফটো টুলস', labelEn: 'All Photo & Design' },
    { id: 'Online Editors & Design', labelBn: '🎨 অনলাইন এডিটর ও ডিজাইন', labelEn: 'Editors & Design' },
    { id: 'Background & Upscaling Tools', labelBn: '✂️ ব্যাকগ্রাউন্ড ও আপস্কেলিং', labelEn: 'Background & Upscaling' },
    { id: 'Stock Photos & Assets', labelBn: '📸 স্টক ফটো ও ভেক্টর', labelEn: 'Stock Photos & Assets' },
  ];

  const itSubcategories = [
    { id: 'all', labelBn: 'সব আইটি ও ক্যালকুলেটর', labelEn: 'All IT & Tools' },
    { id: 'Developer & IT Tools', labelBn: '👨‍💻 ডেভেলপার ও আইটি টুলস', labelEn: 'Developer & IT' },
    { id: 'Online Calculators & Utilities', labelBn: '🧮 অনলাইন ক্যালকুলেটর ও ইউটিলিটি', labelEn: 'Calculators & Utilities' },
  ];

  const socialSubcategories = [
    { id: 'all', labelBn: 'সব মেসেজিং ও সোশ্যাল', labelEn: 'All Social & Messaging' },
    { id: 'Direct Messaging & Chat Apps', labelBn: '💬 চ্যাট ও মেসেজিং অ্যাপস', labelEn: 'Direct Messaging' },
    { id: 'Social Networks & Community', labelBn: '🌐 সোশ্যাল নেটওয়ার্ক ও কম্যুনিটি', labelEn: 'Social Networks' },
  ];

  const printSubcategories = [
    { id: 'all', labelBn: 'সব ডকুমেন্ট ও প্রিন্টিং', labelEn: 'All Documents & Print' },
    { id: 'Document Editors & Utilities', labelBn: '📄 ডকুমেন্ট এডিটর ও টুলস', labelEn: 'Document Editors & Utilities' },
  ];

  const marketingSubcategories = [
    { id: 'all', labelBn: 'সব মার্কেটিং ও অ্যানালিটিক্স', labelEn: 'All Marketing & Analytics' },
    { id: 'Digital Marketing & Analytics', labelBn: '📊 ডিজিটাল মার্কেটিং ও অ্যানালিটিক্স', labelEn: 'Digital Marketing & Analytics' },
  ];

  const educationSubcategories = [
    { id: 'all', labelBn: 'সব অনলাইন লার্নিং', labelEn: 'All Education' },
    { id: 'Online Learning & Skill Development', labelBn: '🎓 অনলাইন কোর্স ও স্কিল ডেভেলপমেন্ট', labelEn: 'Online Learning & Skill Development' },
  ];

  const personalSubcategories = [
    { id: 'all', labelBn: 'সব প্রডাক্টিভিটি বুকমার্কস', labelEn: 'All Productivity' },
    { id: 'Productivity & Management', labelBn: '📌 প্রডাক্টিভিটি ও টাস্ক ম্যানেজমেন্ট', labelEn: 'Productivity & Management' },
  ];

  const entertainmentSubcategories = [
    { id: 'all', labelBn: 'সব বিনোদন ও স্ট্রিমিং', labelEn: 'All Entertainment' },
    { id: 'Movies, Music & Live TV', labelBn: '🎬 মুভি, মিউজিক ও লাইভ টিভি', labelEn: 'Movies, Music & Live TV' },
  ];

  const travelSubcategories = [
    { id: 'all', labelBn: 'সব ভ্রমণ ও টিকিট বুকিং', labelEn: 'All Travel & Ticketing' },
    { id: 'Train, Flight & Hotel Booking', labelBn: '🚆 ট্রেন, ফ্লাইট ও হোটেল বুকিং', labelEn: 'Train, Flight & Hotel Booking' },
  ];

  const utilitiesSubcategories = [
    { id: 'all', labelBn: 'সব নাগরিক ও ই-সেবা', labelEn: 'All E-Services' },
    { id: 'E-Services & Citizen Portals', labelBn: '🏛️ ই-সেবা ও নাগরিক পোর্টাল', labelEn: 'E-Services & Citizen Portals' },
  ];

  const newsSubcategories = [
    { id: 'all', labelBn: 'সব সংবাদ ও মিডিয়া', labelEn: 'All News & Media' },
    { id: 'National & International Press', labelBn: '📰 জাতীয় ও আন্তর্জাতিক সংবাদ', labelEn: 'National & International Press' },
  ];

  // Extract any unique extra categories from custom bookmarks
  const extraCategories = Array.from(
    new Set(customBookmarks.map(b => b.category).filter(cat => cat && !BASE_CATEGORY_TABS.some(t => t.id === cat)))
  );

  const CATEGORY_TABS = [
    ...BASE_CATEGORY_TABS,
    ...extraCategories.map(cat => ({ id: cat, labelBn: cat, labelEn: cat }))
  ];

  // Filter preset services
  const filteredServices = PRESET_SERVICES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || 
                            item.category === selectedCategory || 
                            ((selectedCategory === 'Job & Application' || selectedCategory === 'চাকরি ও আবেদন') && (item.category === 'Job & Application' || item.category === 'চাকরি ও আবেদন')) ||
                            ((selectedCategory === 'Photo & Studio' || selectedCategory === 'ছবি ও স্টুডিও') && (item.category === 'Photo & Studio' || item.category === 'ছবি ও স্টুডিও')) ||
                            ((selectedCategory === 'Print & Documents' || selectedCategory === 'প্রিন্ট ও ডকুমেন্ট') && (item.category === 'Print & Documents' || item.category === 'প্রিন্ট ও ডকুমেন্ট')) ||
                            ((selectedCategory === 'IT & Calculations' || selectedCategory === 'হিসাব-নিকাশ') && (item.category === 'IT & Calculations' || item.category === 'হিসাব-নিকাশ')) ||
                            ((selectedCategory === 'Messaging & Social' || selectedCategory === 'যোগাযোগ') && (item.category === 'Messaging & Social' || item.category === 'যোগাযোগ')) ||
                            ((selectedCategory === 'Marketing & Ads' || selectedCategory === 'মার্কেটিং') && (item.category === 'Marketing & Ads' || item.category === 'মার্কেটিং')) ||
                            ((selectedCategory === 'Education & Career' || selectedCategory === 'শিক্ষা') && (item.category === 'Education & Career' || item.category === 'শিক্ষা')) ||
                            ((selectedCategory === 'Personal Bookmarks' || selectedCategory === 'ব্যক্তিগত') && (item.category === 'Personal Bookmarks' || item.category === 'ব্যক্তিগত')) ||
                            ((selectedCategory === 'Entertainment & Streaming' || selectedCategory === 'বিনোদন') && (item.category === 'Entertainment & Streaming' || item.category === 'বিনোদন')) ||
                            ((selectedCategory === 'Travel & Ticketing' || selectedCategory === 'ভ্রমণ') && (item.category === 'Travel & Ticketing' || item.category === 'ভ্রমণ')) ||
                            ((selectedCategory === 'Utilities & Govt Services' || selectedCategory === 'সরকারি') && (item.category === 'Utilities & Govt Services' || item.category === 'সরকারি')) ||
                            ((selectedCategory === 'News & Media' || selectedCategory === 'সংবাদ') && (item.category === 'News & Media' || item.category === 'সংবাদ'));
    const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory === selectedSubcategory;
    const matchesSearch = item.titleBn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  // Filter custom bookmarks
  const filteredCustomBookmarks = customBookmarks.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (book.category && book.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Render icon inside the mock visual window box
  const renderCardIcon = (service: ServiceApp) => {
    if (service.iconUrl) {
      return (
        <div className="w-full h-full relative overflow-hidden rounded-xl bg-slate-950/80 flex flex-col items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
          <img
            src={service.iconUrl}
            alt={service.titleEn}
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain drop-shadow-md rounded-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {service.subcategory && (
            <span className="text-[7.5px] text-sky-400 font-semibold mt-1 px-1.5 py-0.2 bg-sky-500/10 rounded-full border border-sky-500/20 truncate max-w-full">
              {service.subcategory}
            </span>
          )}
        </div>
      );
    }

    switch (service.iconType) {
      case 'photo':
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">{t('ডাউনলোড', 'Download')}</span>
          </div>
        );
      case 'calc':
        return (
          <div className="w-full h-full flex flex-col justify-between p-1.5 bg-slate-900/70 rounded-lg border border-rose-500/30">
            <div className="bg-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono text-rose-300 flex justify-between">
              <span>00</span>
              <span>00</span>
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-emerald-400/80 rounded w-full"></div>
              <div className="h-1 bg-sky-400/80 rounded w-3/4"></div>
            </div>
            <div className="bg-rose-500 text-white text-[8px] font-bold rounded text-center py-0.5 truncate">
              {t('হিসাব যুক্ত করুন', 'Add Calc')}
            </div>
          </div>
        );
      case 'convert':
        return (
          <div className="flex items-center justify-center gap-1.5 text-sky-400">
            <div className="w-7 h-7 rounded border border-slate-600 bg-slate-800 flex items-center justify-center shrink-0">
              <ImageIcon className="w-3.5 h-3.5 opacity-60" />
            </div>
            <span className="text-xs font-bold text-sky-400">➔</span>
            <div className="w-7 h-7 rounded border border-sky-400 bg-sky-500/20 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[9px] font-black text-emerald-300">HD</span>
            </div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="flex flex-col items-center justify-center gap-1 text-emerald-400">
            <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] font-mono">
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </div>
            <span className="text-[8px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">{t('মেসেজ পাঠান', 'Send Msg')}</span>
          </div>
        );
      case 'ad':
        return (
          <div className="w-full h-full flex flex-col justify-between p-1.5 bg-slate-900/80 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <div className="h-1 bg-slate-600 rounded w-10"></div>
            </div>
            <div className="h-4 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
              <span className="text-[8px] font-bold text-amber-300">{t('আমার বিজ্ঞাপন', 'My Ad')}</span>
            </div>
            <div className="flex justify-end">
              <span className="text-[7px] bg-amber-500 text-slate-950 px-1.5 rounded font-bold">{t('ডাউনলোড ➔', 'Download ➔')}</span>
            </div>
          </div>
        );
      case 'studio':
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
            <Camera className="w-4 h-4" />
          </div>
        );
      case 'autofill':
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <FileText className="w-6 h-6 text-teal-400" />
            <span className="text-[8px] font-black tracking-widest bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded font-mono">AUTO FILL</span>
          </div>
        );
      case 'nid':
        return (
          <div className="w-9 h-8 rounded border border-dashed border-indigo-400 bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-300">
            <Printer className="w-4 h-4" />
          </div>
        );
      case 'print':
        return (
          <div className="w-8 h-9 bg-white/10 border border-emerald-400/40 rounded flex flex-col items-center justify-center text-emerald-400 shadow-md">
            <Printer className="w-4 h-4" />
          </div>
        );
      case 'joint':
        return (
          <div className="flex items-center justify-center text-purple-400 gap-0.5">
            <div className="w-6 h-7 rounded bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-7 rounded bg-pink-500/30 border border-pink-400/50 flex items-center justify-center -ml-1.5">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        );
      default:
        return <Wrench className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 p-5 backdrop-blur-md shadow-lg flex flex-col gap-5">
      
      {/* Top Banner Row: Categories Pills like the screenshot */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500/20 text-sky-400 p-2 rounded-xl border border-sky-500/30">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                {t('অ্যাপ হাব ও সার্ভিস পোর্টাল', 'App Hub & Service Portal')} <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">App Grid</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('প্রয়োজনীয় সব সার্ভিস ও অ্যাপস এক ক্লিকে হাতের কাছে', 'All essential web services and tools in one structured portal')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('খুঁজুন...', 'Search...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-32 sm:w-40"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('লিংক যুক্ত করুন', 'Add App Link')}
            </button>
          </div>
        </div>

        {/* Pill category selection tabs with Left/Right Arrows and Expand/Wrap toggle */}
        <div className="relative flex items-center gap-1.5 w-full">
          {/* Scroll Left Button */}
          {!isWrapCategories && (
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-xs shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
              title={t('বামে স্ক্রোল করুন', 'Scroll Left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Category Tabs Container */}
          <div
            ref={categoryContainerRef}
            className={`flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth custom-scrollbar flex-1 transition-all ${
              isWrapCategories ? 'flex-wrap overflow-x-visible' : 'overflow-x-auto scrollbar-none'
            }`}
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20 scale-105 font-extrabold'
                    : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {t(tab.labelBn, tab.labelEn)}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          {!isWrapCategories && (
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-xs shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
              title={t('ডানে স্ক্রোল করুন', 'Scroll Right')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Toggle All Categories Multi-line / Wrap View */}
          <button
            onClick={() => setIsWrapCategories((prev) => !prev)}
            className={`p-1.5 text-xs rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1 font-bold ${
              isWrapCategories
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isWrapCategories ? t('এক সারিতে দেখুন', 'Show Single Row') : t('সব ক্যাটাগরি এক সাথে দেখুন', 'Show All Categories (Wrap)')}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">
              {isWrapCategories ? t('সংক্ষিপ্ত', 'Compact') : t('সবগুলো', 'All View')}
            </span>
          </button>
        </div>

        {/* AI Subcategories Filter Bar */}
        {(selectedCategory === 'AI Tools' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 flex items-center gap-1 px-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              {t('এআই ফিল্টার:', 'AI Filter:')}
            </span>
            {aiSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Emergency Subcategories Filter Bar */}
        {(selectedCategory === 'Emergency Services' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1 px-1 shrink-0">
              <PhoneCall className="w-3 h-3" />
              {t('জরুরি ফিল্টার:', 'Emergency Filter:')}
            </span>
            {emergencySubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Job Subcategories Filter Bar */}
        {(selectedCategory === 'Job & Application' || selectedCategory === 'চাকরি ও আবেদন' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1 px-1 shrink-0">
              <Briefcase className="w-3 h-3" />
              {t('জব ফিল্টার:', 'Jobs Filter:')}
            </span>
            {jobSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Photo Subcategories Filter Bar */}
        {(selectedCategory === 'Photo & Studio' || selectedCategory === 'ছবি ও স্টুডিও' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-purple-500 dark:text-purple-400 flex items-center gap-1 px-1 shrink-0">
              <Palette className="w-3 h-3" />
              {t('ফটোগ্রাফি ফিল্টার:', 'Photo Filter:')}
            </span>
            {photoSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* IT & Calculations Subcategories Filter Bar */}
        {(selectedCategory === 'IT & Calculations' || selectedCategory === 'হিসাব-নিকাশ' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 px-1 shrink-0">
              <Calculator className="w-3 h-3" />
              {t('আইটি ফিল্টার:', 'IT Filter:')}
            </span>
            {itSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Messaging & Social Subcategories Filter Bar */}
        {(selectedCategory === 'Messaging & Social' || selectedCategory === 'যোগাযোগ' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 flex items-center gap-1 px-1 shrink-0">
              <MessageSquare className="w-3 h-3" />
              {t('মেসেজিং ফিল্টার:', 'Social Filter:')}
            </span>
            {socialSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* E-Commerce Subcategories Filter Bar */}
        {(selectedCategory === 'E-Commerce Platform' || selectedCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1 px-1 shrink-0">
              <ShoppingBag className="w-3 h-3" />
              {t('ই-কমার্স ফিল্টার:', 'E-Com Filter:')}
            </span>
            {eCommerceSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Print & Documents Filter Bar */}
        {(selectedCategory === 'Print & Documents' || selectedCategory === 'প্রিন্ট ও ডকুমেন্ট') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 flex items-center gap-1 px-1 shrink-0">
              <Printer className="w-3 h-3" />
              {t('প্রিন্ট ফিল্টার:', 'Print Filter:')}
            </span>
            {printSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Marketing & Ads Filter Bar */}
        {(selectedCategory === 'Marketing & Ads' || selectedCategory === 'মার্কেটিং') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1 px-1 shrink-0">
              <Award className="w-3 h-3" />
              {t('মার্কেটিং ফিল্টার:', 'Marketing Filter:')}
            </span>
            {marketingSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Education & Career Filter Bar */}
        {(selectedCategory === 'Education & Career' || selectedCategory === 'শিক্ষা') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1 px-1 shrink-0">
              <GraduationCap className="w-3 h-3" />
              {t('শিক্ষা ফিল্টার:', 'Edu Filter:')}
            </span>
            {educationSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Personal Bookmarks Filter Bar */}
        {(selectedCategory === 'Personal Bookmarks' || selectedCategory === 'ব্যক্তিগত') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 flex items-center gap-1 px-1 shrink-0">
              <FolderOpen className="w-3 h-3" />
              {t('ব্যক্তিগত ফিল্টার:', 'Personal Filter:')}
            </span>
            {personalSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Entertainment & Streaming Filter Bar */}
        {(selectedCategory === 'Entertainment & Streaming' || selectedCategory === 'বিনোদন') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1 px-1 shrink-0">
              <Film className="w-3 h-3" />
              {t('বিনোদন ফিল্টার:', 'Entertainment Filter:')}
            </span>
            {entertainmentSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Travel & Ticketing Filter Bar */}
        {(selectedCategory === 'Travel & Ticketing' || selectedCategory === 'ভ্রমণ') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 px-1 shrink-0">
              <Plane className="w-3 h-3" />
              {t('ভ্রমণ ফিল্টার:', 'Travel Filter:')}
            </span>
            {travelSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* Utilities & Govt Services Filter Bar */}
        {(selectedCategory === 'Utilities & Govt Services' || selectedCategory === 'সরকারি') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-teal-500 dark:text-teal-400 flex items-center gap-1 px-1 shrink-0">
              <Landmark className="w-3 h-3" />
              {t('সরকারি সেবা ফিল্টার:', 'Govt Filter:')}
            </span>
            {utilitiesSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}

        {/* News & Media Filter Bar */}
        {(selectedCategory === 'News & Media' || selectedCategory === 'সংবাদ') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1.5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1 px-1 shrink-0">
              <Newspaper className="w-3 h-3" />
              {t('সংবাদ ফিল্টার:', 'News Filter:')}
            </span>
            {newsSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSubcategory === sub.id
                    ? 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40 font-extrabold shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {t(sub.labelBn, sub.labelEn)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid View of Cards matching the screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {filteredServices.map((service) => (
          <a
            key={service.id}
            href={getNormalizedUrl(service.url)}
            target={service.url?.startsWith('#') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            onClick={(e) => {
              dispatchAppNotification({
                titleBn: `🚀 অ্যাপ ব্যবহৃৎ: ${service.titleBn}`,
                titleEn: `🚀 App Opened: ${service.titleEn}`,
                messageBn: `আপনি "${service.titleBn}" ব্যবহার শুরু করেছেন।`,
                messageEn: `You opened "${service.titleEn}".`,
                type: 'app'
              });
              const url = service.url || '';
              if (url.startsWith('#')) {
                e.preventDefault();
                const el = document.querySelector(url);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden min-h-[140px]"
          >
            {/* Top window card frame with 3 dots like user's screenshot */}
            <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 border border-slate-300/40 dark:border-white/5 rounded-xl p-2 flex flex-col items-center justify-center h-24 relative overflow-hidden group-hover:border-sky-500/30 transition-colors">
              
              {/* Top window controls (Red, Yellow, Green dots) */}
              <div className="absolute top-1.5 right-2 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              </div>

              {/* Dynamic Icon Artwork */}
              {renderCardIcon(service)}
            </div>

            {/* Bottom Title Label */}
            <div className="mt-2 text-center w-full px-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors truncate">
                {t(service.titleBn, service.titleEn)}
              </h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-sans truncate mt-0.5">
                {service.titleEn}
              </p>
            </div>
          </a>
        ))}

        {/* User Added Custom Bookmarks (Rendered in same card style with FULL SPACE logo image) */}
        {filteredCustomBookmarks.map((book) => (
          <div
            key={book.id}
            className="group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 hover:border-sky-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden min-h-[140px]"
          >
            {/* Quick Actions (Edit & Delete) */}
            <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(book);
                }}
                className="p-1 text-slate-300 hover:text-sky-400 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 hover:border-sky-500/50 transition-all cursor-pointer"
                title={t('এডিট', 'Edit')}
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBookmark(book.id);
                }}
                className="p-1 text-slate-300 hover:text-rose-500 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 hover:border-rose-500/50 transition-all cursor-pointer"
                title={t('মুছুন', 'Delete')}
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>

            <a
              href={getNormalizedUrl(book.url)}
              target={book.url?.startsWith('#') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={(e) => {
                dispatchAppNotification({
                  titleBn: `🌐 বুকমার্ক খোলা হয়েছে: ${book.title}`,
                  titleEn: `🌐 Opened Bookmark: ${book.title}`,
                  messageBn: `আপনি "${book.title}" বুকমার্কটি ভিজিট করেছেন।`,
                  messageEn: `You opened "${book.title}".`,
                  type: 'app'
                });
                const url = book.url || '';
                if (url.startsWith('#')) {
                  e.preventDefault();
                  const el = document.querySelector(url);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              {/* Top window card frame with FULL SPACE logo image */}
              <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 border border-slate-300/40 dark:border-white/5 rounded-xl flex flex-col items-center justify-center h-24 relative overflow-hidden group-hover:border-sky-500/30 transition-colors">
                
                {/* Window control dots in glass pill */}
                <div className="absolute top-1.5 left-2 flex items-center gap-1 z-10 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                </div>

                {book.icon ? (
                  <div className="w-full h-full relative overflow-hidden rounded-xl bg-slate-950">
                    <img
                      src={book.icon}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-indigo-500/20 border border-sky-400/20 flex flex-col items-center justify-center text-sky-400 font-extrabold text-lg uppercase shadow-inner">
                    <span className="text-xl font-black">{book.title.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Bottom Title Label */}
              <div className="mt-2 text-center w-full px-1">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-400 transition-colors truncate">
                  {book.title}
                </h4>
                <div className="flex items-center justify-center gap-1 mt-0.5 flex-wrap">
                  <p className="text-[9px] text-sky-500/80 dark:text-sky-400/80 font-sans font-semibold truncate">
                    {book.category || 'Custom Link'}
                  </p>
                  {book.addedBy && (
                    <span className="text-[8px] bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20 px-1.5 py-0.2 rounded font-sans font-medium truncate max-w-[80px]">
                      👤 {book.addedBy}
                    </span>
                  )}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Custom Add/Edit Bookmark Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl max-w-md w-full my-auto max-h-[92vh] flex flex-col animate-scaleIn">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Link className="w-4 h-4 text-sky-500" />
                  {editingBookmarkId 
                    ? t('অ্যাপ বা সার্ভিস লিংক এডিট করুন', 'Edit App or Service Link') 
                    : t('নতুন অ্যাপ বা সার্ভিস লিংক যুক্ত করুন', 'Add New App or Service Link')}
                </h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                  <span>🌐 {t('আপনার সেভ করা লিংকটি সকল ব্যবহারকারী দেখতে পাবেন', 'Saved link will be visible to all users')}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBookmarkId(null);
                  setNewIcon('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBookmark} className="space-y-3.5 pt-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('ক্যাটাগরি নির্বাচন করুন', 'Select Category')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-medium cursor-pointer"
                >
                  <option value="চাকরি ও আবেদন">{t('সরকারি-বেসরকারি চাকরি (Jobs)', 'Jobs & Applications')}</option>
                   <option value="AI Tools">{t('AI Tools', 'AI Tools')}</option>
                  <option value="ছবি ও স্টুডিও">{t('ছবি ও ফটো স্টুডিও (Photo)', 'Photo & Studio')}</option>
                  <option value="প্রিন্ট ও ডকুমেন্ট">{t('সিভি ও প্রিন্টিং সেবা (Print)', 'Print & Documents')}</option>
                  <option value="হিসাব-নিকাশ">{t('আইটি ও হিসাব-নিকাশ (IT)', 'IT & Calculations')}</option>
                  <option value="যোগাযোগ">{t('মেসেজিং ও সোশ্যাল (Social)', 'Messaging & Social')}</option>
                  <option value="মার্কেটিং">{t('মার্কেটিং ও বিজ্ঞাপন (Ads)', 'Marketing & Ads')}</option>
                  <option value="শিক্ষা">{t('শিক্ষা ও ক্যারিয়ার (Education)', 'Education')}</option>
                  <option value="ব্যক্তিগত">{t('ব্যক্তিগত (Personal)', 'Personal')}</option>
                  <option value="Entertainment & Streaming">{t('বিনোদন', 'Entertainment & Streaming')}</option>
                  <option value="ভ্রমণ">{t('ভ্রমণ', 'Travel & Ticketing')}</option>
                   <option value="সরকারি">{t('সরকারি', 'Utilities & Govt Services')}</option>
                   <option value="সংবাদ">{t('সংবাদ', 'News & Media')}</option>
                  <option value="custom">{t('+ নতুন ক্যাটাগরি তৈরি করুন (New Category)', '+ Add New Custom Category')}</option>
                </select>
              </div>

              {newCategory === 'custom' && (
                <div>
                  <label className="block text-[10px] font-bold text-sky-500 mb-1 uppercase tracking-wider">
                    {t('নতুন ক্যাটাগরির নাম লিখুন', 'Custom Category Name')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('যেমন: বিনোদন, ই-কমার্স...', 'e.g. Entertainment, E-commerce...')}
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full bg-sky-50/50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-700/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('অ্যাপ বা সার্ভিসের নাম (Title)', 'App or Service Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('যেমন: পাসপোর্ট পোর্টাল', 'e.g., Passport Portal')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('ইউআরএল (Web URL)', 'Web URL')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://passport.gov.bd"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-mono"
                />
              </div>

              {/* App Image / Logo Upload Section with Full-Space Card Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-sky-500" /> {t('অ্যাপ লোগো / কার্ড ইমেজ (সম্পূর্ণ স্পেস)', 'App Logo / Card Image (Full Space)')}
                  </span>
                  {newIcon && (
                    <button
                      type="button"
                      onClick={() => setNewIcon('')}
                      className="text-[9px] text-rose-500 hover:underline cursor-pointer normal-case"
                    >
                      {t('ছবি রিমুভ', 'Remove Image')}
                    </button>
                  )}
                </label>

                {newIcon ? (
                  <div className="space-y-2">
                    {/* Live Card Full Space Preview Box */}
                    <div className="relative w-full h-24 rounded-xl border border-sky-500/40 bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
                      <img
                        src={newIcon}
                        alt="Full Card Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Window dots indicator */}
                      <div className="absolute top-1.5 left-2 flex items-center gap-1 z-10 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      </div>
                      <div className="absolute bottom-1 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold font-mono">
                        {t('কার্ডে ফুল স্পেস কভার', 'Full Space Cover')}
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{t('লোগোটি কার্ডের পুরো জায়গা জুড়ে নিখুঁতভাবে দেখাবে', 'Logo will display across the full card space seamlessly')}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer bg-white dark:bg-slate-900 transition-colors text-xs text-slate-600 dark:text-slate-300">
                      <Upload className="w-4 h-4 text-sky-500" />
                      <span className="font-semibold">{t('ডিভাইস থেকে ফটো / লোগো আপলোড করুন', 'Upload photo / logo from device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder={t('অথবা ইমেজ / লোগো URL পেস্ট করুন...', 'Or paste image / logo URL...')}
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Actions - Always visible and pinned at bottom */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBookmarkId(null);
                    setNewIcon('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-semibold"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-sky-500/25 font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingBookmarkId ? t('আপডেট করুন', 'Update Link') : t('সংরক্ষণ করুন', 'Save Link')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
