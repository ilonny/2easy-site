import Image from "next/image";
import { FC, useMemo } from "react";
import ReactImageUploading, { ImageListType } from "react-images-uploading";
import Bg from "@/assets/images/image_upload_placeholder.png";
import { Button } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";

type TProps = {
  label?: string;
  isMultiple?: boolean;
  images: ImageListType;
  setImages: any;
  initialImages?: string[];
};

export const ImageUpload: FC<TProps> = ({
  label,
  isMultiple = false,
  images,
  setImages,
}) => {
  const maxNumber = 69;

  const onChange = (
    imageList: ImageListType,
    addUpdateIndex: number[] | undefined
  ) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList as never[]);
  };

  const showPlaceholder = useMemo(() => {
    if (isMultiple) {
      return true;
    }
    if (!isMultiple && images.length) {
      return false;
    }
    return true;
  }, [isMultiple, images]);
  console.log('images?', images)
  return (
    <div className="App">
      <ReactImageUploading
        multiple={isMultiple}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
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
              >
                <Image src={Bg} alt="placeholder" width={170} height={170} />
              </button>
            )}
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
          </div>
        )}
      </ReactImageUploading>
    </div>
  );
};
