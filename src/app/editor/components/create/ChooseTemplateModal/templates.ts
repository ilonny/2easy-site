import TextDefaultBg from "@/assets/images/text_default_bg.png";
import Text2ColBg from "@/assets/images/text_2_col_bg.png";
import TextStickerBg from "@/assets/images/text_sticker_bg.png";
import TextChecklistBg from "@/assets/images/text_checklist_bg.png";
// Старое «Заполнить пропуски» (подтипы) — временно отключено
// import FillGapsDragBg from "@/assets/images/fill_gaps_drag_bg.png";
// import FillGapsSelectBg from "@/assets/images/fill_gaps_select_bg.png";
// import FillGapsInputBg from "@/assets/images/fill_gaps_input_bg.png";
import MatchWordWordBg from "@/assets/images/match_word_word_bg.png";
import MatchWordImageBg from "@/assets/images/match_word_image_bg.png";
import MatchWordColumnBg from "@/assets/images/match_word_column_bg.png";
import ImageBg from "@/assets/images/image_template_bg.png";
import VideoBg from "@/assets/images/video_template_bg.png";
import AudioBg from "@/assets/images/audio_template_bg.png";
import NoteBg from "@/assets/images/note_template_bg.png";
import FillGapsBg from "@/assets/images/fill_gaps_template_bg.png";
import TextBg from "@/assets/images/text_template_bg.png";
import MatchBg from "@/assets/images/match_template_bg.png";
import TestBg from "@/assets/images/test_template_bg.png";
import FreeFormBg from "@/assets/images/free_form_template_bg.png";
import IntTemplateBg from "@/assets/images/int_template_bg.png";
import { StaticImageData } from "next/image";

export type TTemplate = {
  type: string;
  titleKey: string;
  titleDefault?: string;
  bgImage?: StaticImageData;
  descriptionKey?: string;
  descriptionDefault?: string;
  subTemplates?: TTemplate[];
  subItems?: TTemplate[];
};

export const templates: TTemplate[] = [
  {
    type: "text",
    titleKey: "templates.text",
    titleDefault: "Текст",
    descriptionKey: "editor.templates.textGroupDesc",
    descriptionDefault: "Статьи, вопросы и другие текстовые блоки",
    bgImage: TextBg,
    subItems: [
      {
        type: "text-default",
        titleKey: "templates.text",
        titleDefault: "Текст",
        bgImage: TextDefaultBg,
      },
      {
        type: "text-2-col",
        titleKey: "templates.text2Col",
        titleDefault: "Текст в 2 колонки",
        bgImage: Text2ColBg,
      },
      {
        type: "text-sticker",
        titleKey: "templates.textSticker",
        titleDefault: "Текст на стикерах",
        bgImage: TextStickerBg,
      },
      {
        type: "text-checklist",
        titleKey: "templates.textChecklist",
        titleDefault: "Чек-лист",
        bgImage: TextChecklistBg,
      },
    ],
  },
  {
    type: "image",
    titleKey: "templates.images",
    titleDefault: "Изображения",
    descriptionKey: "editor.templates.imagesDesc",
    descriptionDefault: "jpg, png, gif, webp",
    bgImage: ImageBg,
  },
  {
    type: "video",
    titleKey: "templates.video",
    titleDefault: "Видео",
    descriptionKey: "editor.templates.videoDesc",
    descriptionDefault: "mp4, mov, webm",
    bgImage: VideoBg,
  },
  {
    type: "audio",
    titleKey: "templates.audio",
    titleDefault: "Аудио",
    descriptionKey: "editor.templates.audioDesc",
    descriptionDefault: "mp3, wav, m4a",
    bgImage: AudioBg,
  },
  {
    type: "note",
    titleKey: "templates.note",
    titleDefault: "Заметка",
    descriptionKey: "editor.templates.noteDesc",
    descriptionDefault: "for teachers only",
    bgImage: NoteBg,
  },
  // Старое упражнение «Заполнить пропуски» (drag/select/input) — временно скрыто из конструктора
  // {
  //   type: "fill_gaps",
  //   title: "Заполнить пропуски",
  //   description: "Перетащить, вписать или выбрать правильное слово",
  //   bgImage: FillGapsBg,
  //   subItems: [
  //     {
  //       type: "fill-gaps-drag",
  //       title: "Перетащить слово из списка",
  //       bgImage: FillGapsDragBg,
  //     },
  //     {
  //       type: "fill-gaps-select",
  //       title: "Выбрать вариант из списка",
  //       bgImage: FillGapsSelectBg,
  //     },
  //     {
  //       type: "fill-gaps-input",
  //       title: "Вписать слово в пропуск",
  //       bgImage: FillGapsInputBg,
  //     },
  //   ],
  // },
  {
    type: "FILL_GAPS_NEW",
    titleKey: "templates.fillGapsNew",
    titleDefault: "ЗАПОЛНИТЬ ПРОПУСКИ",
    descriptionKey: "editor.templates.fillGapsNewDesc",
    descriptionDefault:
      "Пропуски с вариантами ответов, форматированием и тремя режимами",
    bgImage: FillGapsBg,
  },
  {
    type: "test",
    titleKey: "templates.test",
    titleDefault: "Тест",
    descriptionKey: "editor.templates.testDesc",
    descriptionDefault: "Выбрать правильный вариант из предложенных",
    bgImage: TestBg,
  },
  {
    type: "match_words",
    titleKey: "editor.templates.matchGroup",
    titleDefault: "Мэтч",
    descriptionKey: "editor.templates.matchGroupDesc",
    descriptionDefault: "Сопоставить слово с картинкой или определением",
    bgImage: MatchBg,
    subItems: [
      {
        type: "match-word-word",
        titleKey: "templates.matchWordWord",
        titleDefault: "Match слова с определением",
        bgImage: MatchWordWordBg,
      },
      {
        type: "match-word-image",
        titleKey: "templates.matchWordImage",
        titleDefault: "Match слова с изображением",
        bgImage: MatchWordImageBg,
      },
      {
        type: "match-word-column",
        titleKey: "templates.matchWordColumn",
        titleDefault: "Расставить слова по колонкам",
        bgImage: MatchWordColumnBg,
      },
    ],
  },
  {
    type: "free-input-form",
    titleKey: "templates.freeInput",
    titleDefault: "Поле для ввода текста",
    descriptionKey: "editor.templates.freeInputDesc",
    descriptionDefault: "Пустое поле для ответов ученика",
    bgImage: FreeFormBg,
  },
  {
    type: "int",
    titleKey: "templates.integrations",
    titleDefault: "Интеграции",
    descriptionKey: "editor.templates.integrationsDesc",
    descriptionDefault: "Miro, Google Drive, Wordwall, Genially, Quizlet, etc",
    bgImage: IntTemplateBg,
  },
];
