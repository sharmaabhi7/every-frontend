import { useEffect, useRef, forwardRef, useLayoutEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = forwardRef(({ 
  value, 
  onChange, 
  placeholder = 'Start writing...', 
  readOnly = false,
  modules = {},
  formats = [],
  style = {}
}, ref) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // Default modules with comprehensive toolbar
  const defaultModules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    ...modules
  };

  // Default formats
  const defaultFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
    ...formats
  ];

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Create Quill instance
    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      modules: defaultModules,
      formats: defaultFormats,
      placeholder,
      readOnly
    });

    quillRef.current = quill;

    // Set initial content
    if (value) {
      isUpdatingRef.current = true;
      quill.root.innerHTML = value;
      isUpdatingRef.current = false;
    }

    // Handle text changes
    const handleTextChange = () => {
      if (isUpdatingRef.current) return;
      
      const html = quill.root.innerHTML;
      if (onChange) {
        onChange(html);
      }
    };

    quill.on('text-change', handleTextChange);

    // Expose quill instance via ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(quill);
      } else {
        ref.current = quill;
      }
    }

    return () => {
      quill.off('text-change', handleTextChange);
      if (ref) {
        if (typeof ref === 'function') {
          ref(null);
        } else {
          ref.current = null;
        }
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (!quillRef.current) return;
    
    const currentContent = quillRef.current.root.innerHTML;
    if (value !== currentContent) {
      isUpdatingRef.current = true;
      quillRef.current.root.innerHTML = value || '';
      isUpdatingRef.current = false;
    }
  }, [value]);

  // Update readOnly state
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly);
    }
  }, [readOnly]);

  return (
    <div style={style}>
      <div ref={containerRef} />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
