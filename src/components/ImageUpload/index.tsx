import Image from "next/image";
import { FC, useMemo } from "react";
import ReactImageUploading, { ImageListType } from "react-images-uploading";
import Bg from "@/assets/images/image_upload_placeholder.png";
import { Button } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { getImageNameFromPath } from "@/app/editor/components/editor/mappers";

type TProps = {
  label?: string;
  isMultiple?: boolean;
  images: ImageListType;
  setImages: any;
  initialImages?: string[];
  customPlaceHolder?: JSX.Element;
  onlyPlaceholder?: boolean;
  maxNumber?: number;
  isButton?: boolean;
  title?: string;
  acceptType?: string[];
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
  acceptType,
}) => {
  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    console.log("onchange", imageList);
    // data for submit
    setImages(imageList as never[]);
  };

  const showPlaceholder = useMemo(() => {
    if (isMultiple || onlyPlaceholder) {
      return true;
    }
    if (!isMultiple && images.length) {
      return false;
    }
    return true;
  }, [isMultiple, images, onlyPlaceholder]);

  const firstImage = images?.[0];
  return (
    <div className="App">
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
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper relative">
            {!!label && <p className="mb-3">{label}</p>}
            {showPlaceholder && (
              <button
                style={isDragging ? { color: "red" } : undefined}
                onClick={onImageUpload}
                {...dragProps}
                type="button"
                className="w-full"
              >
                {customPlaceHolder ? (
                  customPlaceHolder
                ) : (
                  <>
                    {isButton ? (
                      <>
                        <Button
                          onClick={onImageUpload}
                          {...dragProps}
                          variant="faded"
                          className="w-[375px]"
                          size="lg"
                          color="primary"
                        >
                          <div className="flex justify-between items-center w-[100%]">
                            <div></div>
                            <p
                              className="text-center"
                              style={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
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
                                <Image
                                  priority={false}
                                  src={Close}
                                  alt="close"
                                />
                              )}
                            </div>
                          </div>
                        </Button>
                      </>
                    ) : (
                      <Image
                        src={Bg}
                        alt="placeholder"
                        width={170}
                        height={170}
                      />
                    )}
                  </>
                )}
              </button>
            )}
            {!onlyPlaceholder && (
              <div className="flex gap-10">
                {imageList.map((image, index) => (
                  <div key={index} className="image-item relative">
                    <img src={image.dataURL} alt="" width={170} height={170} />
                    <div className="image-item__btn-wrapper top-0 right-0 absolute">
                      <Button
                        isIconOnly
                        onClick={() => onImageRemove(index)}
                        variant="flat"
                      >
                        <Image priority={false} src={Close} alt="close" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ReactImageUploading>
    </div>
  );
};
