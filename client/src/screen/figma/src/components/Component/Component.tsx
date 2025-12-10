import React from "react";
import { Icon } from "../../icons/Icon";
import "./style.scss";

interface Props {
  className: any;
}

export const Component = ({ className }: Props): JSX.Element => {
  return (
    <div className={`component ${className}`}>
      <div className="rectangle" />

      <div className="div" />

      <div className="rectangle-2" />

      <div className="text-wrapper">상세일정</div>

      <div className="text-wrapper-2">항공</div>

      <div className="text-wrapper-3">식사</div>

      <div className="text-wrapper-4">계약특전</div>

      <div className="rectangle-3" />

      <div className="text-wrapper-5">2025-03-02(일)</div>

      <div className="text-wrapper-6">선택된 세부일정 제목</div>

      <div className="rectangle-4" />

      <div className="group">
        <div className="rectangle-5" />

        <div className="text-wrapper-7">선택상품</div>
      </div>

      <div className="rectangle-6" />

      <div className="group-2">
        <div className="rectangle-7" />

        <div className="text-wrapper-8">2명</div>
      </div>

      <div className="text-wrapper-9">+</div>

      <div className="text-wrapper-10">￦ 50,000</div>

      <div className="text-wrapper-11">날짜</div>

      <Icon className="icon-instance" />
      <div className="text-wrapper-12">/1인</div>

      <img className="vector" alt="Vector" src="/img/vector-137.svg" />

      <div className="text-wrapper-13">총요금</div>

      <div className="h">
        <div className="h-2">￦100,000</div>
      </div>

      <div className="frame">
        <div className="text-wrapper-14">익스커션</div>

        <div className="rectangle-8" />

        <div className="text-wrapper-15">강습/클래스</div>

        <div className="rectangle-8" />

        <div className="text-wrapper-15">스파/마사지</div>

        <div className="rectangle-8" />

        <div className="text-wrapper-15">스냅촬영</div>

        <div className="rectangle-8" />

        <div className="text-wrapper-15">차량/가이드</div>

        <div className="rectangle-8" />

        <div className="text-wrapper-15">편의사항</div>
      </div>

      <div className="text-wrapper-16">1일차</div>

      <div className="rectangle-9" />

      <div className="rectangle-10" />

      <div className="rectangle-11" />

      <div className="rectangle-12" />

      <img className="image" alt="Image" src="/img/image.png" />

      <p className="p">단독차량 투어 파리 완전 개인일정 차량 가이드</p>

      <p className="text-wrapper-17">파리시내 및 근교 맞춤투어 VIP가이드</p>

      <div className="text-wrapper-18">
        단독 프라이빗투어, 공항픽업+야경투어
      </div>

      <p className="text-wrapper-19">
        단독차량 투어 파리 완전 개인일정 차량 가이드
      </p>

      <div className="group-3">
        <div className="text-wrapper-20">50,000 원</div>

        <div className="text-wrapper-21">/1인</div>
      </div>

      <div className="group-4">
        <div className="text-wrapper-20">50,000 원</div>

        <div className="text-wrapper-21">/1인</div>
      </div>

      <div className="group-5">
        <div className="text-wrapper-20">50,000 원</div>

        <div className="text-wrapper-21">/1인</div>
      </div>

      <div className="group-6">
        <div className="text-wrapper-20">50,000 원</div>

        <div className="text-wrapper-21">/1인</div>
      </div>

      <img className="img" alt="Image" src="/img/image-1.png" />

      <img className="image-2" alt="Image" src="/img/image-2.png" />

      <img className="image-3" alt="Image" src="/img/image-3.png" />

      <img className="image-4" alt="Image" src="/img/image-29.png" />

      <img className="image-5" alt="Image" src="/img/image-29.png" />

      <img className="image-6" alt="Image" src="/img/image-29.png" />

      <img className="image-7" alt="Image" src="/img/image-29.png" />

      <div className="group-7">
        <img className="vector-2" alt="Vector" src="/img/vector-315.svg" />

        <img className="vector-2" alt="Vector" src="/img/vector-316.svg" />
      </div>
    </div>
  );
};
