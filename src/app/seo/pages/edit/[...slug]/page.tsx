// src/app/seo/pages/[...slug]/edit/page.tsx

'use client'

import { useState, useEffect, useMemo, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  ExternalLink,
  RefreshCw,
  Tag,
  HelpCircle,
  Code,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSeoPage, useUpdateSeoPage } from '@/hooks/use-seo-pages'
import { MetaEditor, type MetaFormData } from '@/components/seo-pages/editor/meta-editor'
import { FaqEditor } from '@/components/seo-pages/editor/faq-editor'
import { SchemaEditor } from '@/components/seo-pages/editor/schema-editor'
import { PreviewPane } from '@/components/seo-pages/editor/preview-pane'
import { SeoScoreBadge } from '@/components/seo-pages/editor/seo-score-badge'
import { getPageTypeColor, getNicePageName } from '@/lib/utils/seo-helpers'
import type { FaqItem, FaqSchema } from '@/lib/types/seo-pages'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default function EditPagePage({ params }: PageProps) {
  const { slug: slugArray } = use(params)
  const slug = slugArray.join('/')
  const router = useRouter()
  
  const { data, isLoading, error } = useSeoPage(slug)
  const updateMutation = useUpdateSeoPage()
  
  const [hasChanges, setHasChanges] = useState(false)
  
  // Form states
  const [metaData, setMetaData] = useState<MetaFormData>({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    target_keywords: [],
    og_title: '',
    og_description: '',
    og_image: '',
    h1_tag: '',
  })
  
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  
  const [schemas, setSchemas] = useState({
    schema_markup: '',
    breadcrumb_schema: '',
  })
  
  // Load data into form when fetched
  useEffect(() => {
    if (data?.data) {
      const page = data.data
      
      setMetaData({
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
        focus_keyword: page.focus_keyword || '',
        target_keywords: Array.isArray(page.target_keywords) ? page.target_keywords : [],
        og_title: page.og_title || '',
        og_description: page.og_description || '',
        og_image: page.og_image || '',
        h1_tag: page.h1_tag || '',
      })
      
      // Parse FAQs from schema
      if (page.faq_schema) {
        try {
          const parsed: FaqSchema = JSON.parse(page.faq_schema)
          const faqList = parsed.mainEntity?.map(item => ({
            question: item.name || '',
            answer: item.acceptedAnswer?.text || '',
          })) || []
          setFaqs(faqList)
        } catch (e) {
          setFaqs([])
        }
      } else {
        setFaqs([])
      }
      
      setSchemas({
        schema_markup: page.schema_markup || '',
        breadcrumb_schema: page.breadcrumb_schema || '',
      })
      
      setHasChanges(false)
    }
  }, [data])
  
  // Track changes
  useEffect(() => {
    if (data?.data) {
      setHasChanges(true)
    }
  }, [metaData, faqs, schemas])
  
  // Reset hasChanges after data loads
  useEffect(() => {
    if (data?.data) {
      setHasChanges(false)
    }
  }, [data?.data])
  
  // Build FAQ schema from FAQs array
  const buildFaqSchema = (faqList: FaqItem[]): string => {
    if (faqList.length === 0) return ''
    
    const schema: FaqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqList.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }
    
    return JSON.stringify(schema, null, 2)
  }
  
  const handleSave = async () => {
    try {
      const payload = {
        ...metaData,
        faq_schema: buildFaqSchema(faqs),
        schema_markup: schemas.schema_markup,
        breadcrumb_schema: schemas.breadcrumb_schema,
        last_updated_by: 'crm',
      }
      
      await updateMutation.mutateAsync({ slug, payload })
      setHasChanges(false)
    } catch (error) {
      // Error handled by mutation
    }
  }
  
  const page = data?.data
  const niceName = page ? getNicePageName(page.page_slug) : ''
  const typeColor = page ? getPageTypeColor(page.page_type) : null
  
  // Loading state
  if (isLoading) {
    return <LoadingState />
  }
  
  // Error state
  if (error || !page) {
    return <ErrorState error={error} onRetry={() => router.refresh()} />
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb & Back */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-7 -ml-2"
          >
            <Link href="/seo/pages">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Pages
            </Link>
          </Button>
        </div>
        
        {/* Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {niceName}
              </h1>
              {typeColor && (
                <Badge variant="outline" className={`${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                  {page.page_type}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              /{page.page_slug}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* SEO Score */}
            <SeoScoreBadge score={page.seo_score || 0} />
            
            {/* Actions */}
            <div className="flex gap-2">
              {page.page_url && (
                <Button variant="outline" size="default" asChild>
                  <a href={page.page_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </a>
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                size="default"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  You have unsaved changes
                </span>
                <span className="text-muted-foreground">
                  • Don't forget to click "Save Changes"
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Tabs Editor */}
      <Tabs defaultValue="meta" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 lg:max-w-2xl lg:grid-cols-4">
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Meta</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {faqs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Schema</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Meta Tab */}
        <TabsContent value="meta" className="space-y-4 mt-0">
          <MetaEditor data={metaData} onChange={setMetaData} />
        </TabsContent>
        
        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4 mt-0">
          <FaqEditor faqs={faqs} onChange={setFaqs} />
        </TabsContent>
        
        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-4 mt-0">
          <SchemaEditor
            schemaMarkup={schemas.schema_markup}
            breadcrumbSchema={schemas.breadcrumb_schema}
            onChange={(updates) => setSchemas({ ...schemas, ...updates })}
          />
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4 mt-0">
          <PreviewPane
            url={page.page_url || `https://shivatechdigital.com/${page.page_slug}`}
            title={metaData.meta_title}
            description={metaData.meta_description}
            ogImage={metaData.og_image}
          />
        </TabsContent>
      </Tabs>
      
      {/* Bottom Save Bar (sticky on mobile) */}
      {hasChanges && (
        <div className="sticky bottom-4 z-50 lg:hidden">
          <Card className="border-primary shadow-lg">
            <CardContent className="p-3">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full"
                size="lg"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/seo/pages">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Pages
        </Link>
      </Button>
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load page</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || 'The page you are looking for could not be loaded.'}
          </p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
