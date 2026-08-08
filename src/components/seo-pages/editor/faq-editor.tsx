// src/components/seo-pages/editor/faq-editor.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Edit2,
  Save,
  X,
} from 'lucide-react'
import type { FaqItem } from '@/lib/types/seo-pages'

interface FaqEditorProps {
  faqs: FaqItem[]
  onChange: (faqs: FaqItem[]) => void
}

export function FaqEditor({ faqs, onChange }: FaqEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [tempFaq, setTempFaq] = useState<FaqItem>({ question: '', answer: '' })
  const [isAdding, setIsAdding] = useState(false)
  
  const startAdd = () => {
    setTempFaq({ question: '', answer: '' })
    setIsAdding(true)
    setEditingIndex(null)
  }
  
  const startEdit = (index: number) => {
    setTempFaq({ ...faqs[index] })
    setEditingIndex(index)
    setIsAdding(false)
  }
  
  const cancelEdit = () => {
    setEditingIndex(null)
    setIsAdding(false)
    setTempFaq({ question: '', answer: '' })
  }
  
  const saveFaq = () => {
    if (!tempFaq.question.trim() || !tempFaq.answer.trim()) {
      return
    }
    
    if (isAdding) {
      onChange([...faqs, tempFaq])
    } else if (editingIndex !== null) {
      const newFaqs = [...faqs]
      newFaqs[editingIndex] = tempFaq
      onChange(newFaqs)
    }
    
    cancelEdit()
  }
  
  const deleteFaq = (index: number) => {
    if (confirm('Delete this FAQ?')) {
      onChange(faqs.filter((_, i) => i !== index))
    }
  }
  
  const moveFaq = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= faqs.length) return
    
    const newFaqs = [...faqs]
    const temp = newFaqs[index]
    newFaqs[index] = newFaqs[newIndex]
    newFaqs[newIndex] = temp
    onChange(newFaqs)
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">FAQs ({faqs.length})</h3>
        </div>
        {!isAdding && editingIndex === null && (
          <Button onClick={startAdd} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        )}
      </div>
      
      {/* Add/Edit Form */}
      {(isAdding || editingIndex !== null) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                {isAdding ? '➕ New FAQ' : `✏️ Edit FAQ #${editingIndex! + 1}`}
              </h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                placeholder="e.g., How much does it cost?"
                value={tempFaq.question}
                onChange={(e) => setTempFaq({ ...tempFaq, question: e.target.value })}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                {tempFaq.question.length} characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                placeholder="Provide a detailed answer..."
                value={tempFaq.answer}
                onChange={(e) => setTempFaq({ ...tempFaq, answer: e.target.value })}
                rows={4}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                {tempFaq.answer.length} characters (recommended: 150-300)
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={saveFaq}
                disabled={!tempFaq.question.trim() || !tempFaq.answer.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isAdding ? 'Add FAQ' : 'Update FAQ'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* FAQs List */}
      {faqs.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No FAQs yet. Add some to improve SEO and user experience!
            </p>
            <Button onClick={startAdd} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className={editingIndex === index ? 'border-primary/50' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Order Controls */}
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveFaq(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-center text-muted-foreground font-mono">
                      {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveFaq(index, 'down')}
                      disabled={index === faqs.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 pr-2">
                      Q: {faq.question}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(index)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteFaq(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Help Text */}
      {faqs.length > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
          💡 <strong>Tip:</strong> FAQs appear in Google search results as rich snippets, 
          improving click-through rates. Keep questions clear and answers concise (150-300 chars).
        </div>
      )}
    </div>
  )
}
