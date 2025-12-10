import React from "react";

interface Props {
  className: any;
}

export const Icon = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`icon ${className}`}
      fill="none"
      height="15"
      viewBox="0 0 16 15"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M0.75 14V2.47058H14.75V14H0.75Z"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M5.125 0L5.125 2.47059"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M10.375 0L10.375 2.47059"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M0.75 5.76477H14.75"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M3.375 8.64709H5.5625"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M3.375 10.7058H5.5625"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M6.875 8.64709H9.0625"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M6.875 10.7058H9.0625"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M10.375 8.64709H12.5625"
        stroke="#333333"
        strokeWidth="1.5"
      />

      <path
        className="path"
        d="M10.375 10.7058H12.5625"
        stroke="#333333"
        strokeWidth="1.5"
      />
    </svg>
  );
};
