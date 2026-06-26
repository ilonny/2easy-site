# Правила написания кода — 2easy-site

Документ описывает принятые в проекте соглашения. Новый код должен выглядеть так, будто его написал автор существующей кодовой базы.

---

## Перед началом большой задачи

1. **Изучи существующую структуру:** `src/app`, `src/components`, `src/api`, hooks, auth, i18n.
2. **Определи соглашения:** нейминг, паттерны модалок, hooks, работа с API, роли, i18n.
3. **Найди похожий модуль** и используй как образец (см. «Эталонные модули»).
4. **Не придумывай новую архитектуру** — нет отдельного service layer, Redux, feature-sliced design.
5. **Не создавай новые паттерны**, если аналог уже есть (модалка, hook, список с чекбоксами).
6. **Не меняй стиль существующего кода** в несвязанных файлах.
7. **Минимизируй scope** — точечный diff лучше массового рефакторинга.

---

## Стек

| Технология | Назначение |
|------------|------------|
| Next.js 14 (App Router) | Роутинг, SSR/CSR |
| React 18 | UI |
| NextUI | Компоненты (Modal, Button, Input, …) |
| Tailwind CSS | Utility-классы |
| react-hook-form | Формы в модалках |
| react-i18next + `<T />` | Локализация |
| react-toastify | Уведомления |

React Query подключён (`ApiProvider`), но **большинство фич** используют `useState` + `useCallback` + прямые fetch.

---

## Структура папок

```
src/
├── app/                    # Next.js routes + feature modules
│   ├── {feature}/
│   │   ├── page.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   └── layout.tsx
├── components/             # общие компоненты (Header, Chat, VideoCall)
├── api/index.tsx           # fetchGet, fetchPostJson, checkResponse
├── auth/                   # AuthContext, withLogin, types
├── i18n/                   # config, T.tsx, locales/ru.json, en.json
├── hooks/                  # редкие общие hooks
└── ui/                     # простые обёртки (Panel, Title, Button)
```

**Новая фича** — colocation в `src/app/{feature}/`:

```
src/app/dictionary/
├── types/index.ts
├── hooks/useDictionary.ts
└── components/DictionaryModal/index.tsx
```

Не создавай `src/services/` или `src/store/` — так в проекте не принято.

---

## Страницы

```tsx
"use client";

import { withLogin } from "@/auth/hooks/withLogin";

export default function SomePage() {
  withLogin();
  // ...
}
```

- Клиентские страницы с auth — `"use client"` + `withLogin()`.
- Роли:

```typescript
const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
const isStudent = profile?.isStudent;
```

- Импорты — алиас `@/` → `src/` (см. `tsconfig.json`).

---

## API-слой

Всё через `src/api/index.tsx`:

```typescript
import { fetchGet, fetchPostJson, fetchPatch, fetchDelete } from "@/api";

const res = await fetchGet({ path: "/lessons", isSecure: true });
const data = await res?.json();
```

| Helper | Когда |
|--------|-------|
| `fetchGet` | GET |
| `fetchPostJson` | POST с JSON body |
| `fetchPatch` | PATCH |
| `fetchDelete` | DELETE с JSON body |
| `fetchPostMultipart` | Загрузка файлов |

- `isSecure: true` → заголовок `Authorization: Bearer <token>`.
- `BASE_URL` / `API_URL` — из `src/api/index.tsx` (перед деплоем проверь env).

### Обработка ответов

**Два типа API:**

1. **Legacy** — `{ success: true/false, message }` → `checkResponse(data)`.
2. **Новые** (dictionary, translate, languages) — без `success` → проверяй `res.ok`, ошибки через toast:

```typescript
if (!res?.ok) {
  const err = await res.json();
  toast(err?.message || "Что-то пошло не так", { type: "error" });
  return null;
}
```

Не используй `checkResponse` для API без поля `success`.

---

## Hooks

Образец — `src/app/lessons/hooks/useLessons.ts`, `src/app/dictionary/hooks/useDictionary.ts`:

```typescript
export const useSomething = (id?: number) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchGet({ path: `/something/${id}`, isSecure: true });
      // ...
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { items, isLoading, getItems };
};
```

- Hook рядом с фичей: `src/app/{feature}/hooks/`.
- Loading state в hook, не в каждом компоненте отдельно.
- Domain types — `src/app/{feature}/types/index.ts`, префикс `T`: `TDictionaryItem`, `TLesson`.

---

## Компоненты и модалки

### Модалка CRUD

Образец — `DeleteLessonModalForm`, `CreateLessonModalForm`:

```tsx
type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
};

export const SomeModalForm: FC<TProps> = ({ isVisible, setIsVisible, onSuccess }) => {
  // react-hook-form для форм с валидацией
  // NextUI Modal + ModalContent + ModalHeader + ModalBody
};
```

- Props: `isVisible` / `isOpen` + setter (в проекте встречаются оба — **повторяй соседний компонент домена**).
- Подтверждение удаления — отдельная модалка с `color="danger"`.
- Крупные модалки — `size="3xl"`, `scrollBehavior="inside"`.

### Popover / bulk actions

Образец — `LessonCard` (Popover + кнопки действий).

### Списки с выбором

Образец — `CreateCourseModalForm` (чекбоксы + scrollable list).

---

## UI и стиль

- **NextUI** — основная библиотека; не подключай MUI/Ant без необходимости.
- **Tailwind** — layout, spacing; inline `style={{}}` допустим там, где уже используется (урок, VideoCall).
- **Иконки** — SVG из `src/assets/icons/` или inline SVG как в `VideoCall`.
- **Цвет primary** — `#3F28C6`, фон выделения — `#eeebff` (как в LessonCard, dictionary).
- Кнопки действий на уроке (Видеосвязь, Чат, Словарь):

```tsx
<Button color="primary" variant="light" size="lg" style={{ minWidth: 300 }} endContent={<Icon />}>
```

---

## i18n

1. Добавь ключи в **оба** файла: `src/i18n/locales/ru.json`, `en.json`.
2. В JSX:

```tsx
<T k="dictionary.tab" defaultText="Словарь" />
<T k="lessons.deleteLessonConfirm" values={{ title }} />
```

3. Вне JSX / placeholder:

```typescript
import i18n from "@/i18n/config";
i18n.t("dictionary.searchPlaceholder");
```

- Не хардкодь пользовательские строки на русском без ключей (допустимы `defaultText` у `<T />`).
- Вложенность ключей: `dictionary.tab`, `lessons.lessonsTab`, `common.save`.

---

## Auth и redirect

- `AuthContext` — `profile`, `isStudent`, `studentId`, `role_id`.
- `BodyContainer` — редирект ученика на `/student-account/{id}` (учитывай новые routes при добавлении страниц).
- Стudent cabinet: `/student-account/[id]`, урок: `/lessons/[id]`.

---

## Нейминг

| Сущность | Стиль | Пример |
|----------|-------|--------|
| Компоненты | PascalCase | `DictionaryModal` |
| Файлы компонентов | `index.tsx` в папке | `DictionaryModal/index.tsx` |
| Hooks | camelCase, `use` | `useDictionary` |
| Types | `T` + PascalCase | `TDictionaryItem` |
| Props type | `TProps` | локально в файле |
| Query/body к API | camelCase | `isLearned`, `lessonId` |

---

## TypeScript

- `strict: true` в tsconfig.
- `@ts-ignore` — допустим, если так уже сделано рядом (studentId props и т.п.).
- Не гонись за идеальной типизацией `any` в legacy-коде; новый код в новой фиче — типизируй.

---

## Эталонные модули

| Задача | Смотри |
|--------|--------|
| Hook + API | `src/app/lessons/hooks/useLessons.ts` |
| Hook без `success` | `src/app/dictionary/hooks/useDictionary.ts` |
| Модалка + form | `src/app/lessons/components/CreateLessonModalForm` |
| Confirm delete | `src/app/lessons/components/DeleteLessonModalForm` |
| Popover actions | `src/app/lessons/components/LessonCard` |
| Checkbox list | `src/app/lessons/components/CreateCourseModalForm` |
| Student cabinet tabs | `src/app/lessons/components/ProfileLessons` |
| Lesson page overlays | `src/app/lessons/[id]/page.tsx`, `VideoCall`, `Chat` |
| Text selection widget | `src/app/editor/components/editor/AddItemCard` |
| i18n | `src/i18n/T.tsx`, `locales/ru.json` |
| API transport | `src/api/index.tsx` |

---

## Чего не делать

- Не добавлять axios-обёртки / RTK Query / Zustand без запроса.
- Не создавать `src/services/dictionaryApi.ts`, если достаточно hook + `fetchGet`.
- Не хардкодить `BASE_URL` на localhost в коммите (используй env).
- Не дублировать модалки — переиспользуй или прокидывай props.
- Не менять глобальный layout/Header ради одной фичи.
- Не писать пользовательский текст без i18n-ключей.

---

## Чеклист перед PR

- [ ] `"use client"` там, где нужны hooks/events
- [ ] Строки в `ru.json` и `en.json`
- [ ] API: правильный helper + `isSecure` + обработка ошибок
- [ ] Роли ученик/учитель проверены
- [ ] UI в стиле NextUI + существующих экранов
- [ ] `npm run build` проходит
