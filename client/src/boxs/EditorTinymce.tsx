import React, { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './Boxs.scss'

interface EditorTinymceProps {
  widthProps: string;
  heightProps: string;
  value: string;
  onChange: (value: string) => void;
}

export const EditorTinymce: React.FC<EditorTinymceProps> = ({ widthProps, heightProps, value, onChange }) => {
  const editorRef = useRef<any>(null);

  const insertSymbol = (symbol: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(symbol);
    }
  };

  return (
    <div style={{ width: widthProps, height: heightProps}} className='EditorTinymce'>
      {/* 심볼 버튼 */}
      <div style={{ display: 'flex'}} className='symbolBox'>
        {['♥', '♡', '★', '※', '↑', '↓', '←', '→'].map((symbol) => (
          <div className='symbolBtn'
            key={symbol}
            onClick={() => insertSymbol(symbol)}
            style={{ cursor: 'pointer', padding: '' }}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* 에디터 */}
      <Editor
        apiKey="b26hxjndqbppqzvk25qdsb1zu9x0c8gwzf2ka6cd8qwbmbi0"
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        init={{
          width: '100%',
          height: '90%',
          menubar: false,
          plugins: [
            'advlist', 'lists', 'charmap',
            'preview', 'anchor', 'searchreplace', 'visualblocks',
            'fullscreen', 'insertdatetime', 'wordcount', 'fontsize'
          ],
          toolbar:
            'blocks fontsize | bold italic underline forecolor backcolor | fullscreen',
          content_style: 'body { font-size: 14px }',
          automatic_uploads: true,
        }}
      />
    </div>
  );
};
