"use client";
import React from "react";
import { Button } from "@nextui-org/react";
import { FillGapsSelectExView } from "../../../view/FillGapsSelectExView";

/**
 * Компонент Preview
 *
 * Отображает превью упражнения в режиме просмотра и кнопку для сохранения.
 *
 * Функциональность:
 * - Показывает предварительный просмотр упражнения (как оно будет выглядеть для учащегося)
 * - Использует компонент FillGapsSelectExView для отображения
 * - Кнопка "Сохранить" отправляет данные на сервер через saveFillGapsSelectEx
 * - Показывает состояние загрузки (loading) во время сохранения
 *
 * Стиль:
 * - Превью обведено в рамку с фиолетовым цветом (#3F28C6)
 * - Кнопка займает минимальную ширину 310px
 * - Макет: превью сверху, кнопка снизу по центру
 */
type TProps = {
  /** Данные упражнения для отображения и сохранения */
  data: any;
  /** Флаг загрузки (true во время отправки на сервер) */
  isLoading: boolean;
  /** Функция для отправки данных упражнения на сервер */
  saveFillGapsSelectEx: (data: any) => void;
};

export const Preview: React.FC<TProps> = ({ data, isLoading, saveFillGapsSelectEx }) => {
  return (
    <div>
      <p className="font-light mb-2">Превью</p>
      <div
        style={{
          border: "1px solid #3F28C6",
          borderRadius: 4,
          background: "#fff",
        }}
      >
        <FillGapsSelectExView isPreview={true} data={data} />
      </div>
      <div className="h-5" />
      <div className="flex justify-center">
        <Button
          color="primary"
          className="min-w-[310px]"
          size="lg"
          onClick={() => saveFillGapsSelectEx(data)}
          isLoading={isLoading}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default Preview;
