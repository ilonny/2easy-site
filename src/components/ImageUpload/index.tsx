import Image from "next/image";
import { FC, useMemo, useState } from "react";
import ReactImageUploading, { ImageListType } from "react-images-uploading";
import Bg from "@/assets/images/image_upload_placeholder.png";
import BgWeb from "@/assets/images/web_search_image_placeholder.png";
import Loupe from "@/assets/icons/loupe.svg";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Spinner,
} from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { getImageNameFromPath } from "@/app/editor/components/editor/mappers";
import { fetchPostJson } from "@/api";

type TProps = {
  label?: string;
  isMultiple?: boolean;
  images: ImageListType;
  setImages: (images: ImageListType) => void;
  initialImages?: string[];
  customPlaceHolder?: JSX.Element;
  onlyPlaceholder?: boolean;
  maxNumber?: number;
  isButton?: boolean;
  title?: string;
  acceptType?: string[];
  fullWidth?: boolean;
  whiteBg?: boolean;
  withInternetSearch?: boolean; // Новый проп
};

export const ImageUpload: FC<TProps> = ({
  label,
  isMultiple = false,
  images,
  setImages,
  customPlaceHolder,
  onlyPlaceholder,
  maxNumber = 12,
  isButton,
  title,
  acceptType = ["jpg", "png", "jpeg", "gif", "webp", "svg"],
  fullWidth,
  whiteBg,
  withInternetSearch = true,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined,
  ) => {
    setImages(imageList);
  };

  const handleInternetSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      // Использование вашей функции fetchPostJson
      const response = await fetchPostJson({
        path: "/search-images/search",
        isSecure: true,
        data: {
          query: searchQuery,
        },
      });
      const data = await response.json();
      // Предполагаем, что ответ это string[]
      setSearchResults(data.images || []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectImage = (url: string) => {
    if (isMultiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const onConfirmSelection = () => {
    const newImages: ImageListType = selectedUrls.map((url) => ({
      dataURL: url,
    }));

    if (isMultiple) {
      setImages([...images, ...newImages] as never[]);
    } else {
      setImages(newImages as never[]);
    }
    onOpenChange(); // Закрыть модалку
    setSelectedUrls([]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const showPlaceholder = useMemo(() => {
    if (isMultiple || onlyPlaceholder) return true;
    if (!isMultiple && images.length) return false;
    return true;
  }, [isMultiple, images, onlyPlaceholder]);

  const firstImage = images?.[0];

  return (
    <div className="App" style={{ width: fullWidth ? "100%" : "initial" }}>
      <ReactImageUploading
        multiple={isMultiple}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        acceptType={acceptType}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div
            className="upload__image-wrapper relative"
            style={{ width: fullWidth ? "100%" : "initial" }}
          >
            {!!label && <p className="mb-3">{label}</p>}

            {showPlaceholder && (
              <div className="w-full flex flex-wrap gap-4 flex-row w-[100%]">
                {withInternetSearch && !isButton && (
                  <>
                    {/* <Image
                      src={BgWeb}
                      alt="placeholder"
                      width={170}
                      height={170}
                      style={{ cursor: "pointer" }}
                      onClick={onOpen}
                    /> */}
                    <div
                      style={{
                        background: "#fff",
                        // height: 200,
                        borderRadius: 10,
                        flexShrink: 0,
                        flex: 1,
                        cursor: "pointer",
                      }}
                      className="flex items-center justify-center flex-col gap-4 w-[47%]"
                      onClick={onOpen}
                    >
                      <Image
                        src={Loupe}
                        alt="GalleryIcon"
                        className="w-[60px] h-[60px]"
                      />
                      <p
                        className="text-small text-center max-w-[250px]"
                        style={{ color: "#B7B7B7" }}
                      >
                        Найти изображение
                        <br />в интернете
                      </p>
                    </div>
                  </>
                )}
                <div style={{ flex: 1 }}>
                  <button
                    style={isDragging ? { color: "red" } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                    type="button"
                  >
                    {customPlaceHolder ? (
                      customPlaceHolder
                    ) : isButton ? (
                      <Button
                        onClick={onImageUpload}
                        {...dragProps}
                        variant="light"
                        className={`${!fullWidth && "w-[375px]"} bg-white`}
                        size="lg"
                        color="primary"
                      >
                        <div className="flex justify-between items-center w-[100%]">
                          <div />
                          <p className="truncate px-2">
                            {firstImage
                              ? firstImage.file?.name ||
                                getImageNameFromPath(firstImage?.path)
                              : title || "Добавить картинку"}
                          </p>
                          <div
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onImageRemove(0);
                            }}
                          >
                            {!!firstImage && (
                              <Image priority={false} src={Close} alt="close" />
                            )}
                          </div>
                        </div>
                      </Button>
                    ) : (
                      <Image
                        src={Bg}
                        alt="placeholder"
                        width={170}
                        height={170}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {!onlyPlaceholder && (
              <div className="flex gap-4 mt-4 flex-wrap">
                {imageList.map((image, index) => (
                  <div key={index} className="image-item relative">
                    <img
                      src={image.dataURL}
                      alt=""
                      className="object-cover rounded-lg"
                      width={170}
                      height={170}
                    />
                    <div className="image-item__btn-wrapper top-1 right-1 absolute">
                      <Button
                        isIconOnly
                        size="sm"
                        onClick={() => onImageRemove(index)}
                        variant="flat"
                        color="danger"
                        className="rounded-full min-w-unit-6 w-6 h-6"
                      >
                        <Image
                          priority={false}
                          src={Close}
                          alt="close"
                          width={12}
                          height={12}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ReactImageUploading>

      {/* Модальное окно поиска */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Поиск фотографий
              </ModalHeader>
              <ModalBody>
                <div className="flex gap-2">
                  <Input
                    placeholder="Что ищем? (например: cats)"
                    value={searchQuery}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleInternetSearch()
                    }
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    color="primary"
                    onClick={handleInternetSearch}
                    isLoading={isSearching}
                  >
                    Найти
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  {isSearching ? (
                    <div className="col-span-3 flex justify-center py-10">
                      <Spinner />
                    </div>
                  ) : (
                    searchResults.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                          selectedUrls.includes(url)
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => toggleSelectImage(url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="search result"
                          className="w-full h-[150px] object-contain"
                        />
                        {selectedUrls.includes(url) && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-white rounded-full p-1 w-[32px] h-[32px] flex items-center justify-center">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button
                  color="primary"
                  isDisabled={selectedUrls.length === 0}
                  onPress={onConfirmSelection}
                >
                  Добавить ({selectedUrls.length})
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
