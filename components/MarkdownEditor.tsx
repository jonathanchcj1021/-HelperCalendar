'use client'

import dynamic from 'next/dynamic'
import { Box, Typography, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
  minHeight?: number
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  label, 
  disabled = false,
  minHeight = 300 
}: MarkdownEditorProps) {
  const [tabValue, setTabValue] = useState(0)

  if (disabled) {
    // View mode - show rendered markdown/HTML
    return (
      <Box>
        {label && (
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
        )}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            minHeight: minHeight,
            bgcolor: 'background.paper',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
                textAlign: 'left',
              },
              '& th': {
                bgcolor: 'action.hover',
                fontWeight: 'bold',
              },
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {value || '*No description*'}
          </ReactMarkdown>
        </Box>
      </Box>
    )
  }

  // Edit mode - show editor with tabs
  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Tabs 
        value={tabValue} 
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 1 }}
      >
        <Tab label="Edit" />
        <Tab label="Preview" />
      </Tabs>
      
      {tabValue === 0 && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <MDEditor
            value={value}
            onChange={(val) => onChange(val || '')}
            preview="edit"
            hideToolbar={false}
            visibleDragbar={false}
            data-color-mode="light"
            height={minHeight}
          />
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            minHeight: minHeight,
            bgcolor: 'background.paper',
            overflow: 'auto',
            '& img': {
              maxWidth: '100%',
              height: 'auto',
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
                textAlign: 'left',
              },
              '& th': {
                bgcolor: 'action.hover',
                fontWeight: 'bold',
              },
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {value || '*No description*'}
          </ReactMarkdown>
        </Box>
      )}
    </Box>
  )
}

