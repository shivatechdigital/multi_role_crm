// src/lib/types/page-builder.ts

/**
 * Page Builder Types
 * Full type definitions for the visual page builder
 */

// ============= BLOCK TYPES =============

export type BlockType = 
  | 'heading' 
  | 'text' 
  | 'paragraph'
  | 'image' 
  | 'button' 
  | 'video' 
  | 'html' 
  | 'spacer'
  | 'divider'
  | 'icon-box'
  | 'list';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type VideoType = 'youtube' | 'vimeo' | 'direct';

export type ListType = 'ul' | 'ol';

// ============= BLOCK CONTENT INTERFACES =============

export interface HeadingContent {
  text: string;
  level: HeadingLevel;
}

export interface TextContent {
  html: string;
  text?: string;
}

export interface ImageContent {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  link?: {
    url: string;
    target?: '_blank' | '_self';
  };
}

export interface ButtonContent {
  text: string;
  url: string;
  variant: ButtonVariant;
  size: ButtonSize;
  newTab?: boolean;
  icon?: string;
}

export interface VideoContent {
  type: VideoType;
  url: string;
  autoplay?: boolean;
  controls?: boolean;
}

export interface HtmlContent {
  html: string;
}

export interface SpacerContent {
  height: number;
}

export interface DividerContent {
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export interface IconBoxContent {
  icon: string;
  title: string;
  description: string;
}

export interface ListContent {
  type: ListType;
  items: string[];
}

// ============= BLOCK STYLES =============

export interface BlockStyles {
  color?: string;
  background?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  width?: string;
  maxWidth?: string;
}

// ============= BLOCK =============

export interface Block {
  id: string;
  type: BlockType;
  content: 
    | HeadingContent
    | TextContent
    | ImageContent
    | ButtonContent
    | VideoContent
    | HtmlContent
    | SpacerContent
    | DividerContent
    | IconBoxContent
    | ListContent;
  styles?: BlockStyles;
  settings?: Record<string, any>;
}

// ============= SECTION LAYOUT =============

export type SectionLayout = 'single' | 'double' | 'triple' | 'custom';

export type ColumnWidth = '100%' | '75%' | '66.66%' | '50%' | '33.33%' | '25%';

// ============= COLUMN =============

export interface ColumnStyles {
  padding?: string;
  background?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  minHeight?: string;
}

export interface Column {
  id: string;
  width: ColumnWidth | string;
  blocks: Block[];
  styles?: ColumnStyles;
}

// ============= SECTION =============

export interface BackgroundConfig {
  type: 'color' | 'image' | 'gradient';
  value: string;
  overlay?: string;
}

export interface SpacingConfig {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SectionSettings {
  background?: BackgroundConfig;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  minHeight?: number;
  fullWidth?: boolean;
  containerWidth?: string;
}

export interface Section {
  id: string;
  layout: SectionLayout;
  columns: Column[];
  settings?: SectionSettings;
}

// ============= PAGE LAYOUT =============

export interface PageLayout {
  sections: Section[];
  globalStyles?: Record<string, any>;
}

export interface PageSettings {
  containerWidth?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

// ============= SERVICE PAGE (Main Entity) =============

export type PageStatus = 'draft' | 'published' | 'archived' | 'scheduled';
export type PageType = 'service' | 'landing' | 'static';

export interface ServicePage {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  status: PageStatus;
  page_type: PageType;
  template: string;
  
  layout_json: PageLayout | null;
  compiled_html?: string;
  raw_html?: string;
  
  custom_head_html?: string;
  custom_body_start_html?: string;
  custom_body_end_html?: string;
  custom_css?: string;
  custom_js?: string;
  
  featured_image?: string;
  featured_image_alt?: string;
  
  page_settings?: PageSettings;
  service_meta_id?: number;
  parent_id?: number;
  
  published_at?: string;
  scheduled_at?: string;
  
  created_by?: string;
  updated_by?: string;
  view_count: number;
  revision_count: number;
  
  created_at: string;
  updated_at: string;
  
  service_meta?: {
    id: number;
    page_slug: string;
    meta_title: string | null;
    seo_score: number | null;
  };
}

// ============= API REQUEST/RESPONSE TYPES =============

export interface ServicePagesListResponse {
  success: boolean;
  data: ServicePage[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ServicePageResponse {
  success: boolean;
  data: ServicePage;
  message?: string;
}

export interface CreateServicePagePayload {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  status?: PageStatus;
  page_type?: PageType;
  template?: string;
  layout_json?: PageLayout;
  featured_image?: string;
  featured_image_alt?: string;
  created_by?: string;
}

export interface UpdateServicePagePayload {
  slug?: string;
  title?: string;
  subtitle?: string;
  excerpt?: string;
  status?: PageStatus;
  page_type?: PageType;
  template?: string;
  layout_json?: PageLayout;
  custom_head_html?: string;
  custom_body_start_html?: string;
  custom_body_end_html?: string;
  custom_css?: string;
  custom_js?: string;
  featured_image?: string;
  featured_image_alt?: string;
  page_settings?: PageSettings;
  updated_by?: string;
  revision_note?: string;
}

export interface ImportHtmlPayload {
  html: string;
  slug: string;
  title: string;
  created_by?: string;
}

export interface PageRevision {
  id: number;
  service_page_id: number;
  revision_number: number;
  layout_json: string;
  compiled_html?: string;
  meta_snapshot?: any;
  revision_note?: string;
  created_by?: string;
  created_at: string;
}

// ============= MEDIA =============

export interface MediaAsset {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  extension: string;
  file_path: string;
  file_url: string;
  disk: string;
  file_size: number;
  width?: number;
  height?: number;
  thumbnail_url?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  folder: string;
  tags?: string[];
  uploaded_by?: string;
  usage_count: number;
  is_image?: boolean;
  is_video?: boolean;
  formatted_size?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaListResponse {
  success: boolean;
  data: MediaAsset[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// ============= BUILDER STATE =============

export interface BuilderState {
  page: ServicePage | null;
  layout: PageLayout;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedColumnId: string | null;
  device: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  history: PageLayout[];
  historyIndex: number;
}

// ============= FILTER/SORT =============

export interface ServicePagesFilters {
  status?: PageStatus | 'all';
  page_type?: PageType | 'all';
  search?: string;
  sort_by?: 'updated_at' | 'created_at' | 'title' | 'view_count';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}
