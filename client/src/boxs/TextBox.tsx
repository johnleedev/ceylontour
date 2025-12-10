interface TextBoxProps {
  text: string;
  text2?: string;
  textColor?: string;
  text2Color? : string;
  width : string;
  height? : number;
  fontSize?: number;
}

export const TextBox : React.FC<TextBoxProps> = ({text, text2, width, textColor, fontSize}) => (
  <div className="text"
     style={{width:`${width}`, height: '50px', textAlign:'center'}}>
    {
      text2 ? 
      <div style={{display:'flex'}}>
        <p  style={{fontSize: fontSize ? `${fontSize}px` : '13px', color: textColor ? `${textColor}` : '#333', marginBottom:'3px'}}>{text}</p>
        <p  style={{margin:'0 5px'}}>/</p>
        <p style={{fontSize: fontSize ? `${fontSize}px` : '13px'}}>{text2}</p>
      </div>
      :
      <p style={{fontSize: fontSize ? `${fontSize}px` : '13px', color: textColor ? `${textColor}` : '#333'}}>{text}</p>
    }
    
  </div>
)
