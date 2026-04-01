/* eslint-disable @next/next/no-img-element */
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FC, useState } from "react";
import { Card } from "@nextui-org/react";
import { TAudioData } from "../../editor/Audio/types";
import "./styles.scss";
import { getImageNameFromPath } from "../../editor/mappers";
import ScriptIcon from "@/assets/icons/audio_script_icon.svg";
import ScriptCloseIcon from "@/assets/icons/audio_script_close_icon.svg";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TAudioData;
  isPreview?: boolean;
};

export const AudioExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];

  const audioFile = data?.editorImages?.[0]?.file || data.editorImages?.[0];
  const audioFileName =
    audioFile?.name || getImageNameFromPath(audioFile?.path) || "";
  const [scriptIsVisible, setScriptIsVisible] = useState(false);
  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">
          {data.subtitle}
        </p>
        {!!data.description && (
          <p className="exercise-view-desc">
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        {!!audioFileName && (
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 mx-auto w-full min-w-0">
            <Card radius="md" className="p-3 sm:p-4 box-border min-w-0">
              <p
                className="text-center"
                style={{ fontWeight: 500, color: "#3F28C6" }}
              >
                {data.audioTitle || audioFileName}
              </p>
              <div className={`audio-wrapper my-4`}>
                <AudioPlayer
                  src={audioFile.dataURL || URL.createObjectURL(audioFile)}
                  customAdditionalControls={[
                    <div key={1}>
                      <div
                        onClick={() => setScriptIsVisible((s) => !s)}
                        style={{ cursor: "pointer" }}
                      >
                        {scriptIsVisible ? (
                          <Image
                            src={ScriptCloseIcon}
                            alt="toggle script icon"
                          />
                        ) : (
                          <Image src={ScriptIcon} alt="toggle script icon" />
                        )}
                      </div>
                    </div>,
                  ]}
                />
              </div>
              {scriptIsVisible && (
                <div>
                  <p className="my-2">Скрипт</p>
                  <Card
                    radius="md"
                    shadow="none"
                    className="p-4"
                    style={{
                      border: "1px solid #3F28C6",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {data.audioDescription}
                  </Card>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
