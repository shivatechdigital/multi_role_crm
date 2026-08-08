// src/lib/builder/sanitizer.ts

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML - basic (for user content)
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'div', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'section', 'article', 'header', 'footer', 'nav',
      'button', 'small', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'id', 'style',
      'width', 'height', 'loading',
      'data-*',
    ],
    ALLOW_DATA_ATTR: true,
  })
}

/**
 * Sanitize HTML - strict (for imported content)
 */
export function sanitizeHtmlStrict(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'strong', 'em', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a',
    ],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

/**
 * Sanitize HTML - permissive (for custom code)
 * WARNING: Only for trusted users
 */
export function sanitizeHtmlPermissive(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'script'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    ALLOW_UNKNOWN_PROTOCOLS: true,
  })
}
