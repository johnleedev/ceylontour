interface TextBoxProps {
  text: string | null;
  text2?: string;
  width : string;
  height? : number;
  fontSize?: number;
  justify?: string;
}

export const TextBoxPL10 : React.FC<TextBoxProps> = ({text, text2, width, height, fontSize, justify }) => (
  <div className="text"
     style={{width:`${width}`, height: height ? `${height}px` : '30px', justifyContent: justify ?? 'flex-start', padding: '0 10px'}}>
    {
      text2 ? 
      <div>
        <p  style={{fontSize: fontSize ? `${fontSize}px` : '14px', color:'#1e99d6', marginBottom:'3px'}}>{text}</p>
        <p style={{fontSize: fontSize ?`${fontSize}px` : '14px'}}>{text2}</p>
      </div>
      :
      <p style={{fontSize: fontSize ? `${fontSize}px` : '14px'}}>{text}</p>
    }
    
  </div>
)
