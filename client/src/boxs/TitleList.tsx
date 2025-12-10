interface TitleBoxProps {
  text: string;
  fontSize? : number;
  width : string;
  height? : number;
  backgroundColor? : string;
}

export const TitleList : React.FC<TitleBoxProps> = ({text, fontSize, width, height, backgroundColor }) => (
  <th className="titlelist" 
    style={{width:`${width}`, height: height ? `${height}px` : '45px', backgroundColor: backgroundColor}}
  >
    <h3 style={{fontSize : fontSize ?? '14px' }}>{text}</h3>
  </th>
)
