// src/components/seo-pages/editor/schema-editor.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Code, CheckCircle2, AlertTriangle, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface SchemaEditorProps {
  schemaMarkup: string
  breadcrumbSchema: string
  onChange: (data: { schema_markup?: string; breadcrumb_schema?: string }) => void
}

export function SchemaEditor({ schemaMarkup, breadcrumbSchema, onChange }: SchemaEditorProps) {
  return (
    <div className="space-y-6">
      {/* Main Schema */}
      <SchemaSection
        title="Main Schema (JSON-LD)"
        description="Primary schema markup (e.g., Service, Article, Product)"
        value={schemaMarkup}
        onChange={(value) => onChange({ schema_markup: value })}
      />
      
      {/* Breadcrumb Schema */}
      <SchemaSection
        title="Breadcrumb Schema"
        description="Helps Google show breadcrumbs in search results"
        value={breadcrumbSchema}
        onChange={(value) => onChange({ breadcrumb_schema: value })}
      />
      
      {/* Help */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Code className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-2">
              <p className="font-semibold text-blue-400">Schema Markup Tips</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use valid JSON format</li>
                <li>• Must include @context and @type</li>
                <li>• Test with <a href="https://validator.schema.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Schema.org Validator <ExternalLink className="h-3 w-3" /></a></li>
                <li>• Test rich results with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Google Rich Results <ExternalLink className="h-3 w-3" /></a></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SchemaSection({
  title,
  description,
  value,
  onChange,
}: {
  title: string
  description: string
  value: string
  onChange: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState(value || '')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])
  
  // Validate JSON
  useEffect(() => {
    if (!localValue.trim()) {
      setIsValid(null)
      setErrorMsg('')
      return
    }
    
    try {
      const parsed = JSON.parse(localValue)
      if (!parsed['@context'] || !parsed['@type']) {
        setIsValid(false)
        setErrorMsg('Missing @context or @type')
      } else {
        setIsValid(true)
        setErrorMsg('')
      }
    } catch (e: any) {
      setIsValid(false)
      setErrorMsg(e.message)
    }
  }, [localValue])
  
  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }
  
  const formatJson = () => {
    try {
      const parsed = JSON.parse(localValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setLocalValue(formatted)
      onChange(formatted)
      toast.success('JSON formatted!')
    } catch (e) {
      toast.error('Invalid JSON', { description: 'Cannot format invalid JSON' })
    }
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(localValue)
    toast.success('Copied to clipboard!')
  }
  
  const clearSchema = () => {
    if (confirm('Clear this schema?')) {
      setLocalValue('')
      onChange('')
    }
  }
  
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Label className="text-base font-semibold">{title}</Label>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          {isValid !== null && (
            <div className="flex items-center gap-1.5">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">Valid</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Invalid</span>
                </>
              )}
            </div>
          )}
        </div>
        
        <Textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder='{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  ...\n}'
          rows={12}
          className="font-mono text-xs bg-muted/30"
        />
        
        {errorMsg && (
          <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
            ⚠️ {errorMsg}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {localValue.length} characters
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              disabled={!localValue}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={formatJson}
              disabled={!localValue || !isValid}
            >
              <Code className="h-3.5 w-3.5 mr-1" />
              Format
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSchema}
              disabled={!localValue}
              className="text-destructive hover:text-destructive"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
